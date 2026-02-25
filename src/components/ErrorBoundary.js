import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { THEME } from '../state/constants';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😵</Text>
          <Text style={styles.title}>앗, 문제가 생겼어요</Text>
          <Text style={styles.message}>앱에서 오류가 발생했습니다.</Text>
          <Pressable
            style={styles.button}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.buttonText}>다시 시도</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: THEME.text, marginBottom: 8 },
  message: { fontSize: 14, color: THEME.textSecondary, marginBottom: 24 },
  button: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: THEME.textOnPrimary },
});
