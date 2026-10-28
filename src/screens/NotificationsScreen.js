// src/screens/NotificationsScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useApp } from '../context/AppContext';

export default function NotificationsScreen() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    totalUnreadNotifications,
  } = useApp();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'unread'

  const filteredNotifications = useMemo(() => {
    if (filterType === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filterType]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return { name: 'chatbubble-ellipses', color: '#4F46E5', bg: '#EEF2FF' };
      case 'friend':
        return { name: 'person-add', color: '#10B981', bg: '#ECFDF5' };
      case 'system':
        return { name: 'information-circle', color: '#3B82F6', bg: '#EFF6FF' };
      case 'security':
        return { name: 'shield-checkmark', color: '#F59E0B', bg: '#FFFBEB' };
      default:
        return { name: 'notifications', color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const renderNotificationItem = ({ item }) => {
    const iconConfig = getNotificationIcon(item.type);
    const isUnread = !item.isRead;

    return (
      <TouchableOpacity
        style={[
          styles.notifItem,
          isUnread ? styles.notifItemUnread : styles.notifItemRead,
        ]}
        onPress={() => markNotificationAsRead(item.id)}
        activeOpacity={0.7}
      >
        {/* Icon đại diện loại thông báo */}
        <View style={[styles.iconWrapper, { backgroundColor: iconConfig.bg }]}>
          <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
        </View>

        {/* Nội dung thông báo */}
        <View style={styles.contentWrapper}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.notifTitle,
                isUnread && styles.notifTitleUnread,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>

          <Text
            style={[
              styles.notifContent,
              isUnread && styles.notifContentUnread,
            ]}
          >
            {item.content}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.timeWrapper}>
              <Ionicons name="time-outline" size={13} color="#9CA3AF" />
              <Text style={styles.timeText}>{item.time}</Text>
            </View>

            {/* Nút/Nhãn trạng thái */}
            <View style={styles.statusLabelContainer}>
              {isUnread ? (
                <TouchableOpacity
                  style={styles.markReadBtn}
                  onPress={() => markNotificationAsRead(item.id)}
                >
                  <Ionicons name="checkmark" size={12} color="#4F46E5" />
                  <Text style={styles.markReadText}>Đánh dấu đã đọc</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.readBadge}>
                  <Ionicons name="checkmark-done" size={13} color="#9CA3AF" />
                  <Text style={styles.readBadgeText}>Đã đọc</Text>
                </View>
              )}
            </View>
          </View>
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
          <Text style={styles.headerTitle}>Thông báo</Text>
          <Text style={styles.headerSubtitle}>
            {totalUnreadNotifications > 0
              ? `Bạn có ${totalUnreadNotifications} thông báo chưa đọc`
              : 'Tất cả thông báo đã được đọc'}
          </Text>
        </View>

        {/* Nút Đánh dấu tất cả là đã đọc */}
        {totalUnreadNotifications > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={markAllNotificationsAsRead}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done-outline" size={16} color="#4F46E5" />
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Thanh bộ lọc: Tất cả / Chưa đọc */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterTab, filterType === 'all' && styles.filterTabActive]}
          onPress={() => setFilterType('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterType === 'all' && styles.filterTabTextActive,
            ]}
          >
            Tất cả ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterType === 'unread' && styles.filterTabActive]}
          onPress={() => setFilterType('unread')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterType === 'unread' && styles.filterTabTextActive,
            ]}
          >
            Chưa đọc ({totalUnreadNotifications})
          </Text>
          {totalUnreadNotifications > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{totalUnreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Danh sách thông báo */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {filterType === 'unread'
                ? 'Không có thông báo chưa đọc'
                : 'Chưa có thông báo nào'}
            </Text>
            <Text style={styles.emptyText}>
              {filterType === 'unread'
                ? 'Bạn đã đọc toàn bộ thông báo!'
                : 'Các thông báo mới sẽ xuất hiện tại đây'}
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
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
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#4F46E5',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 10,
  },
  notifItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 14,
  },
  notifItemUnread: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  notifItemRead: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    opacity: 0.85,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
    flex: 1,
  },
  notifTitleUnread: {
    fontWeight: '800',
    color: '#111827',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
    marginLeft: 8,
  },
  notifContent: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  notifContentUnread: {
    color: '#374151',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  markReadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  readBadgeText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  separator: {
    height: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 70,
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
