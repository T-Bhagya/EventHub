import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { formatDate, formatTime, formatPrice } from '../utils/formatters';

interface BookingCardProps {
  booking: Booking;
  onView: () => void;
  onCancel?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onView, onCancel }) => {
  const event = booking.event;
  const defaultImage =
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { bg: '#ECFDF5', text: COLORS.success, border: '#A7F3D0' };
      case 'CANCELLED':
        return { bg: '#FEF2F2', text: COLORS.error, border: '#FCA5A5' };
      case 'COMPLETED':
        return { bg: '#F3F4F6', text: COLORS.secondaryText, border: '#E5E7EB' };
      default:
        return { bg: '#EEF2FF', text: COLORS.primary, border: '#C7D2FE' };
    }
  };

  const statusStyle = getStatusColor(booking.status);
  const isCancellable = booking.status === 'CONFIRMED' && onCancel;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.refContainer}>
          <Ionicons name="ticket-outline" size={16} color={COLORS.primary} />
          <Text style={styles.refText}>{booking.bookingReference}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{booking.status}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Image
          source={{ uri: event?.imageUrl || defaultImage }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.details}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event?.title || 'Event Details'}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.secondaryText} />
            <Text style={styles.infoText}>
              {formatDate(event?.date || '')} • {formatTime(event?.time || '')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={14} color={COLORS.secondaryText} />
            <Text style={styles.infoText}>
              {booking.ticketQuantity} {booking.ticketQuantity === 1 ? 'ticket' : 'tickets'}
            </Text>
          </View>

          <Text style={styles.totalPrice}>Total: {formatPrice(booking.totalPrice)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.viewButton} onPress={onView} activeOpacity={0.7}>
          <Text style={styles.viewButtonText}>View Booking</Text>
        </TouchableOpacity>

        {isCancellable && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: SPACING.md,
  },
  refContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: '#E5E7EB',
  },
  details: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginLeft: 4,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: SPACING.sm,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  viewButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 13,
  },
});
