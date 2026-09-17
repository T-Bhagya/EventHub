import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { updateProfileApi } from '../services/authService';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name cannot be empty.';
    if (!email.trim()) {
      newErrors.email = 'Email address cannot be empty.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!phone.trim()) newErrors.phone = 'Phone number cannot be empty.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    setGeneralError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const updatedUser = await updateProfileApi({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      await updateUser(updatedUser);

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      }
      setGeneralError(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Edit Profile" showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {generalError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.errorBoxText}>{generalError}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <InputField
              label="Full Name *"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={errors.name}
              iconName="person-outline"
            />

            <InputField
              label="Email Address *"
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              error={errors.email}
              iconName="mail-outline"
            />

            <InputField
              label="Phone Number *"
              value={phone}
              keyboardType="phone-pad"
              onChangeText={(text) => {
                setPhone(text);
                setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              error={errors.phone}
              iconName="call-outline"
            />

            <PrimaryButton
              title="Save Profile"
              onPress={handleSaveProfile}
              isLoading={isLoading}
              style={styles.saveBtn}
            />
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
  scrollContent: {
    padding: SPACING.xl,
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
  },
  saveBtn: {
    marginTop: SPACING.md,
  },
});
