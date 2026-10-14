// src/screens/ChatDetailScreen.js
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function ChatDetailScreen({ route, navigation }) {
  const { conversation: initialConv, contactData } = route.params || {};
  const { conversations, sendMessage, markConversationAsRead } = useApp();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  // Lấy dữ liệu cuộc trò chuyện mới nhất từ AppContext
  const currentConversation = useMemo(() => {
    const found = conversations.find((c) => c.id === initialConv?.id);
    return found || initialConv;
  }, [conversations, initialConv]);

  // Đánh dấu đã đọc khi mở màn hình
  useEffect(() => {
    if (currentConversation?.id) {
      markConversationAsRead(currentConversation.id);
    }
  }, [currentConversation?.id]);

  const messages = currentConversation?.messages || [];
  const targetUser = currentConversation?.user || contactData || {
    name: 'Người dùng',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    isOnline: false,
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    sendMessage(currentConversation?.id || `conv_${targetUser.id}`, inputText, contactData);
    setInputText('');

    // Cuộn xuống cuối sau khi gửi
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessageItem = ({ item }) => {
    const isSender = item.isSender;

    return (
      <View
        style={[
          styles.messageRow,
          isSender ? styles.messageRowSender : styles.messageRowReceiver,
        ]}
      >
        {!isSender && (
          <Image source={{ uri: targetUser.avatar }} style={styles.messageAvatar} />
        )}

        <View
          style={[
            styles.bubble,
            isSender ? styles.bubbleSender : styles.bubbleReceiver,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isSender ? styles.messageTextSender : styles.messageTextReceiver,
            ]}
          >
            {item.text}
          </Text>

          <View style={styles.messageMeta}>
            <Text
              style={[
                styles.messageTime,
                isSender ? styles.messageTimeSender : styles.messageTimeReceiver,
              ]}
            >
              {item.time}
            </Text>
            {isSender && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color="#C7D2FE"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header tùy biến */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerAvatarContainer}>
          <Image source={{ uri: targetUser.avatar }} style={styles.headerAvatar} />
          {targetUser.isOnline && <View style={styles.headerOnlineDot} />}
        </View>

        <View style={styles.headerUserInfo}>
          <Text style={styles.headerUserName} numberOfLines={1}>
            {targetUser.name}
          </Text>
          <Text style={styles.headerStatus}>
            {targetUser.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Ionicons name="call-outline" size={20} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Ionicons name="videocam-outline" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Nội dung danh sách tin nhắn */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubbles-outline" size={50} color="#D1D5DB" />
              <Text style={styles.emptyChatTitle}>Bắt đầu cuộc trò chuyện!</Text>
              <Text style={styles.emptyChatSub}>
                Gửi tin nhắn đầu tiên cho {targetUser.name}
              </Text>
            </View>
          }
        />

        {/* Thanh nhập tin nhắn */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? '#FFFFFF' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 6,
    marginRight: 6,
  },
  headerAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5E7EB',
  },
  headerOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerUserInfo: {
    flex: 1,
  },
  headerUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatArea: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  messageRowSender: {
    justifyContent: 'flex-end',
  },
  messageRowReceiver: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleSender: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  bubbleReceiver: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextSender: {
    color: '#FFFFFF',
  },
  messageTextReceiver: {
    color: '#1F2937',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  messageTimeSender: {
    color: '#E0E7FF',
  },
  messageTimeReceiver: {
    color: '#9CA3AF',
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyChatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 10,
  },
  emptyChatSub: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachBtn: {
    padding: 6,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: '#111827',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#4F46E5',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
