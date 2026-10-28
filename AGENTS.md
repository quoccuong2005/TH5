# THAPP2 — React Native CLI

This app uses React Native 0.86.3 without Expo. Keep the existing JavaScript screens and React Navigation structure.

- Install dependencies with `npm ci`.
- Run Metro with `npm start`, Android with `npm run android`, and iOS with `npm run ios`.
- Run `npm run lint` and `npm run typecheck` before completing changes.
- Commit native `android/` and `ios/` source files; do not commit build outputs, Pods, local.properties, or signing secrets.
- Use static imports from `@react-native-vector-icons/ionicons/static`; iOS fonts are declared in Info.plist.
- After changing native dependencies, run CocoaPods installation and rebuild the app.
- Do not reintroduce Expo tooling or Expo Router unless explicitly requested.

## Firebase (Bài 5)
- Use the Firebase JS SDK from `firebase/auth` and `firebase/database`; keep integration in `src/services/`.
- Use `src/services/firebaseConfig.js` for client config. Do not add Admin SDK secrets or Expo.
- Keep `database.rules.json` aligned with schema and test denied access with the emulator.
- Keep Notification screen behavior from Bài 4. All chat/contact data comes from Firebase.
- Clean up every database/auth/AppState subscription. Do not append whole snapshots to message arrays.
- Run `npm test`; run Firebase Emulator checks with the command in FIREBASE_SETUP.md when changing auth/database services or rules.
