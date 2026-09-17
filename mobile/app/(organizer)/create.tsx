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
import { createOrganizerEventApi } from '../../services/organizerService';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

const CATEGORIES = [
  'Technology',
  'Music',
  'Business',
  'Food',
  'Education',
  'Art',
  'Community',
  'Sports',
];

export default function CreateEventScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-10-25');
  const [time, setTime] = useState('18:00');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('0');
  const [totalSeats, setTotalSeats] = useState('100');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Event name is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!date) {
      newErrors.date = 'Date is required (YYYY-MM-DD).';
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (date < todayStr) {
        newErrors.date = 'Event date cannot be in the past.';
      }
    }
    if (!time.trim()) newErrors.time = 'Time is required (HH:mm).';
    if (!location.trim()) newErrors.location = 'Location is required.';
    if (!category) newErrors.category = 'Category is required.';

    const p = parseFloat(price);
    if (isNaN(p) || p < 0) newErrors.price = 'Price must be a valid non-negative number.';

    const s = parseInt(totalSeats, 10);
    if (isNaN(s) || s <= 0) newErrors.totalSeats = 'Total seats must be greater than 0.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateEvent = async () => {
    setGeneralError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await createOrganizerEventApi({
        title: title.trim(),
        imageUrl: imageUrl.trim() || undefined,
        description: description.trim(),
        date,
        time: time.trim(),
        location: location.trim(),
        category,
        price: parseFloat(price),
        totalSeats: parseInt(totalSeats, 10),
      });

      Alert.alert('Success 🎉', 'Event created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(organizer)/events'),
        },
      ]);
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      }
      setGeneralError(err.message || 'Failed to create event. Please try again.');
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
          <Text style={styles.headerTitle}>Create New Event</Text>
          <Text style={styles.headerSub}>Fill in event details to publish to EventHub</Text>

          {generalError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.errorBoxText}>{generalError}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <InputField
              label="Event Name *"
              placeholder="e.g. Colombo Tech Meetup 2026"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setErrors((prev) => ({ ...prev, title: '' }));
              }}
              error={errors.title}
              iconName="calendar-outline"
            />

            <InputField
              label="Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChangeText={setImageUrl}
              error={errors.imageUrl}
              iconName="image-outline"
            />

            <InputField
              label="Description *"
              placeholder="Describe what attendees can expect..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setErrors((prev) => ({ ...prev, description: '' }));
              }}
              error={errors.description}
              iconName="document-text-outline"
            />

            {/* Category Selector */}
            <Text style={styles.fieldLabel}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryOption, category === cat && styles.categoryOptionActive]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryOptionText, category === cat && styles.categoryOptionTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <InputField
                  label="Date (YYYY-MM-DD) *"
                  placeholder="2026-10-25"
                  value={date}
                  onChangeText={(text) => {
                    setDate(text);
                    setErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  error={errors.date}
                  iconName="time-outline"
                />
              </View>

              <View style={styles.halfInput}>
                <InputField
                  label="Time (HH:mm) *"
                  placeholder="18:00"
                  value={time}
                  onChangeText={(text) => {
                    setTime(text);
                    setErrors((prev) => ({ ...prev, time: '' }));
                  }}
                  error={errors.time}
                  iconName="alarm-outline"
                />
              </View>
            </View>

            <InputField
              label="Location / Venue *"
              placeholder="e.g. BMICH, Colombo 07"
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                setErrors((prev) => ({ ...prev, location: '' }));
              }}
              error={errors.location}
              iconName="location-outline"
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <InputField
                  label="Price (LKR) *"
                  placeholder="0 for Free"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={(text) => {
                    setPrice(text);
                    setErrors((prev) => ({ ...prev, price: '' }));
                  }}
                  error={errors.price}
                  iconName="cash-outline"
                />
              </View>

              <View style={styles.halfInput}>
                <InputField
                  label="Total Capacity *"
                  placeholder="100"
                  keyboardType="number-pad"
                  value={totalSeats}
                  onChangeText={(text) => {
                    setTotalSeats(text);
                    setErrors((prev) => ({ ...prev, totalSeats: '' }));
                  }}
                  error={errors.totalSeats}
                  iconName="people-outline"
                />
              </View>
            </View>

            <PrimaryButton
              title="Publish Event"
              onPress={handleCreateEvent}
              isLoading={isLoading}
              style={styles.submitButton}
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 2,
    marginBottom: SPACING.lg,
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
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: SPACING.sm,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  categoryScroll: {
    marginBottom: SPACING.lg,
  },
  categoryOption: {
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  categoryOptionTextActive: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});
