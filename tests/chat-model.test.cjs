const { test } = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-service.cjs');
const model = load('chatModel');

test('same conversation from either side, self-chat rejected', () => {
  assert.equal(model.conversationId('bob', 'alice'), 'alice__bob');
  assert.equal(model.conversationId('alice', 'bob'), 'alice__bob');
  assert.throws(() => model.conversationId('alice', 'alice'));
});
test('reject empty/too long text and invalid coordinates; retain valid content', () => {
  assert.throws(() => model.messagePayload('a', 'b', { text: ' \n\t' }, 1));
  assert.throws(() => model.messagePayload('a', 'b', { text: 'a'.repeat(4001) }, 1));
  assert.throws(() => model.messagePayload('a', 'b', { type: 'location', latitude: NaN, longitude: 106 }, 1));
  assert.throws(() => model.messagePayload('a', 'b', { type: 'location', latitude: 91, longitude: 106 }, 1));
  assert.equal(model.messagePayload('a', 'b', { text: ' Chào bạn ' }, 1).text, 'Chào bạn');
  assert.equal(model.messagePayload('a', 'b', { type: 'location', latitude: 10.8, longitude: 106.7 }, 1).longitude, 106.7);
});
test('read marker counts incoming messages only, including equal timestamps', () => {
  const messages = { m1: { senderId: 'b', createdAt: 1 }, m2: { senderId: 'a', createdAt: 1 }, m3: { senderId: 'b', createdAt: 1 } };
  assert.equal(model.unreadCount(messages, 'a'), 2);
  assert.equal(model.unreadCount(messages, 'a', 'm1'), 1);
  assert.equal(model.unreadCount(messages, 'a', 'm3'), 0);
  assert.equal(model.unreadCount({ ...messages, m4: { senderId: 'b', createdAt: 2 } }, 'a', 'm3'), 1);
});
test('summary uses peer profile, latest location and session presence', () => {
  const summary = model.conversationSummary('a__b', { memberA: 'a', memberB: 'b', messages: { m2: { senderId: 'b', type: 'location', createdAt: 100 }, m1: { senderId: 'a', text: 'Hi', createdAt: 50 } } }, 'a', { b: { name: 'Bình' } }, { b: { connections: { phone: true } } });
  assert.equal(summary.user.name, 'Bình');
  assert.equal(summary.user.isOnline, true);
  assert.equal(summary.lastMessage, '📍 Vị trí');
  assert.equal(summary.unreadCount, 1);
  assert.equal(model.userProfile('b', {}, {}).isOnline, false);
  assert.equal(model.conversationSummary('a__b', { memberA: 'a', memberB: 'b' }, 'a', {}, {}), null);
});

test('Firebase push IDs use binary order, not locale collation', () => {
  const ids = ['-X_a', '-XZa', '-XAa', '-Xaa', '-X-a'];
  const messages = Object.fromEntries(ids.map(id => [id, { senderId: 'b' }]));
  assert.deepEqual(model.orderedMessages(messages).map(m => m.id), [...ids].sort());
});
