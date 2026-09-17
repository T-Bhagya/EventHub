import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getEventsApi } from '../../services/eventService';
import { getFavouriteIds, toggleFavouriteId } from '../../storage/favouriteStorage';
import { Event } from '../../types';
import { EventCard } from '../../components/EventCard';
import { CategoryChip } from '../../components/CategoryChip';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorState } from '../../components/ErrorState';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

const CATEGORIES = [
  { label: 'All', icon: 'grid-outline' },
  { label: 'Technology', icon: 'hardware-chip-outline' },
  { label: 'Music', icon: 'musical-notes-outline' },
  { label: 'Business', icon: 'briefcase-outline' },
  { label: 'Food', icon: 'restaurant-outline' },
  { label: 'Education', icon: 'school-outline' },
  { label: 'Art', icon: 'color-palette-outline' },
  { label: 'Community', icon: 'people-outline' },
  { label: 'Sports', icon: 'football-outline' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [events, setEvents] = useState<Event[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const firstName = user?.name ? user.name.split(' ')[0] : 'Friend';

  const loadData = async (cat = selectedCategory) => {
    setError(null);
    try {
      const [fetchedEvents, favs] = await Promise.all([
        getEventsApi(undefined, cat),
        getFavouriteIds(),
      ]);
      setEvents(fetchedEvents);
      setFavouriteIds(favs);
    } catch (err: any) {
      setError(err.message || 'Failed to load events.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedCategory])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleToggleFavourite = async (eventId: string) => {
    const updated = await toggleFavouriteId(eventId);
    setFavouriteIds(updated);
  };

  const handleCategoryPress = (categoryLabel: string) => {
    setSelectedCategory(categoryLabel);
    setIsLoading(true);
    loadData(categoryLabel);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/(user)/explore',
        params: { search: searchQuery.trim() },
      });
    }
  };

  const featuredEvents = events.slice(0, 4);
  const upcomingEvents = events.slice(4);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Welcome Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
          <Text style={styles.subheading}>Find something exciting to do</Text>
        </View>

        <TouchableOpacity
          style={styles.profileBadge}
          onPress={() => router.push('/(user)/profile')}
        >
          <Ionicons name="person-circle" size={40} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
      >
        {/* Search Bar Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, locations..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.secondaryText} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories Horizontal Scroll */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.label}
              label={cat.label}
              iconName={cat.icon as any}
              isSelected={selectedCategory === cat.label}
              onPress={() => handleCategoryPress(cat.label)}
            />
          ))}
        </ScrollView>

        {isLoading && !isRefreshing ? (
          <LoadingIndicator message="Loading events..." fullScreen={false} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.secondaryText} />
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySub}>Try selecting another category.</Text>
          </View>
        ) : (
          <>
            {/* Featured Events Carousel */}
            {featuredEvents.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderContainer}>
                  <Text style={styles.sectionTitle}>Featured Events</Text>
                  <TouchableOpacity onPress={() => router.push('/(user)/explore')}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalEventsScroll}
                >
                  {featuredEvents.map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      horizontal
                      isFavourite={favouriteIds.includes(evt.id)}
                      onToggleFavourite={() => handleToggleFavourite(evt.id)}
                      onPress={() => router.push(`/event/${evt.id}`)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Upcoming Events List */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                <TouchableOpacity onPress={() => router.push('/(user)/explore')}>
                  <Text style={styles.seeAllText}>Explore</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.verticalEventsList}>
                {(upcomingEvents.length > 0 ? upcomingEvents : events).map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    isFavourite={favouriteIds.includes(evt.id)}
                    onToggleFavourite={() => handleToggleFavourite(evt.id)}
                    onPress={() => router.push(`/event/${evt.id}`)}
                  />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  profileBadge: {
    padding: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.xl,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xs,
  },
  section: {
    marginTop: SPACING.sm,
  },
  horizontalEventsScroll: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xs,
  },
  verticalEventsList: {
    paddingHorizontal: SPACING.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 4,
  },
});
