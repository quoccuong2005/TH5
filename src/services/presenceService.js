import { onDisconnect, onValue, push, ref, remove, set } from 'firebase/database';
import { getFirebase } from './firebase';

// One key per foreground session: logging out on one device leaves another device online.
export function startPresence(uid, onError) {
  const { db } = getFirebase();
  const session = push(ref(db, `status/${uid}/connections`));
  const disconnect = onDisconnect(session);
  let stopped = false;
  const unsubscribe = onValue(ref(db, '.info/connected'), snapshot => {
    if (snapshot.val() !== true || stopped) { return; }
    (async () => {
      // Always register server cleanup before publishing online state.
      await disconnect.remove();
      if (stopped) { await disconnect.cancel(); return; }
      await set(session, true);
      if (stopped) { await remove(session); }
    })().catch(error => { if (!stopped) { onError(error); } });
  }, error => { if (!stopped) { onError(error); } });
  return () => {
    stopped = true;
    unsubscribe();
    remove(session).then(() => disconnect.cancel()).catch(() => {});
  };
}
