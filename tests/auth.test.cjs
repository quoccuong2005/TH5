const { test } = require('node:test');
const assert = require('node:assert/strict');
const { initializeApp, deleteApp } = require('firebase/app');
const { initializeAuth, connectAuthEmulator, inMemoryPersistence, signOut } = require('firebase/auth');
const { getDatabase, connectDatabaseEmulator, get, ref, goOffline, goOnline } = require('firebase/database');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const fs = require('node:fs');
const load = require('./load-service.cjs');

test('Firebase email/password registration, validation, errors and logout', { timeout: 30000 }, async t => {
  const env = await initializeTestEnvironment({ projectId: 'demo-thapp2', database: {
    host: '127.0.0.1', port: 9000, rules: fs.readFileSync('database.rules.json', 'utf8'),
  } });
  const app = initializeApp({ apiKey: 'fake-api-key', projectId: 'demo-thapp2', databaseURL: 'https://demo-thapp2.firebaseio.com' }, 'auth-test');
  const auth = initializeAuth(app, { persistence: inMemoryPersistence, signOut });
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const db = getDatabase(app);
  connectDatabaseEmulator(db, '127.0.0.1', 9000);
  const service = load('authService', { './firebase': { getFirebase: () => ({ auth, db }) } });
  const email = `student-${Date.now()}@example.com`;
  try {
    await t.test('validate name, minimum length and confirmation before registering', async () => {
      await assert.rejects(service.register('', email, '123456', '123456'), /họ tên/);
      await assert.rejects(service.register('An', email, '12345', '12345'), /6 ký tự/);
      await assert.rejects(service.register('An', email, '123456', '654321'), /không khớp/);
      assert.equal(auth.currentUser, null);
    });
    let uid;
    await t.test('register creates real Firebase Auth account and matching profile', async () => {
      await service.register(' Nguyễn Văn An ', email, '123456', '123456');
      uid = auth.currentUser.uid;
      assert.equal(auth.currentUser.displayName, 'Nguyễn Văn An');
      const profile = (await get(ref(db, `users/${uid}`))).val();
      assert.equal(profile.name, 'Nguyễn Văn An');
      assert.equal(profile.email, email);
    });
    await t.test('logout emits null and duplicate email is rejected', async () => {
      let latest;
      const stop = service.observeAuth(value => { latest = value; });
      await service.logout();
      assert.equal(auth.currentUser, null);
      await new Promise(resolve => setTimeout(resolve, 10));
      assert.equal(latest, null);
      stop();
      await assert.rejects(service.register('Other', email, '123456', '123456'), error => error.code === 'auth/email-already-in-use');
    });
    await t.test('incorrect password shows mapped error; correct credentials restore the same uid', async () => {
      const { errorMessage } = load('errors');
      await assert.rejects(service.login(email, 'wrong-password'), error => {
        assert.match(errorMessage(error), /không đúng/);
        return true;
      });
      await service.login(email, '123456');
      assert.equal(auth.currentUser.uid, uid);
      goOnline(db);
      await service.ensureProfile(auth.currentUser);
    });
  } finally { await signOut(auth); goOffline(db); await deleteApp(app); await env.cleanup(); }
});
