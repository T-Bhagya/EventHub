import React, { useState, useEffect } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getOrganizerEventByIdApi, updateOrganizerEventApi } from '../../../services/organizerService';
import { Event } from '../../../types';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { InputField } from '../../../components/InputField';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { ErrorState } from '../../../components/ErrorState';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';

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

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [totalSeats, setTotalSeats] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        const data = await getOrganizerEventByIdApi(id);
        setEvent(data);
        setTitle(data.title);
        setImageUrl(data.imageUrl || '');
        setDescription(data.description);
        setDate(data.date);
        setTime(data.time);
        setLocation(data.location);
        setCategory(data.category);
        setPrice(data.price.toString());
        setTotalSeats(data.totalSeats.toString());
      } catch (err: any) {
        setGeneralError(err.message || 'Failed to load event data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!date) {
      newErrors.date = 'Date is required.';
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (date < todayStr) {
        newErrors.date = 'Event date cannot be in the past.';
      }
    }
    if (!time.trim()) newErrors.time = 'Time is required.';
    if (!location.trim()) newErrors.location = 'Location is required.';
    if (!category) newErrors.category = 'Category is required.';

    const p = parseFloat(price);
    if (isNaN(p) || p < 0) newErrors.price = 'Price must be a valid non-negative number.';

    const s = parseInt(totalSeats, 10);
    if (isNaN(s) || s <= 0) {
      newErrors.totalSeats = 'Total seats must be greater than 0.';
    } else if (event) {
      const booked = event.totalSeats - event.availableSeats;
      if (s < booked) {
        newErrors.totalSeats = `Total seats cannot be less than ${booked} because ${booked} ticket(s) are already booked.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!id) return;
    setGeneralError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await updateOrganizerEventApi(id, {
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

      Alert.alert('Success', 'Event details updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      }
      setGeneralError(err.message || 'Failed to update event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator message="Loading event details..." fullScreen />;
  }

  if (generalError && !event) {
    return <ErrorState message={generalError} onRetry={() => router.back()} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Edit Event" showBack />

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
              label="Event Name *"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setErrors((prev) => ({ ...prev, title: '' }));
              }}
              error={errors.title}
              iconName="calendar-outline"
            />

            <InputField
              label="Image URL"
              value={imageUrl}
              onChangeText={setImageUrl}
              error={errors.imageUrl}
              iconName="image-outline"
            />

            <InputField
              label="Description *"
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

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <InputField
                  label="Date (YYYY-MM-DD) *"
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
              label="Location *"
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
                  label="Total Seats *"
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
              title="Save Changes"
              onPress={handleUpdate}
              isLoading={isSubmitting}
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
  submitButton: {
    marginTop: SPACING.md,
  },
});
