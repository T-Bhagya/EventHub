import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function OrganizerProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of EventHub?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Organizer Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </Text>
          </View>

          <Text style={styles.userName}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>EVENT ORGANIZER</Text>
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Contact Phone</Text>
                <Text style={styles.detailValue}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBg}>
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.actionTitle}>Edit Profile Information</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/(organizer)/events')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBg}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.actionTitle}>Manage My Events</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.secondaryText} />
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title="Log Out"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          textStyle={{ color: COLORS.error }}
          icon={<Ionicons name="log-out-outline" size={20} color={COLORS.error} />}
        />
      </ScrollView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.surface,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  detailsList: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailTextContainer: {
    marginLeft: SPACING.md,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  actionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionIconBg: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  actionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  logoutButton: {
    borderColor: COLORS.error,
  },
});
