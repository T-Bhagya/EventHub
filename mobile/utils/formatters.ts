/**
 * Format currency amount to LKR string
 * Example: 2500 -> "LKR 2,500"
 * Example: 0 -> "Free"
 */
export const formatPrice = (price: number): string => {
  if (price === 0) {
    return 'Free';
  }
  return `LKR ${price.toLocaleString()}`;
};

/**
 * Format ISO or YYYY-MM-DD date string to readable format
 * Example: "2026-09-26" -> "Sat, 26 Sep 2026"
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};

/**
 * Format time string
 * Example: "19:00" -> "7:00 PM"
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  try {
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours)) return timeString;
    
    const date = new Date();
    date.setHours(hours, minutes || 0);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return timeString;
  }
};
