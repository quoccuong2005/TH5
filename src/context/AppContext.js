// src/context/AppContext.js
import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  currentUser as defaultUser,
  initialConversations,
  initialContacts,
  initialNotifications,
} from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState(initialConversations);
  const [contacts, setContacts] = useState(initialContacts);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Settings state (using Switch components)
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Login handler
  const login = (account) => {
    setUser({
      ...defaultUser,
      username: account.startsWith('@') ? account : `@${account}`,
    });
    return true;
  };

  // Logout handler
  const logout = () => {
    setUser(null);
  };

  // Mark a conversation as read
  const markConversationAsRead = (conversationId) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Send a message in a conversation
  const sendMessage = (conversationId, text, contactData = null) => {
    if (!text || !text.trim()) return;

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const newMessage = {
      id: `m_${Date.now()}`,
      text: text.trim(),
      time: timeStr,
      isSender: true,
    };

    setConversations((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === conversationId);

      if (existingIndex >= 0) {
        const target = prev[existingIndex];
        const updated = {
          ...target,
          lastMessage: text.trim(),
          time: timeStr,
          unreadCount: 0,
          messages: [...target.messages, newMessage],
        };
        const rest = prev.filter((_, idx) => idx !== existingIndex);
        return [updated, ...rest];
      }

      // If conversation doesn't exist yet (started from Contacts)
      if (contactData) {
        const newConversation = {
          id: conversationId,
          user: {
            id: contactData.id,
            name: contactData.name,
            avatar: contactData.avatar,
            isOnline: contactData.isOnline ?? false,
          },
          lastMessage: text.trim(),
          time: timeStr,
          unreadCount: 0,
          messages: [newMessage],
        };
        return [newConversation, ...prev];
      }

      return prev;
    });
  };

  // Mark single notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Calculated unread counters for badges
  const totalUnreadMessages = useMemo(() => {
    return conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  }, [conversations]);

  const totalUnreadNotifications = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        conversations,
        contacts,
        notifications,
        pushNotificationsEnabled,
        setPushNotificationsEnabled,
        darkModeEnabled,
        setDarkModeEnabled,
        soundEnabled,
        setSoundEnabled,
        markConversationAsRead,
        sendMessage,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        totalUnreadMessages,
        totalUnreadNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
