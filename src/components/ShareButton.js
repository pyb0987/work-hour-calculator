import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { THEME } from '../state/constants';
import { useWorkCalendar } from '../state/WorkCalendarContext';
import { generateShareUrl } from '../utils/shareUrl';

export default function ShareButton() {
  const { schedule, filledDaysCount } = useWorkCalendar();
  const [copied, setCopied] = useState(false);

  if (Platform.OS !== 'web' || filledDaysCount === 0) return null;

  const handleShare = async () => {
    const url = generateShareUrl(schedule);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: prompt user
      window.prompt('URL을 복사하세요:', url);
    }
  };

  return (
    <Pressable style={styles.button} onPress={handleShare}>
      <Text style={styles.buttonText}>
        {copied ? 'URL 복사됨!' : '공유 URL 복사'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: THEME.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  buttonText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontFamily: 'NotoSansKR_400Regular',
  },
});
