import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS, WEB_URL } from './config';
import { StatusScreen } from './StatusScreen';

/** Bản máy tính (web / PWA cài từ Chrome, Edge, Safari): nhúng web Lành toàn màn hình. */
export function LanhWebView() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const on = () => { setOnline(true); setKey((k) => k + 1); };
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (!online) {
    return <StatusScreen title="Mất kết nối mạng" message="Kiểm tra Wi-Fi hoặc mạng dây. Trang sẽ tự tải lại khi có mạng." actionLabel="Thử lại" onAction={() => setKey((k) => k + 1)} />;
  }
  return (
    <View style={styles.fill}>
      <iframe
        key={key}
        src={WEB_URL}
        title="Lành – Lịch làm part-time"
        allow="clipboard-write; geolocation"
        style={{ border: 0, width: '100%', height: '100%', display: 'block', background: COLORS.bg }}
      />
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1, backgroundColor: COLORS.bg } });
