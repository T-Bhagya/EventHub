import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVOURITES_KEY = '@eventhub_favourite_events';

export const getFavouriteIds = async (): Promise<string[]> => {
  try {
    const json = await AsyncStorage.getItem(FAVOURITES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error getting favourite IDs:', error);
    return [];
  }
};

export const toggleFavouriteId = async (eventId: string): Promise<string[]> => {
  try {
    const current = await getFavouriteIds();
    let updated: string[];
    if (current.includes(eventId)) {
      updated = current.filter((id) => id !== eventId);
    } else {
      updated = [...current, eventId];
    }
    await AsyncStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error toggling favourite ID:', error);
    return [];
  }
};

export const isFavouriteId = async (eventId: string): Promise<boolean> => {
  try {
    const current = await getFavouriteIds();
    return current.includes(eventId);
  } catch (error) {
    return false;
  }
};
