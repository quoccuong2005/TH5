# THAPP2

Ứng dụng Bài thực hành 5: chat 1-1 realtime bằng React Native CLI 0.86.3, React Navigation, Firebase JS SDK và geolocation.

**Thiết lập Firebase trước khi chạy:** xem [FIREBASE_SETUP.md](./FIREBASE_SETUP.md). Repository chưa gắn Firebase project thật. Điền Web config vào `src/services/firebaseConfig.js`, bật Email/Password + Realtime Database và publish `database.rules.json`.

## Chuẩn bị

- Node.js 20.19.4+ (nhánh 20), 22.13+ hoặc phiên bản mới phù hợp; npm.
- Android: JDK 17, Android Studio, Android SDK theo `android/build.gradle`, thiết bị/emulator và `ANDROID_HOME` trỏ tới SDK.
- iOS: macOS, Xcode, Ruby/Bundler và CocoaPods.

## Cài đặt

```sh
npm ci
```

Với iOS, cài thêm native dependencies:

```sh
bundle install
cd ios
bundle exec pod install
cd ..
```

## Chạy

Mở terminal thứ nhất:

```sh
npm start
```

Mở terminal thứ hai, chọn một nền tảng:

```sh
npm run android
# hoặc
npm run ios
```

Android cần emulator đang chạy hoặc điện thoại đã bật USB debugging. iOS mặc định chạy trên simulator; thiết bị thật cần cấu hình signing trong Xcode. Khi đổi native dependency, chạy lại `pod install` cho iOS và build lại ứng dụng.

## Kiểm tra

```sh
npm run lint
npm run typecheck
```

`typecheck` kiểm tra cấu hình TypeScript và kiểu từ dependencies; mã ứng dụng hiện vẫn là JavaScript, chưa bật `checkJs`.

## Những thay đổi từ Expo

- Đăng ký `THAPP2` bằng `AppRegistry`; dùng Metro và Babel của React Native.
- Theo dõi mã native `android/` và `ios/` trong Git, tạo từ Community CLI template 0.86.3.
- Thay `@expo/vector-icons` bằng `@react-native-vector-icons/ionicons/static`, autolinking và khai báo font iOS.
- Gỡ Expo, expo-font, expo-status-bar cùng lệnh chạy Expo/web. Giữ nguyên các màn hình, dữ liệu mẫu và luồng điều hướng.
- Cấu hình native thay cho `app.json` của Expo: portrait, giao diện sáng và icon ứng dụng. Khi phát hành, thay bundle identifier mặc định iOS và cấu hình signing riêng; Android hiện dùng `com.thapp2`.

Đăng ký tài khoản bằng họ tên, email và mật khẩu của bạn. Danh bạ, trạng thái online, tin nhắn, Home và unread dùng Firebase; riêng màn hình Thông báo giữ dữ liệu Bài 4. Không còn tài khoản mẫu `admin / 123456`.

Kiểm thử logic bằng `npm test`; kiểm thử service và bảo mật bằng Database Emulator theo hướng dẫn Firebase ở trên.
