# Bài thực hành 5 — cấu hình Firebase

Mã nguồn dùng **React Native CLI + Firebase JavaScript SDK**, không dùng Expo hay React Native Firebase. Chưa có project Firebase thật trong repository. Ứng dụng hiển thị hướng dẫn cấu hình ở màn hình đăng nhập cho đến khi bạn điền cấu hình.

## 1. Tạo project và bật dịch vụ

1. Vào https://console.firebase.google.com/, chọn **Create a project**, đặt tên (ví dụ `THAPP2-Bai5`). Analytics không bắt buộc.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save**. Chỉ cần Email/Password, không phải Email link.
3. **Build → Realtime Database → Create database**. Chọn khu vực phù hợp và **Locked mode**. Phải dùng Realtime Database, không phải Cloud Firestore.
4. Trong Realtime Database, mở tab **Rules**, dán toàn bộ nội dung `database.rules.json`, chọn **Publish**. Đề bài chưa kèm nội dung luật riêng nên repository cung cấp bộ luật khớp schema của ứng dụng. Nếu giảng viên đưa bộ luật khác, cần đối chiếu schema trước khi thay thế.
5. **Project settings → General → Your apps → Add app → Web (`</>`)**. Đăng ký một Web app để lấy cấu hình cho JS SDK; không cần Firebase Hosting.
6. Sao chép object `firebaseConfig` vào `src/services/firebaseConfig.js`. Điền thêm **databaseURL** đúng URL hiện ở Realtime Database (bao gồm `https://`). URL có thể dạng `https://PROJECT-default-rtdb.REGION.firebasedatabase.app` hoặc `https://PROJECT-default-rtdb.firebaseio.com`.

```js
export const firebaseConfig = {
  apiKey: 'GIÁ_TRỊ_TỪ_FIREBASE_CONSOLE',
  authDomain: 'PROJECT.firebaseapp.com',
  databaseURL: 'URL_REALTIME_DATABASE_TỪ_CONSOLE',
  projectId: 'PROJECT',
  storageBucket: 'GIÁ_TRỊ_TỪ_CONSOLE',
  messagingSenderId: 'GIÁ_TRỊ_TỪ_CONSOLE',
  appId: 'GIÁ_TRỊ_TỪ_CONSOLE',
};
```

Đây là client config, không phải service-account key. Không đưa Admin SDK private key vào ứng dụng. Quyền dữ liệu được thực thi bằng Authentication và Database Rules. Không cần `google-services.json`, `GoogleService-Info.plist` hoặc Google Maps API key cho chức năng mở bản đồ bằng URL.

## 2. Chạy React Native CLI

```sh
npm ci
npm start -- --reset-cache
```

Terminal khác, với Android emulator hoặc thiết bị USB debugging đang kết nối:

```sh
npm run android
```

iOS cần cài lại Pods sau khi thêm AsyncStorage/geolocation:

```sh
bundle install
cd ios
bundle exec pod install
cd ..
npm run ios
```

Giải phóng vài GB ổ đĩa trước khi build native. Android dùng JDK 17 và SDK trong `android/build.gradle`; iOS dùng Xcode và CocoaPods. Không cần cài native Firebase SDK.

## 3. Cấu trúc dữ liệu và luật

```text
users/{uid}                         { name, email }
status/{uid}/connections/{session}   true
userChats/{uid}/{chatId}             true
conversations/{chatId}
  memberA, memberB                   hai UID được sắp xếp, chatId = A__B
  messages/{pushId}                  senderId, recipientId, type, createdAt
                                    + text hoặc latitude, longitude
  reads/{uid}                       pushId cuối cùng đã đọc
```

- Chỉ tài khoản đã đăng nhập đọc được danh bạ và trạng thái; chỉ sửa hồ sơ/trạng thái của chính mình.
- Chỉ hai thành viên đọc chat. Không cho đổi thành viên, giả mạo người gửi, sửa/xóa tin đã gửi, ghi mốc đã đọc của người khác hoặc tạo index cho người ngoài.
- Tin nhắn chỉ được thêm mới, có server timestamp; nội dung text tối đa 4000 ký tự, tọa độ được kiểm tra giới hạn. Email hồ sơ phải trùng email Firebase Authentication.
- Tin nhắn được ghi một lần trong chat; hai index chỉ trỏ tới chat, không nhân bản tin nhắn. Tạo thành viên bằng transaction, ghi hai index bằng atomic update, khôi phục index khi gửi lại sau lỗi gián đoạn.
- Unread = số tin đến có push ID sau mốc đã đọc. Mốc đã đọc cập nhật bằng transaction theo chiều tăng khi chat đang mở và app ở foreground. Tin của bản thân không tăng unread.
- Mỗi thiết bị/phiên foreground có một connection key. Đăng ký `onDisconnect` trước khi online; xóa key khi background/thoát. Nhiều thiết bị không ghi đè trạng thái của nhau. Mất kết nối bất ngờ có thể cần chờ máy chủ phát hiện timeout mới hiện offline.
- Các listener `onValue` trả về unsubscribe trong cleanup. Snapshot thay thế dữ liệu theo ID, không nối mảng gây trùng tin.
- Đây là quy mô bài thực hành: Home lắng nghe toàn bộ lịch sử các chat đã có để suy ra tin cuối/unread. Lịch sử rất lớn nên bổ sung phân trang và server-maintained summaries sau này.
- Màn hình Thông báo giữ dữ liệu mẫu và hành vi Bài 4; các switch cài đặt giữ hành vi hiện có, chưa tích hợp FCM.

## 4. Checklist kiểm thử hai thiết bị

1. Thiết bị A đăng ký họ tên, email A, mật khẩu ít nhất 6 ký tự; thử mật khẩu nhập lại sai.
2. Thiết bị B đăng ký bằng email B. Danh bạ hai máy phải thấy nhau, không thấy chính mình. Tìm bằng tên/email.
3. Đăng xuất rồi thử đăng nhập sai mật khẩu: hiện lỗi. Đăng nhập đúng: vào Home. Khởi động lại app: phiên đăng nhập được khôi phục qua AsyncStorage.
4. A gửi tin cho B; B nhận ngay. Hai bên gửi đồng thời, tin không mất/trùng. Tin của mình bên phải; mỗi tin có giờ.
5. B về Home rồi A gửi thêm: badge tăng. B mở chat: về 0. A gửi khi B đang xem chat: không giữ unread. Ra/vào chat nhiều lần: không tăng số bản sao tin nhắn.
6. Gửi tin rỗng/toàn khoảng trắng: bị chặn. Home hiện ảnh, tên, tin cuối, thời gian; chat mới nhất lên đầu.
7. Nhấn 📍, từ chối quyền: có thông báo. Cấp lại quyền trong cài đặt, bật GPS rồi thử lại. Emulator cần đặt tọa độ giả lập trong Extended Controls → Location; iOS Simulator → Features → Location.
8. Tin vị trí có thẻ riêng, nhấn mở Google Maps đúng lat/lng. Không nhầm thứ tự vĩ độ/kinh độ.
9. Đưa B về background/đăng xuất/tắt kết nối: A thấy offline; quay lại foreground/kết nối lại: online. Đăng nhập B trên hai thiết bị rồi thoát một thiết bị: thiết bị còn lại vẫn online.
10. Đăng xuất ở Cài đặt: quay về Đăng nhập, nút Back không mở lại Home/Chat.

## 5. Kiểm thử tự động cục bộ

Không cần project thật hoặc đăng nhập Firebase CLI:

```sh
npm test
npm run lint
npm run typecheck
npx --yes firebase-tools@14.24.2 emulators:exec --only auth,database --project demo-thapp2 'npm run test:firebase'
```

Database Emulator cần Java 17 và quyền localhost; cổng 9000 và 9099 phải trống. `demo-thapp2` chỉ là project giả lập. Test chạy chính source chat/presence service với kết nối emulator, kiểm tra đăng ký/đăng nhập/đăng xuất bằng Auth Emulator, realtime giữa hai người, gửi đồng thời, unread, cleanup, presence và các trường hợp bị luật từ chối.

Tài liệu: [Firebase Auth](https://firebase.google.com/docs/auth/web/start), [RTDB presence](https://firebase.google.com/docs/database/web/offline-capabilities), [kiểm thử rules](https://firebase.google.com/docs/rules/unit-tests), [geolocation](https://github.com/michalchudziak/react-native-geolocation).
