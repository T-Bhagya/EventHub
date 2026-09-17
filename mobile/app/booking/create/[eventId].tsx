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
import { useAuth } from '../../../contexts/AuthContext';
import { getEventByIdApi } from '../../../services/eventService';
import { createBookingApi } from '../../../services/bookingService';
import { Event } from '../../../types';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { InputField } from '../../../components/InputField';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { ErrorState } from '../../../components/ErrorState';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { formatDate, formatTime, formatPrice } from '../../../utils/formatters';

export default function CreateBookingScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [phone, setPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      try {
        const data = await getEventByIdApi(eventId);
        setEvent(data);
        if (data.availableSeats <= 0) {
          setError('Sorry, this event is completely sold out.');
        }
      } catch (err: any) {
        setError(err.message || 'Unable to load event details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleQuantityChange = (delta: number) => {
    if (!event) return;
    const newQty = ticketQuantity + delta;
    if (newQty >= 1 && newQty <= event.availableSeats) {
      setTicketQuantity(newQty);
    }
  };

  const validate = () => {
    if (!phone.trim()) {
      setPhoneError('Contact phone number is required.');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleBookingSubmit = async () => {
    if (!event) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const booking = await createBookingApi({
        eventId: event.id,
        ticketQuantity,
        phone: phone.trim(),
        note: note.trim() || undefined,
      });

      // Navigate to dedicated Confirmation Screen
      router.replace({
        pathname: '/booking/confirmation',
        params: { bookingId: booking.id },
      });
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Failed to process booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator message="Loading booking form..." fullScreen />;
  }

  if (error || !event) {
    return <ErrorState message={error || 'Event unavailable for booking.'} onRetry={() => router.back()} />;
  }

  const totalPrice = event.price * ticketQuantity;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Book Tickets" showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Event Brief Header Card */}
          <View style={styles.eventBriefCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {formatDate(event.date)} • {formatTime(event.time)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.secondaryText} />
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
          </View>

          {/* Customer Details Form */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Attendee Information</Text>

            <InputField
              label="Full Name"
              value={user?.name}
              editable={false}
              iconName="person-outline"
              style={{ color: COLORS.secondaryText }}
            />

            <InputField
              label="Email Address"
              value={user?.email}
              editable={false}
              iconName="mail-outline"
              style={{ color: COLORS.secondaryText }}
            />

            <InputField
              label="Phone Number *"
              placeholder="Contact phone for booking"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setPhoneError(null);
              }}
              error={phoneError || undefined}
              iconName="call-outline"
            />

            <InputField
              label="Special Notes (Optional)"
              placeholder="e.g. Dietary preferences or group seating"
              value={note}
              onChangeText={setNote}
              iconName="chatbox-outline"
            />
          </View>

          {/* Ticket Selection Card */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Select Tickets</Text>
            <Text style={styles.seatsRemainingText}>
              Available Seats: <Text style={{ fontWeight: '700', color: COLORS.primary }}>{event.availableSeats}</Text>
            </Text>

            <View style={styles.quantityContainer}>
              <View>
                <Text style={styles.ticketTypeLabel}>Standard Admission</Text>
                <Text style={styles.unitPriceText}>{formatPrice(event.price)} / ticket</Text>
              </View>

              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={[styles.counterBtn, ticketQuantity <= 1 && styles.counterBtnDisabled]}
                  onPress={() => handleQuantityChange(-1)}
                  disabled={ticketQuantity <= 1}
                >
                  <Ionicons name="remove" size={18} color={ticketQuantity <= 1 ? '#94A3B8' : COLORS.text} />
                </TouchableOpacity>

                <Text style={styles.counterValue}>{ticketQuantity}</Text>

                <TouchableOpacity
                  style={[styles.counterBtn, ticketQuantity >= event.availableSeats && styles.counterBtnDisabled]}
                  onPress={() => handleQuantityChange(1)}
                  disabled={ticketQuantity >= event.availableSeats}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={ticketQuantity >= event.availableSeats ? '#94A3B8' : COLORS.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Pricing Breakdown Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {formatPrice(event.price)} × {ticketQuantity} ticket(s)
              </Text>
              <Text style={styles.summaryValue}>{formatPrice(totalPrice)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Booking Fee</Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>Free</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total to Pay</Text>
          <Text style={styles.bottomTotalValue}>{formatPrice(totalPrice)}</Text>
        </View>

        <PrimaryButton
          title="Confirm & Book"
          onPress={handleBookingSubmit}
          isLoading={isSubmitting}
          style={styles.confirmBtn}
        />
      </View>
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
    paddingBottom: 100,
  },
  eventBriefCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginLeft: 6,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  seatsRemainingText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ticketTypeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  unitPriceText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 24,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.secondaryText,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
  },
  bottomTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  confirmBtn: {
    minWidth: 160,
  },
});
