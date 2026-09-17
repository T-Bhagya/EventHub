import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getEventsApi } from '../../services/eventService';
import { getFavouriteIds, toggleFavouriteId } from '../../storage/favouriteStorage';
import { Event } from '../../types';
import { EventCard } from '../../components/EventCard';
import { CategoryChip } from '../../components/CategoryChip';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

const CATEGORIES = [
  'All',
  'Technology',
  'Music',
  'Business',
  'Food',
  'Education',
  'Art',
  'Community',
  'Sports',
];

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string; category?: string }>();

  const [search, setSearch] = useState(params.search || '');
  const [selectedCategory, setSelectedCategory] = useState(params.category || 'All');
  const [events, setEvents] = useState<Event[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setError(null);
    try {
      const [data, favs] = await Promise.all([
        getEventsApi(search, selectedCategory),
        getFavouriteIds(),
      ]);
      setEvents(data);
      setFavouriteIds(favs);
    } catch (err: any) {
      setError(err.message || 'Unable to load events.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [search, selectedCategory])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEvents();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setIsLoading(true);
  };

  const handleToggleFavourite = async (eventId: string) => {
    const updated = await toggleFavouriteId(eventId);
    setFavouriteIds(updated);
  };

  const isFilterActive = search !== '' || selectedCategory !== 'All';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Events</Text>
        {isFilterActive && (
          <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
            <Ionicons name="refresh-outline" size={14} color={COLORS.primary} />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={COLORS.secondaryText} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, location, keyword..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={(text) => setSearch(text)}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.secondaryText} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Categories Horizontal Selector */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <CategoryChip
              label={item}
              isSelected={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
            />
          )}
        />
      </View>

      {/* Events List */}
      {isLoading && !isRefreshing ? (
        <LoadingIndicator message="Finding events..." fullScreen={false} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEvents} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.eventsList}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <EmptyState
              iconName="search-outline"
              title="No events match your search"
              description="Try modifying your search keywords or clearing category filters."
              buttonTitle={isFilterActive ? 'Reset Filters' : undefined}
              onButtonPress={isFilterActive ? handleResetFilters : undefined}
            />
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              isFavourite={favouriteIds.includes(item.id)}
              onToggleFavourite={() => handleToggleFavourite(item.id)}
              onPress={() => router.push(`/event/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    backgroundColor: '#EEF2FF',
    borderRadius: RADIUS.sm,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.xl,
    marginVertical: SPACING.sm,
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
  categoriesContainer: {
    marginBottom: SPACING.sm,
  },
  categoriesList: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xs,
  },
  eventsList: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
});
