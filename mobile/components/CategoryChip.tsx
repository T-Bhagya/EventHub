import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface CategoryChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  isSelected,
  onPress,
  iconName,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      {iconName && (
        <Ionicons
          name={iconName}
          size={16}
          color={isSelected ? COLORS.surface : COLORS.secondaryText}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, isSelected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  textSelected: {
    color: COLORS.surface,
    fontWeight: '600',
  },
});
