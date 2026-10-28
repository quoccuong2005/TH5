import Geolocation from '@react-native-community/geolocation';
import { Linking, PermissionsAndroid, Platform } from 'react-native';

Geolocation.setRNConfiguration({ skipPermissionRequests: false, authorizationLevel: 'whenInUse' });

export async function currentLocation() {
  if (Platform.OS === 'android') {
    const grants = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);
    if (grants[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED &&
        grants[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Bạn đã từ chối quyền vị trí. Có thể cấp lại trong Cài đặt của thiết bị.');
    }
  }
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      error => reject(new Error(error.code === 1
        ? 'Bạn đã từ chối quyền vị trí. Có thể cấp lại trong Cài đặt của thiết bị.'
        : error.code === 2 ? 'Không lấy được vị trí. Hãy bật dịch vụ vị trí/GPS.'
          : 'Lấy vị trí quá thời gian. Vui lòng thử lại.')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

export function openLocation(latitude, longitude) {
  return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
}
