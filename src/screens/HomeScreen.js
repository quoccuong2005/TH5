// src/screens/HomeScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useApp } from '../context/AppContext';

export default function HomeScreen({ navigation }) {
  const { conversations, contacts } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc danh sách cuộc trò chuyện theo tên hoặc tin nhắn gần nhất
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter(
      (conv) =>
        conv.user.name.toLowerCase().includes(q) ||
        conv.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Danh sách bạn bè đang trực tuyến
  const onlineUsers = useMemo(() => {
    return contacts.filter((c) => c.isOnline);
  }, [contacts]);

  const handleOpenConversation = (conversation) => {
    navigation.navigate('ChatDetail', { peerId: conversation.user.id });
  };

  const handleOpenDirectChat = (contact) => {
    // Tìm cuộc trò chuyện sẵn có hoặc tạo mới
    navigation.navigate('ChatDetail', { peerId: contact.id });
  };

  const renderConversationItem = ({ item }) => {
    const isUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.convItem}
        onPress={() => handleOpenConversation(item)}
        activeOpacity={0.7}
      >
        {/* Avatar + Trạng thái trực tuyến */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          {item.user.isOnline && <View style={styles.onlineBadge} />}
        </View>

        {/* Nội dung tin nhắn */}
        <View style={styles.convContent}>
          <View style={styles.convHeaderRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.user.name}
            </Text>
            <Text style={[styles.timeText, isUnread && styles.timeTextUnread]}>
              {item.time}
            </Text>
          </View>

          <View style={styles.convFooterRow}>
            <Text
              style={[
                styles.lastMessage,
                isUnread && styles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>

            {/* Số lượng tin nhắn chưa đọc */}
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Đoạn chat</Text>
          <Text style={styles.headerSubtitle}>
            {conversations.length} cuộc trò chuyện
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.navigate('Contacts')}
        >
          <Ionicons name="create-outline" size={22} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Ô tìm kiếm cuộc trò chuyện */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cuộc trò chuyện hoặc tin nhắn..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Danh sách người dùng trực tuyến */}
      {!searchQuery && onlineUsers.length > 0 && (
        <View style={styles.onlineSection}>
          <Text style={styles.sectionTitle}>Đang trực tuyến ({onlineUsers.length})</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={onlineUsers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.onlineList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.onlineUserItem}
                onPress={() => handleOpenDirectChat(item)}
              >
                <View style={styles.onlineAvatarWrapper}>
                  <Image source={{ uri: item.avatar }} style={styles.onlineAvatar} />
                  <View style={styles.onlineDot} />
                </View>
                <Text style={styles.onlineName} numberOfLines={1}>
                  {item.name.split(' ').pop()}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Danh sách các cuộc trò chuyện */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Không tìm thấy cuộc trò chuyện</Text>
            <Text style={styles.emptyText}>
              Thử tìm kiếm với tên hoặc từ khóa khác
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  onlineSection: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  onlineList: {
    paddingHorizontal: 14,
  },
  onlineUserItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 62,
  },
  onlineAvatarWrapper: {
    position: 'relative',
  },
  onlineAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E5E7EB',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  convContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  convHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  timeTextUnread: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  convFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 10,
  },
  lastMessageUnread: {
    color: '#111827',
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: '#4F46E5',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 86,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});
