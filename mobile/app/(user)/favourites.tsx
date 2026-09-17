import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEventsApi } from '../../services/eventService';
import { getFavouriteIds, toggleFavouriteId } from '../../storage/favouriteStorage';
import { Event } from '../../types';
import { EventCard } from '../../components/EventCard';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, SPACING } from '../../constants/theme';

export default function FavouritesScreen() {
  const router = useRouter();

  const [favouriteEvents, setFavouriteEvents] = useState<Event[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFavourites = async () => {
    try {
      const favs = await getFavouriteIds();
      setFavouriteIds(favs);

      if (favs.length === 0) {
        setFavouriteEvents([]);
      } else {
        const allEvents = await getEventsApi();
        const filtered = allEvents.filter((e) => favs.includes(e.id));
        setFavouriteEvents(filtered);
      }
    } catch (error) {
      console.error('Error fetching favourite events:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavourites();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFavourites();
  };

  const handleToggleFavourite = async (eventId: string) => {
    const updated = await toggleFavouriteId(eventId);
    setFavouriteIds(updated);
    setFavouriteEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favourites</Text>
      </View>

      {isLoading && !isRefreshing ? (
        <LoadingIndicator message="Loading saved events..." fullScreen={false} />
      ) : (
        <FlatList
          data={favouriteEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="heart-outline"
              title="No favourite events yet"
              description="Save events you are interested in by tapping the heart icon on any event card."
              buttonTitle="Explore Events"
              onButtonPress={() => router.push('/(user)/explore')}
            />
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              isFavourite={true}
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
});
