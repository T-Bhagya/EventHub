import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { registerApi } from '../../services/authService';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { Role } from '../../types';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('USER');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required.';
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!role) newErrors.role = 'Account type is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    setGeneralError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await registerApi({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });

      await register(data.token, data.user);
      if (data.user.role === 'ORGANIZER') {
        router.replace('/(organizer)/dashboard');
      } else {
        router.replace('/(user)');
      }
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      }
      setGeneralError(err.message || 'Registration failed. Please check your inputs.');
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
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join EventHub to discover or host events</Text>
          </View>

          {generalError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.errorBoxText}>{generalError}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            {/* Role Selection Segment */}
            <Text style={styles.roleLabel}>I am registering as an:</Text>
            <View style={styles.roleSelectorContainer}>
              <TouchableOpacity
                style={[styles.roleOption, role === 'USER' && styles.roleOptionActive]}
                onPress={() => setRole('USER')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="person"
                  size={18}
                  color={role === 'USER' ? COLORS.surface : COLORS.secondaryText}
                />
                <Text style={[styles.roleText, role === 'USER' && styles.roleTextActive]}>
                  User (Attendee)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleOption, role === 'ORGANIZER' && styles.roleOptionActive]}
                onPress={() => setRole('ORGANIZER')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="business"
                  size={18}
                  color={role === 'ORGANIZER' ? COLORS.surface : COLORS.secondaryText}
                />
                <Text style={[styles.roleText, role === 'ORGANIZER' && styles.roleTextActive]}>
                  Event Organizer
                </Text>
              </TouchableOpacity>
            </View>

            <InputField
              label="Full Name"
              placeholder="e.g. Thilini Bhagya"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={errors.name}
              iconName="person-outline"
            />

            <InputField
              label="Email Address"
              placeholder="e.g. name@example.com"
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
              label="Phone Number"
              placeholder="e.g. +94 77 123 4567"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              error={errors.phone}
              iconName="call-outline"
            />

            <InputField
              label="Password"
              placeholder="At least 6 characters"
              isPassword
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              error={errors.password}
              iconName="lock-closed-outline"
            />

            <InputField
              label="Confirm Password"
              placeholder="Re-enter password"
              isPassword
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              error={errors.confirmPassword}
              iconName="checkmark-circle-outline"
            />

            <PrimaryButton
              title="Create Account"
              onPress={handleRegister}
              isLoading={isLoading}
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    flexGrow: 1,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 4,
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
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs + 2,
  },
  roleSelectorContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBackground,
    gap: 6,
  },
  roleOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  roleTextActive: {
    color: COLORS.surface,
  },
  registerButton: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.secondaryText,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
