import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getEventByIdApi } from '../../services/eventService';
import { getFavouriteIds, toggleFavouriteId } from '../../storage/favouriteStorage';
import { Event } from '../../types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorState } from '../../components/ErrorState';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { formatDate, formatTime, formatPrice } from '../../utils/formatters';

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      setError(null);
      try {
        const [data, favs] = await Promise.all([
          getEventByIdApi(id),
          getFavouriteIds(),
        ]);
        setEvent(data);
        setIsFavourite(favs.includes(data.id));
      } catch (err: any) {
        setError(err.message || 'Failed to load event details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleToggleFav = async () => {
    if (!event) return;
    const updated = await toggleFavouriteId(event.id);
    setIsFavourite(updated.includes(event.id));
  };

  const handleOpenMaps = () => {
    if (!event?.location) return;
    const query = encodeURIComponent(event.location);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url).catch(() => {
      Alert.alert('Maps Unavailable', 'Could not open native maps application.');
    });
  };

  if (isLoading) {
    return <LoadingIndicator message="Loading event details..." fullScreen />;
  }

  if (error || !event) {
    return <ErrorState message={error || 'Event not found'} onRetry={() => router.back()} />;
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';

  const todayStr = new Date().toISOString().split('T')[0];
  const isPast = event.date < todayStr;
  const isSoldOut = event.availableSeats <= 0;
  const canBook = !isPast && !isSoldOut;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Event Details"
        showBack
        rightAction={
          <TouchableOpacity onPress={handleToggleFav} style={styles.favHeaderBtn}>
            <Ionicons
              name={isFavourite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavourite ? COLORS.error : COLORS.text}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Event Banner Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.imageUrl || defaultImage }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
          {isSoldOut && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>SOLD OUT</Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.contentCard}>
          <Text style={styles.title}>{event.title}</Text>

          {/* Organizer tag */}
          <View style={styles.organizerRow}>
            <Ionicons name="business-outline" size={16} color={COLORS.primary} />
            <Text style={styles.organizerText}>
              Organized by <Text style={styles.organizerName}>{event.organizer?.name || 'EventHub Organizer'}</Text>
            </Text>
          </View>

          {/* Date & Time */}
          <View style={styles.detailRow}>
            <View style={styles.iconBg}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailTitle}>Date and Time</Text>
              <Text style={styles.detailValue}>
                {formatDate(event.date)} at {formatTime(event.time)}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.detailRow}>
            <View style={styles.iconBg}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailTitle}>Location</Text>
              <Text style={styles.detailValue}>{event.location}</Text>
              <TouchableOpacity style={styles.mapsButton} onPress={handleOpenMaps} activeOpacity={0.8}>
                <Ionicons name="map-outline" size={14} color={COLORS.primary} />
                <Text style={styles.mapsButtonText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ticket Availability & Price */}
          <View style={styles.priceRowContainer}>
            <View style={styles.priceBox}>
              <Text style={styles.priceBoxLabel}>Ticket Price</Text>
              <Text style={styles.priceBoxValue}>{formatPrice(event.price)}</Text>
            </View>
            <View style={styles.seatsBox}>
              <Text style={styles.seatsBoxLabel}>Available Seats</Text>
              <Text style={[styles.seatsBoxValue, { color: isSoldOut ? COLORS.error : COLORS.success }]}>
                {isSoldOut ? '0 Seats' : `${event.availableSeats} / ${event.totalSeats}`}
              </Text>
            </View>
          </View>

          {/* Event Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionHeader}>About Event</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Price per ticket</Text>
          <Text style={styles.bottomPriceValue}>{formatPrice(event.price)}</Text>
        </View>

        <PrimaryButton
          title={isPast ? 'Event Passed' : isSoldOut ? 'SOLD OUT' : 'Book Tickets'}
          onPress={() => router.push(`/booking/create/${event.id}`)}
          disabled={!canBook}
          style={styles.bookButton}
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
  favHeaderBtn: {
    padding: SPACING.xs,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  imageContainer: {
    height: 220,
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
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: 'rgba(108, 92, 231, 0.95)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  categoryText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  soldOutBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  soldOutText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  contentCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -RADIUS.lg,
    padding: SPACING.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 28,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  organizerText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginLeft: 6,
  },
  organizerName: {
    fontWeight: '700',
    color: COLORS.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  detailTextCol: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
  },
  mapsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  priceRowContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceBox: {
    alignItems: 'center',
  },
  priceBoxLabel: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  priceBoxValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  seatsBox: {
    alignItems: 'center',
  },
  seatsBoxLabel: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  seatsBoxValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  descriptionSection: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.secondaryText,
    lineHeight: 22,
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
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
  },
  bottomPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bookButton: {
    minWidth: 160,
  },
});
