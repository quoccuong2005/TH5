export function errorMessage(error) {
  const messages = {
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
    'auth/user-not-found': 'Email hoặc mật khẩu không đúng.',
    'auth/wrong-password': 'Email hoặc mật khẩu không đúng.',
    'auth/email-already-in-use': 'Email đã được đăng ký.',
    'auth/weak-password': 'Mật khẩu phải có ít nhất 6 ký tự.',
    'auth/too-many-requests': 'Thao tác quá nhiều lần. Vui lòng thử lại sau.',
    'auth/network-request-failed': 'Không kết nối được Firebase. Kiểm tra mạng và thử lại.',
    'auth/operation-not-allowed': 'Hãy bật Email/Password trong Firebase Authentication.',
    'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa.',
    'PERMISSION_DENIED': 'Không có quyền truy cập dữ liệu. Kiểm tra luật Realtime Database.',
    'permission-denied': 'Không có quyền truy cập dữ liệu. Kiểm tra luật Realtime Database.',
  };
  return messages[error?.code] || error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
}
