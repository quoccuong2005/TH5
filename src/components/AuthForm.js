import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { errorMessage } from '../services/errors';

export default function AuthForm({ navigation, registering = false }) {
  const { login, register, firebaseConfigured } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (busy) { return; }
    setError(''); setBusy(true);
    try {
      if (registering) { await register(name, email, password, confirmation); }
      else { await login(email, password); }
      // Auth state controls the navigator; back cannot reopen authenticated screens after logout.
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  };
  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>TH CHAT</Text>
          <Text style={styles.subtitle}>Kết nối bạn bè, trò chuyện tức thì</Text>
          <View style={styles.card}>
            <Text style={styles.title}>{registering ? 'Tạo tài khoản' : 'Đăng nhập'}</Text>
            {!firebaseConfigured && <Text style={styles.error}>Chưa cấu hình Firebase. Làm theo FIREBASE_SETUP.md rồi điền src/services/firebaseConfig.js.</Text>}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            {registering && <><Text style={styles.label}>Họ tên</Text><TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nguyễn Văn An" maxLength={100} editable={!busy} autoComplete="name" /></>}
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="ban@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" editable={!busy} />
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder={registering ? 'Tối thiểu 6 ký tự' : 'Nhập mật khẩu'} secureTextEntry={!showPassword} autoCapitalize="none" autoComplete={registering ? 'new-password' : 'current-password'} editable={!busy} />
            {registering && <><Text style={styles.label}>Nhập lại mật khẩu</Text><TextInput style={styles.input} value={confirmation} onChangeText={setConfirmation} secureTextEntry={!showPassword} autoCapitalize="none" editable={!busy} placeholder="Nhập lại mật khẩu" /></>}
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Text style={styles.link}>{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.button, (!firebaseConfigured || busy) && styles.disabled]} onPress={submit} disabled={!firebaseConfigured || busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{registering ? 'Đăng ký' : 'Đăng nhập'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity disabled={busy} onPress={() => registering ? navigation.goBack() : navigation.navigate('Register')}>
              <Text style={styles.switchLink}>{registering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { color: '#4F46E5', fontSize: 32, fontWeight: '800', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#6B7280', marginVertical: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, minHeight: 48, marginBottom: 16, color: '#111827' },
  error: { color: '#B91C1C', marginBottom: 16, lineHeight: 22 },
  link: { color: '#4F46E5', marginBottom: 16 },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchLink: { color: '#4F46E5', textAlign: 'center', marginTop: 20 },
});
