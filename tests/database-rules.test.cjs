const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { get, ref, set, update, remove, onValue, serverTimestamp, goOffline, goOnline } = require('firebase/database');
const load = require('./load-service.cjs');
const model = load('chatModel');

test('RTDB security and two-user realtime flow', { timeout: 90000 }, async t => {
  const [host, port] = (process.env.FIREBASE_DATABASE_EMULATOR_HOST || '127.0.0.1:9000').split(':');
  const env = await initializeTestEnvironment({
    projectId: 'demo-thapp2', database: { host, port: Number(port), rules: fs.readFileSync('database.rules.json', 'utf8') },
  });
  try {
    await env.clearDatabase();
    const alice = env.authenticatedContext('alice', { email: 'alice@example.com' }).database();
    const bob = env.authenticatedContext('bob', { email: 'bob@example.com' }).database();
    const eve = env.authenticatedContext('eve', { email: 'eve@example.com' }).database();
    const anonymous = env.unauthenticatedContext().database();
    const services = db => load('chatService', { './firebase': { getFirebase: () => ({ db }) }, './chatModel': model });
    const a = services(alice), b = services(bob);
    await t.test('own profile only; guests cannot list users', async () => {
      await assertSucceeds(set(ref(alice, 'users/alice'), { name: 'An', email: 'alice@example.com' }));
      await assertSucceeds(set(ref(bob, 'users/bob'), { name: 'Bình', email: 'bob@example.com' }));
      await assertSucceeds(set(ref(eve, 'users/eve'), { name: 'Eve', email: 'eve@example.com' }));
      await assertFails(set(ref(alice, 'users/bob/name'), 'Fake'));
      await assertFails(set(ref(alice, 'users/alice/email'), 'fake@example.com'));
      await assertFails(get(ref(anonymous, 'users')));
      const users = await get(ref(bob, 'users'));
      assert.equal(Object.keys(users.val()).length, 3);
    });
    let firstKey;
    await t.test('service creates membership and both indexes; real listener receives a message', async () => {
      const id = model.conversationId('alice', 'bob');
      const delivery = new Promise((resolve, reject) => {
        const timer = setTimeout(() => { stop(); reject(Error('realtime delivery timeout')); }, 10000);
        const stop = b.observeChat(id, data => {
          if (Object.keys(data?.messages || {}).length === 1) {
            clearTimeout(timer); stop(); resolve(data);
          }
        }, reject);
      });
      firstKey = await a.sendMessage('alice', 'bob', { text: ' Xin chào Bình ' });
      const data = await delivery;
      assert.equal(data.messages[firstKey].text, 'Xin chào Bình');
      assert.equal(data.messages[firstKey].senderId, 'alice');
      assert.equal(model.unreadCount(data.messages, 'bob'), 1);
      assert.equal((await get(ref(bob, `userChats/bob/${id}`))).val(), true);
      assert.equal((await get(ref(alice, `userChats/alice/${id}`))).val(), true);
    });
    await t.test('concurrent sends retain both messages and cannot regress read marker', async () => {
      const id = 'alice__bob';
      await b.markRead(id, 'bob', firstKey);
      const [aliceKey, bobKey] = await Promise.all([
        a.sendMessage('alice', 'bob', { text: 'Tin thứ hai' }),
        b.sendMessage('bob', 'alice', { type: 'location', latitude: 10.8, longitude: 106.7 }),
      ]);
      const data = (await get(ref(bob, `conversations/${id}`))).val();
      assert.equal(Object.keys(data.messages).length, 3);
      assert.equal(model.unreadCount(data.messages, 'bob', data.reads.bob), 1);
      assert.equal(data.messages[bobKey].type, 'location');
      const latest = [aliceKey, bobKey].sort().pop();
      await b.markRead(id, 'bob', latest);
      await b.markRead(id, 'bob', firstKey);
      assert.equal((await get(ref(bob, `conversations/${id}/reads/bob`))).val(), latest);
      assert.equal(model.unreadCount(data.messages, 'bob', latest), 0);
    });
    await t.test('private chats, immutable messages/members, own read marker only', async () => {
      await assertFails(get(ref(eve, 'conversations/alice__bob')));
      await assertFails(get(ref(eve, 'conversations')));
      await assertFails(get(ref(eve, 'userChats/alice')));
      await assertFails(set(ref(eve, 'userChats/eve/alice__bob'), true));
      await assertFails(set(ref(alice, 'userChats/eve/alice__bob'), true));
      await assertFails(set(ref(alice, 'conversations/alice__bob/memberB'), 'eve'));
      await assertFails(set(ref(alice, `conversations/alice__bob/messages/${firstKey}/text`), 'edited'));
      await assertFails(remove(ref(alice, `conversations/alice__bob/messages/${firstKey}`)));
      await assertFails(set(ref(alice, 'conversations/alice__bob/reads/bob'), firstKey));
      await assertFails(set(ref(alice, 'conversations/alice__bob/reads/alice'), 'not-a-message'));
    });
    await t.test('reject forged sender, whitespace-only text and out-of-range GPS', async () => {
      const base = { senderId: 'alice', recipientId: 'bob', type: 'text', text: 'Hi', createdAt: serverTimestamp() };
      await assertFails(set(ref(alice, 'conversations/alice__bob/messages/forged'), { ...base, senderId: 'bob' }));
      await assertFails(set(ref(alice, 'conversations/alice__bob/messages/empty'), { ...base, text: ' \n\t' }));
      await assertFails(set(ref(alice, 'conversations/alice__bob/messages/badGPS'), { senderId: 'alice', recipientId: 'bob', type: 'location', latitude: 100, longitude: 106, createdAt: serverTimestamp() }));
      await assertFails(set(ref(eve, 'conversations/alice__bob/messages/intruder'), { ...base, senderId: 'eve' }));
      await assertSucceeds(set(ref(alice, 'conversations/alice__bob/messages/multiline'), { ...base, text: 'Dòng 1\nDòng 2' }));
    });
    await t.test('listener cleanup stops updates; resubscription replaces snapshot', async () => {
      let count = 0;
      const stop = a.observeChat('alice__bob', () => count++, error => { throw error; });
      await new Promise(resolve => setTimeout(resolve, 80));
      stop(); const before = count;
      await b.sendMessage('bob', 'alice', { text: 'Sau cleanup' });
      await new Promise(resolve => setTimeout(resolve, 80));
      assert.equal(count, before);
      const snapshot = (await get(ref(alice, 'conversations/alice__bob/messages'))).val();
      assert.equal(model.orderedMessages(snapshot).length, 5);
    });
    await t.test('multi-session presence: removing one session keeps the other online', async () => {
      await assertSucceeds(set(ref(alice, 'status/alice/connections/phone'), true));
      await assertSucceeds(set(ref(alice, 'status/alice/connections/tablet'), true));
      await assertFails(set(ref(bob, 'status/alice/connections/fake'), true));
      await remove(ref(alice, 'status/alice/connections/phone'));
      let presence = (await get(ref(bob, 'status/alice'))).val();
      assert.equal(model.userProfile('alice', {}, presence).isOnline, true);
      await remove(ref(alice, 'status/alice/connections/tablet'));
      presence = (await get(ref(bob, 'status/alice'))).val();
      assert.equal(model.userProfile('alice', {}, presence || {}).isOnline, false);
    });
    await t.test('presence service onDisconnect removes this session after connection closes', async () => {
      const presence = load('presenceService', { './firebase': { getFirebase: () => ({ db: alice }) } });
      let failure;
      const stop = presence.startPresence('alice', error => { failure = error; });
      const waitFor = async predicate => {
        for (let i = 0; i < 60; i++) {
          const data = (await get(ref(bob, 'status/alice'))).val();
          if (predicate(data)) { return; }
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        throw Error('presence timeout');
      };
      await waitFor(data => Boolean(data?.connections));
      goOffline(alice);
      await waitFor(data => !data?.connections);
      stop(); goOnline(alice);
      assert.equal(failure, undefined);
    });
  } finally { await env.cleanup(); }
});
