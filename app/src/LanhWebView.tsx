import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  WebViewNavigation,
  WebViewOpenWindowEvent,
} from 'react-native-webview/lib/WebViewTypes';
import NetInfo from '@react-native-community/netinfo';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS, WEB_URL, isInApp } from './config';
import { StatusScreen } from './StatusScreen';

// Kiểu mặc định của WebView là <undefined>, TypeScript 6 coi props là `never`; chỉ định rõ <object>.
const WV = WebView<object>;
type WVRef = InstanceType<typeof WV>;

function openOutside(url: string) {
  Linking.openURL(url).catch(() => {});
}

/** App iOS / Android: mở web Lành trong WebView, xử lý mất mạng, nút Back, link ngoài. */
export function LanhWebView() {
  const ref = useRef<WVRef>(null);
  const canGoBack = useRef(false);
  const splashHidden = useRef(false);
  const [online, setOnline] = useState(true);
  const [failed, setFailed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);

  const hideSplash = useCallback(() => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Không để màn chờ kẹt quá lâu nếu mạng chậm.
  useEffect(() => {
    const t = setTimeout(hideSplash, 8000);
    return () => clearTimeout(t);
  }, [hideSplash]);

  useEffect(
    () =>
      NetInfo.addEventListener((s) => {
        const ok = s.isConnected !== false && s.isInternetReachable !== false;
        setOnline((prev) => {
          if (ok && !prev) {
            setFailed(null);
            setKey((k) => k + 1); // có mạng lại thì tải lại trang
          }
          return ok;
        });
      }),
    [],
  );

  // Nút Back của Android: lùi trang trong web trước khi thoát app.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack.current && ref.current) {
        ref.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  const reload = useCallback(() => {
    setFailed(null);
    setLoading(true);
    setKey((k) => k + 1);
  }, []);

  const onShouldStart = useCallback((req: ShouldStartLoadRequest) => {
    if (req.isTopFrame === false) return true; // khung bên trong trang (iframe của Apps Script)
    if (isInApp(req.url)) return true;
    openOutside(req.url);
    return false;
  }, []);

  if (!online) {
    return <StatusScreen title="Mất kết nối mạng" message="Hãy bật Wi-Fi hoặc dữ liệu di động. App sẽ tự tải lại khi có mạng." actionLabel="Thử lại" onAction={reload} />;
  }

  return (
    <View style={styles.fill}>
      <WV
        key={key}
        ref={ref}
        source={{ uri: WEB_URL }}
        style={styles.fill}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
        pullToRefreshEnabled
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        applicationNameForUserAgent="LanhApp/1.0"
        onShouldStartLoadWithRequest={onShouldStart}
        onOpenWindow={(e: WebViewOpenWindowEvent) => openOutside(e.nativeEvent.targetUrl)}
        onNavigationStateChange={(n: WebViewNavigation) => {
          canGoBack.current = n.canGoBack;
        }}
        onLoadEnd={() => {
          setLoading(false);
          hideSplash();
        }}
        onError={(e: WebViewErrorEvent) => {
          hideSplash();
          setFailed(e.nativeEvent.description || 'Không tải được trang.');
        }}
        onHttpError={(e: WebViewHttpErrorEvent) => {
          if (e.nativeEvent.statusCode >= 500) setFailed('Máy chủ Google đang bận (lỗi ' + e.nativeEvent.statusCode + ').');
        }}
        onContentProcessDidTerminate={reload}
        onRenderProcessGone={reload}
      />
      {loading && !failed ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : null}
      {failed ? <StatusScreen title="Chưa tải được Lành" message={failed} actionLabel="Tải lại" onAction={reload} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: COLORS.bg },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(247,248,249,0.6)' },
});
