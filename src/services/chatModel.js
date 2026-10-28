// Pure helpers shared by UI/services and tested without Firebase or a device.
export function conversationId(first, second) {
  if (!first || !second || first === second) {
    throw new Error('Cuộc trò chuyện cần hai người dùng khác nhau.');
  }
  return [first, second].sort().join('__');
}

export function formatTime(timestamp) {
  if (!Number.isFinite(timestamp)) { return 'Đang gửi…'; }
  return new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function orderedMessages(messages = {}) {
  return Object.entries(messages).map(([id, message]) => ({ ...message, id }))
    .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

export function unreadCount(messages, uid, readKey = '') {
  return orderedMessages(messages).filter(message => message.senderId !== uid && message.id > readKey).length;
}

export function messagePayload(senderId, recipientId, content, createdAt) {
  if (content.type === 'location') {
    const { latitude, longitude } = content;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      throw new Error('Tọa độ vị trí không hợp lệ.');
    }
    return { senderId, recipientId, type: 'location', latitude, longitude, createdAt };
  }
  const text = content.text?.trim();
  if (!text) { throw new Error('Không thể gửi tin nhắn rỗng.'); }
  if (text.length > 4000) { throw new Error('Tin nhắn tối đa 4000 ký tự.'); }
  return { senderId, recipientId, type: 'text', text, createdAt };
}

export function userProfile(uid, value = {}, presence = {}) {
  return {
    id: uid,
    name: value.name || 'Người dùng',
    email: value.email || '',
    phone: '',
    avatar: value.avatar || 'https://ui-avatars.com/api/?background=4F46E5&color=fff&name=' + encodeURIComponent(value.name || 'User'),
    isOnline: Object.keys(presence.connections || {}).length > 0,
  };
}

export function conversationSummary(id, data, uid, profiles, statuses) {
  const peerId = data.memberA === uid ? data.memberB : data.memberA;
  const messages = orderedMessages(data.messages);
  const last = messages[messages.length - 1];
  if (!last) { return null; }
  return {
    id,
    user: userProfile(peerId, profiles[peerId], statuses[peerId]),
    lastMessage: last.type === 'location' ? '📍 Vị trí' : last.text,
    time: formatTime(last.createdAt),
    updatedAt: last.createdAt || 0,
    lastKey: last.id,
    unreadCount: unreadCount(data.messages, uid, data.reads?.[uid]),
  };
}
