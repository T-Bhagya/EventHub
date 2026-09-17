import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { formatDate, formatTime, formatPrice } from '../utils/formatters';

interface OrganizerEventCardProps {
  event: Event;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewBookings: () => void;
}

export const OrganizerEventCard: React.FC<OrganizerEventCardProps> = ({
  event,
  onView,
  onEdit,
  onDelete,
  onViewBookings,
}) => {
  const defaultImage =
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';

  const bookedSeats = event.totalSeats - event.availableSeats;

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <Image
          source={{ uri: event.imageUrl || defaultImage }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.secondaryText} />
            <Text style={styles.infoText}>
              {formatDate(event.date)} • {formatTime(event.time)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={13} color={COLORS.primary} />
            <Text style={[styles.infoText, { color: COLORS.primary, fontWeight: '700' }]}>
              {formatPrice(event.price)}
            </Text>
          </View>
        </View>
      </View>

      {/* Seat Counts Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Seats</Text>
          <Text style={styles.statValue}>{event.totalSeats}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Booked</Text>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{bookedSeats}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Available</Text>
          <Text style={[styles.statValue, { color: event.availableSeats === 0 ? COLORS.error : COLORS.success }]}>
            {event.availableSeats}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.iconButton} onPress={onViewBookings}>
          <Ionicons name="people-outline" size={16} color={COLORS.primary} />
          <Text style={styles.iconButtonText}>Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={16} color={COLORS.text} />
          <Text style={[styles.iconButtonText, { color: COLORS.text }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          <Text style={[styles.iconButtonText, { color: COLORS.error }]}>Delete</Text>
        </TouchableOpacity>
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
  body: {
    flexDirection: 'row',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.md,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  title: {
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
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  iconButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
});
