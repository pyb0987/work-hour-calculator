import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, NotoSansKR_400Regular, NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr';
import * as SplashScreen from 'expo-splash-screen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { WorkCalendarProvider, useWorkCalendar } from './src/state/WorkCalendarContext';
import { THEME } from './src/state/constants';
import WeeklyHeader from './src/components/WeeklyHeader';
import ProgressSummary from './src/components/ProgressSummary';
import SettingsRow from './src/components/SettingsRow';
import TimetablePresets from './src/components/TimetablePresets';
import Timetable from './src/components/Timetable';
import DaySummaryRow from './src/components/DaySummaryRow';
import { parseShareUrl } from './src/utils/shareUrl';

SplashScreen.preventAutoHideAsync().catch(() => {});

if (Platform.OS === 'web') {
  const bgColor = THEME.bg;
  document.documentElement.style.backgroundColor = bgColor;
  document.body.style.backgroundColor = bgColor;
  document.body.style.margin = '0';

  // PWA: inject manifest link
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }

  // PWA: inject apple-mobile-web-app meta tags
  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-capable';
    meta.content = 'yes';
    document.head.appendChild(meta);
  }

  // PWA: register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

function SharedBanner({ onDismiss }) {
  return (
    <View style={styles.sharedBanner}>
      <Text style={styles.sharedBannerText}>공유된 스케줄입니다</Text>
      <Pressable onPress={onDismiss}>
        <Text style={styles.sharedBannerClose}>x</Text>
      </Pressable>
    </View>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ NotoSansKR_400Regular, NotoSansKR_700Bold });
  const { loaded, loadSharedSchedule } = useWorkCalendar();
  const [showSharedBanner, setShowSharedBanner] = useState(false);

  useEffect(() => {
    if (!loaded || Platform.OS !== 'web') return;
    const shared = parseShareUrl();
    if (shared) {
      loadSharedSchedule(shared);
      setShowSharedBanner(true);
      // Clean hash from URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [loaded, loadSharedSchedule]);

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} onLayout={onLayoutRootView}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showSharedBanner && <SharedBanner onDismiss={() => setShowSharedBanner(false)} />}
        <WeeklyHeader />
        <ProgressSummary />
        <View style={styles.timetableSection}>
          <SettingsRow />
          <TimetablePresets />
          <Timetable />
          <DaySummaryRow />
        </View>
      </ScrollView>
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <WorkCalendarProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </WorkCalendarProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    ...(Platform.OS === 'web' ? { maxWidth: 480, alignSelf: 'center', width: '100%' } : {}),
  },
  timetableSection: {
    gap: 10,
    marginTop: 16,
  },
  sharedBanner: {
    marginTop: 8,
    backgroundColor: THEME.surfaceLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  sharedBannerText: {
    fontSize: 13,
    color: THEME.primaryDark,
    fontFamily: 'NotoSansKR_400Regular',
    fontWeight: '600',
  },
  sharedBannerClose: {
    fontSize: 16,
    color: THEME.textSecondary,
    paddingHorizontal: 6,
    fontWeight: '700',
  },
});
