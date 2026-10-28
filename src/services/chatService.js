import { get, goOnline, onValue, push, ref, runTransaction, serverTimestamp, set, update } from 'firebase/database';
import { getFirebase } from './firebase';
import { conversationId, messagePayload } from './chatModel';

export function resumeDatabase() { goOnline(getFirebase().db); }
export function observeUsers(callback, onError) {
  return onValue(ref(getFirebase().db, 'users'), snapshot => callback(snapshot.val() || {}), onError);
}
export function observePresence(callback, onError) {
  return onValue(ref(getFirebase().db, 'status'), snapshot => callback(snapshot.val() || {}), onError);
}
export function observeChat(id, callback, onError) {
  return onValue(ref(getFirebase().db, `conversations/${id}`), snapshot => callback(snapshot.val()), onError);
}
export function observeChatIndex(uid, callback, onError) {
  return onValue(ref(getFirebase().db, `userChats/${uid}`), snapshot => callback(snapshot.val() || {}), onError);
}

export async function ensureConversation(uid, peerId) {
  const { db } = getFirebase();
  const id = conversationId(uid, peerId);
  const conversationRef = ref(db, `conversations/${id}`);
  const [memberA, memberB] = [uid, peerId].sort();
  // Transaction creates membership once. Existing membership/messages are never overwritten.
  const existing = await get(conversationRef);
  if (!existing.exists()) {
    await runTransaction(conversationRef, current => current ? undefined : { memberA, memberB });
  }
  // Repair an interrupted index write on either side before sending.
  await update(ref(db), {
    [`userChats/${uid}/${id}`]: true,
    [`userChats/${peerId}/${id}`]: true,
  });
  return id;
}

export async function sendMessage(uid, peerId, content) {
  const payload = messagePayload(uid, peerId, content, serverTimestamp());
  const id = await ensureConversation(uid, peerId);
  const messageRef = push(ref(getFirebase().db, `conversations/${id}/messages`));
  await set(messageRef, payload);
  return messageRef.key;
}

export function markRead(id, uid, messageKey) {
  if (!messageKey) { return Promise.resolve(); }
  return runTransaction(ref(getFirebase().db, `conversations/${id}/reads/${uid}`),
    previous => previous && previous >= messageKey ? undefined : messageKey);
}
