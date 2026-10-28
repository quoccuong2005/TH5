// src/screens/SettingsScreen.js
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { errorMessage } from '../services/errors';
import { useApp } from '../context/AppContext';

export default function SettingsScreen() {
  const {
    user,
    logout,
    pushNotificationsEnabled,
    setPushNotificationsEnabled,
    darkModeEnabled,
    setDarkModeEnabled,
    soundEnabled,
    setSoundEnabled,
  } = useApp();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try { await logout(); } catch (error) { Alert.alert('Không thể đăng xuất', errorMessage(error)); }
          },
        },
      ]
    );
  };

  const handleFeatureNotice = (featureName) => {
    Alert.alert('Thông báo', `Tính năng "${featureName}" đang được phát triển.`);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Khối hiển thị thông tin tài khoản người dùng */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
              }}
              style={styles.avatar}
            />
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Người dùng'}</Text>
            <Text style={styles.profileUsername}>{user?.email || ''}</Text>
            <Text style={styles.profileContact}>
              {user?.email || ''}
            </Text>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{user?.status || 'Đang hoạt động'}</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Cài đặt ứng dụng (Sử dụng Switch) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Tùy chọn ứng dụng</Text>

          {/* Switch 1: Thông báo */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="notifications" size={20} color="#4F46E5" />
              </View>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Thông báo đẩy</Text>
                <Text style={styles.settingDescription}>Nhận tin nhắn & cảnh báo mới</Text>
              </View>
            </View>
            <Switch
              value={pushNotificationsEnabled}
              onValueChange={setPushNotificationsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={pushNotificationsEnabled ? '#4F46E5' : '#F4F3F4'}
            />
          </View>

          {/* Switch 2: Giao diện tối */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="moon" size={20} color="#D97706" />
              </View>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Chế độ tối (Dark Mode)</Text>
                <Text style={styles.settingDescription}>Giảm mỏi mắt khi dùng ban đêm</Text>
              </View>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={darkModeEnabled ? '#4F46E5' : '#F4F3F4'}
            />
          </View>

          {/* Switch 3: Âm thanh */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="volume-high" size={20} color="#059669" />
              </View>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingTitle}>Âm thanh thông báo</Text>
                <Text style={styles.settingDescription}>Phát âm thanh khi có tin nhắn</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
              thumbColor={soundEnabled ? '#4F46E5' : '#F4F3F4'}
            />
          </View>
        </View>

        {/* Section 2: Tài khoản & Bảo mật */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Tài khoản & Bảo mật</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleFeatureNotice('Chỉnh sửa thông tin cá nhân')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="person-circle-outline" size={20} color="#374151" />
              </View>
              <Text style={styles.menuTitle}>Chỉnh sửa thông tin</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleFeatureNotice('Đổi mật khẩu')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#374151" />
              </View>
              <Text style={styles.menuTitle}>Đổi mật khẩu</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleFeatureNotice('Quyền riêng tư')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#374151" />
              </View>
              <Text style={styles.menuTitle}>Quyền riêng tư & Bảo mật</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Section 3: Giới thiệu */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Thông tin ứng dụng</Text>

          <View style={styles.menuItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
              </View>
              <Text style={styles.menuTitle}>Phiên bản</Text>
            </View>
            <Text style={styles.versionBadge}>1.0.0 (Build 2026)</Text>
          </View>
        </View>

        {/* Nút Đăng xuất */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.copyrightText}>
          TH Chat Mobile Application • Được phát triển bằng React Native
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
    marginBottom: 6,
  },
  profileContact: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextGroup: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  versionBadge: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  copyrightText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 18,
  },
});
