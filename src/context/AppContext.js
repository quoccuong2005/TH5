import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { AppState } from 'react-native';
import { initialNotifications } from '../data/mockData';
import { firebaseConfigured } from '../services/firebase';
import * as authService from '../services/authService';
import { observeUsers, observePresence, observeChatIndex, observeChat, markRead, resumeDatabase } from '../services/chatService';
import { conversationSummary, userProfile } from '../services/chatModel';
import { startPresence } from '../services/presenceService';
import { errorMessage } from '../services/errors';

const AppContext = createContext();
export function AppProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [authLoading, setAuthLoading] = useState(firebaseConfigured);
  const [profiles, setProfiles] = useState({});
  const [statuses, setStatuses] = useState({});
  const [chats, setChats] = useState({});
  const [syncError, setSyncError] = useState('');
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [notifications, setNotifications] = useState(initialNotifications);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const reportError = useCallback(error => setSyncError(errorMessage(error)), []);

  useEffect(() => {
    const listener = AppState.addEventListener('change', state => setAppActive(state === 'active'));
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (!firebaseConfigured) { return; }
    return authService.observeAuth(next => {
      setProfiles({}); setStatuses({}); setChats({}); setSyncError('');
      setAccount(next);
      setAuthLoading(false);
    });
  }, []);

  const uid = account?.uid;
  useEffect(() => {
    if (!uid) { return; }
    let alive = true;
    resumeDatabase();
    authService.ensureProfile(account).catch(error => { if (alive) { reportError(error); } });
    const stops = [observeUsers(setProfiles, reportError), observePresence(setStatuses, reportError)];
    const chatStops = new Map();
    stops.push(observeChatIndex(uid, index => {
      for (const [id, stop] of chatStops) {
        if (!index[id]) {
          stop(); chatStops.delete(id);
          setChats(previous => { const next = { ...previous }; delete next[id]; return next; });
        }
      }
      Object.keys(index).forEach(id => {
        if (chatStops.has(id)) { return; }
        chatStops.set(id, observeChat(id, data => {
          if (alive) { setChats(previous => ({ ...previous, [id]: data })); }
        }, reportError));
      });
    }, reportError));
    return () => {
      alive = false;
      stops.forEach(stop => stop());
      chatStops.forEach(stop => stop());
    };
  }, [uid, account, reportError]);

  useEffect(() => {
    if (uid && appActive) { return startPresence(uid, reportError); }
  }, [uid, appActive, reportError]);

  const contacts = useMemo(() => Object.entries(profiles)
    .filter(([id]) => id !== uid)
    .map(([id, profile]) => userProfile(id, profile, statuses[id]))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi')), [profiles, statuses, uid]);
  const user = account ? { ...userProfile(uid, profiles[uid], statuses[uid]), email: account.email } : null;
  const conversations = useMemo(() => Object.entries(chats)
    .filter(([, data]) => data && (data.memberA === uid || data.memberB === uid))
    .map(([id, data]) => conversationSummary(id, data, uid, profiles, statuses))
    .filter(Boolean)
    .sort((a, b) => b.updatedAt - a.updatedAt || (a.lastKey < b.lastKey ? 1 : a.lastKey > b.lastKey ? -1 : 0)), [chats, uid, profiles, statuses]);
  const markConversationAsRead = useCallback((id, key) => uid ? markRead(id, uid, key) : Promise.resolve(), [uid]);
  const markNotificationAsRead = id => setNotifications(previous => previous.map(n => n.id === id ? { ...n, isRead: true } : n));
  const markAllNotificationsAsRead = () => setNotifications(previous => previous.map(n => ({ ...n, isRead: true })));

  return (
    <AppContext.Provider value={{
      user, authLoading, appActive, firebaseConfigured, syncError,
      contacts, conversations, reportError, markConversationAsRead,
      login: authService.login, register: authService.register, logout: authService.logout,
      notifications, markNotificationAsRead, markAllNotificationsAsRead,
      totalUnreadMessages: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
      totalUnreadNotifications: notifications.filter(n => !n.isRead).length,
      pushNotificationsEnabled, setPushNotificationsEnabled,
      darkModeEnabled, setDarkModeEnabled, soundEnabled, setSoundEnabled,
    }}>
      {children}
    </AppContext.Provider>
  );
}
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) { throw new Error('useApp must be used within AppProvider'); }
  return context;
};
