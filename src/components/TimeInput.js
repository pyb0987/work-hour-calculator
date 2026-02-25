import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { THEME } from '../state/constants';

export default function TimeInput({ value, onChange, onBlur, style, placeholder, editable = true }) {
  const handleChange = (text) => {
    const cleaned = text.replace(/[^0-9:]/g, '');
    if (cleaned.length === 2 && !cleaned.includes(':') && value.length < cleaned.length) {
      onChange(cleaned + ':');
      return;
    }
    if (cleaned.length <= 5) {
      onChange(cleaned);
    }
  };

  const handleBlur = () => {
    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
      const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
      onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
    onBlur?.();
  };

  return (
    <TextInput
      style={[styles.timeInput, style]}
      value={value}
      onChangeText={handleChange}
      onBlur={handleBlur}
      keyboardType="numbers-and-punctuation"
      maxLength={5}
      selectTextOnFocus
      placeholder={placeholder}
      placeholderTextColor={THEME.textDim}
      editable={editable}
    />
  );
}

const styles = StyleSheet.create({
  timeInput: {
    backgroundColor: THEME.card,
    color: THEME.text,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
    textAlign: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.border,
    width: 52,
  },
});
