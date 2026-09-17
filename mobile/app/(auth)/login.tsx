import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { loginApi } from '../../services/authService';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setGeneralError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await loginApi(email.trim(), password);
      await login(data.token, data.user);
      if (data.user.role === 'ORGANIZER') {
        router.replace('/(organizer)/dashboard');
      } else {
        router.replace('/(user)');
      }
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      }
      setGeneralError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header branding */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="calendar-sharp" size={36} color={COLORS.surface} />
            </View>
            <Text style={styles.appName}>EventHub</Text>
            <Text style={styles.subtitle}>Discover & Book Exciting Events</Text>
          </View>

          {/* Form container */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formDescription}>Sign in to access your account</Text>

            {generalError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorBoxText}>{generalError}</Text>
              </View>
            ) : null}

            <InputField
              label="Email Address"
              placeholder="user@eventhub.lk"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              error={errors.email}
              iconName="mail-outline"
            />

            <InputField
              label="Password"
              placeholder="Enter your password"
              isPassword
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              error={errors.password}
              iconName="lock-closed-outline"
            />

            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.loginButton}
            />

            {/* Quick credentials hint for testing */}
            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>Demo Quick Logins:</Text>
              <TouchableOpacity
                onPress={() => {
                  setEmail('user@eventhub.lk');
                  setPassword('password123');
                }}
              >
                <Text style={styles.hintItem}>👤 User: user@eventhub.lk / password123</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEmail('organizer@eventhub.lk');
                  setPassword('password123');
                }}
              >
                <Text style={styles.hintItem}>🎪 Organizer: organizer@eventhub.lk / password123</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer navigate to Register */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  formDescription: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginBottom: SPACING.lg,
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorBoxText: {
    color: COLORS.error,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  loginButton: {
    marginTop: SPACING.sm,
  },
  hintBox: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#F3F4F6',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryText,
    marginBottom: 6,
  },
  hintItem: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.secondaryText,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
