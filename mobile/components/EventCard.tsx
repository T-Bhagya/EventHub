import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { formatDate, formatTime, formatPrice } from '../utils/formatters';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  isFavourite?: boolean;
  onToggleFavourite?: () => void;
  horizontal?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  isFavourite = false,
  onToggleFavourite,
  horizontal = false,
}) => {
  const defaultImage =
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';

  const isSoldOut = event.availableSeats <= 0;

  return (
    <TouchableOpacity
      style={[styles.card, horizontal && styles.horizontalCard]}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Event: ${event.title}`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.imageUrl || defaultImage }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{event.category}</Text>
        </View>

        {/* Favourite Button */}
        {onToggleFavourite && (
          <TouchableOpacity
            style={styles.favouriteButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavourite();
            }}
            activeOpacity={0.8}
            accessibilityLabel="Toggle Favourite"
          >
            <Ionicons
              name={isFavourite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavourite ? COLORS.error : COLORS.text}
            />
          </TouchableOpacity>
        )}

        {/* Sold Out Badge */}
        {isSoldOut && (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutText}>SOLD OUT</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
          <Text style={styles.infoText}>
            {formatDate(event.date)} • {formatTime(event.time)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.secondaryText} />
          <Text style={styles.infoText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(event.price)}</Text>
          <Text style={styles.seatsText}>
            {isSoldOut ? 'No seats left' : `${event.availableSeats} seats left`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  horizontalCard: {
    width: 260,
    marginRight: SPACING.md,
    marginBottom: SPACING.sm,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(108, 92, 231, 0.9)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  categoryBadgeText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '600',
  },
  favouriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  soldOutText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 22,
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
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm + 4,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  seatsText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '500',
  },
});
