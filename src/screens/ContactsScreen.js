// src/screens/ContactsScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function ContactsScreen({ navigation }) {
  const { contacts, conversations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'online'

  // Lọc danh bạ theo tìm kiếm và trạng thái trực tuyến
  const filteredContacts = useMemo(() => {
    let result = contacts;

    if (filterType === 'online') {
      result = result.filter((c) => c.isOnline);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [contacts, filterType, searchQuery]);

  // Nhấn vào một người dùng để mở cuộc trò chuyện tương ứng
  const handleSelectContact = (contact) => {
    const existing = conversations.find((c) => c.user.id === contact.id);

    if (existing) {
      navigation.navigate('ChatDetail', { conversation: existing });
    } else {
      const newConversation = {
        id: `conv_${contact.id}`,
        user: {
          id: contact.id,
          name: contact.name,
          avatar: contact.avatar,
          isOnline: contact.isOnline,
        },
        lastMessage: 'Bắt đầu cuộc trò chuyện...',
        time: 'Vừa xong',
        unreadCount: 0,
        messages: [],
      };
      navigation.navigate('ChatDetail', {
        conversation: newConversation,
        contactData: contact,
      });
    }
  };

  const renderContactItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => handleSelectContact(item)}
        activeOpacity={0.7}
      >
        {/* Ảnh đại diện */}
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.isOnline ? '#10B981' : '#9CA3AF' },
            ]}
          />
        </View>

        {/* Thông tin người dùng */}
        <View style={styles.infoWrapper}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactBio} numberOfLines={1}>
            {item.bio || item.phone}
          </Text>
        </View>

        {/* Trạng thái trực tuyến & Nút Chat */}
        <View style={styles.actionWrapper}>
          <View
            style={[
              styles.statusBadge,
              item.isOnline ? styles.onlineBadge : styles.offlineBadge,
            ]}
          >
            <View
              style={[
                styles.badgeIndicator,
                { backgroundColor: item.isOnline ? '#10B981' : '#6B7280' },
              ]}
            />
            <Text
              style={[
                styles.statusBadgeText,
                item.isOnline ? styles.onlineBadgeText : styles.offlineBadgeText,
              ]}
            >
              {item.isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => handleSelectContact(item)}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Danh bạ</Text>
          <Text style={styles.headerSubtitle}>
            {contacts.length} người liên hệ
          </Text>
        </View>
        <TouchableOpacity style={styles.addContactBtn}>
          <Ionicons name="person-add-outline" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Thanh tìm kiếm danh bạ */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
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

      {/* Bộ lọc: Tất cả / Đang trực tuyến */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
          onPress={() => setFilterType('all')}
        >
          <Text
            style={[
              styles.filterChipText,
              filterType === 'all' && styles.filterChipTextActive,
            ]}
          >
            Tất cả ({contacts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterType === 'online' && styles.filterChipActive]}
          onPress={() => setFilterType('online')}
        >
          <View style={styles.onlineDotSmall} />
          <Text
            style={[
              styles.filterChipText,
              filterType === 'online' && styles.filterChipTextActive,
            ]}
          >
            Đang trực tuyến ({contacts.filter((c) => c.isOnline).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách người dùng */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContactItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Không tìm thấy người dùng</Text>
            <Text style={styles.emptyText}>Thử tìm kiếm với tên hoặc từ khóa khác</Text>
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
  addContactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  onlineDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  listContent: {
    paddingBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 14,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  contactBio: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineBadge: {
    backgroundColor: '#ECFDF5',
  },
  offlineBadge: {
    backgroundColor: '#F3F4F6',
  },
  badgeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  onlineBadgeText: {
    color: '#059669',
  },
  offlineBadgeText: {
    color: '#6B7280',
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 84,
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
