import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from './config';

type Props = { title: string; message: string; actionLabel?: string; onAction?: () => void; busy?: boolean };

/** Màn báo lỗi / mất mạng / đang tải dùng chung. */
export function StatusScreen({ title, message, actionLabel, onAction, busy }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Image source={require('../assets/icon.png')} style={styles.logo} accessibilityIgnoresInvertColors />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.msg}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          disabled={busy}
          accessibilityRole="button"
          style={({ pressed }) => [styles.btn, (pressed || busy) && { opacity: 0.75 }]}
        >
          <Text style={styles.btnText}>{busy ? 'Đang thử lại…' : actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  logo: { width: 96, height: 96, borderRadius: 48, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.ink, textAlign: 'center' },
  msg: { fontSize: 15, lineHeight: 22, color: COLORS.ink2, textAlign: 'center', maxWidth: 340 },
  btn: { marginTop: 12, backgroundColor: COLORS.accent, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 8, minWidth: 180, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
