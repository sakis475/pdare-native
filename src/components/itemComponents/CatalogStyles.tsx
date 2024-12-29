import { StyleSheet } from 'react-native';
import { colors } from '../../core/theme';

// Typography constants
export const typography = {
  // Font sizes
  FONT_SIZE_SMALL: 10, // Small icons
  FONT_SIZE_DETAILS: 12, // Item details, small text
  FONT_SIZE_TITLE: 14, // Item titles
  FONT_SIZE_REGULAR: 16, // Regular text, quantity
  FONT_SIZE_LARGE: 20, // Large icons
  FONT_SIZE_XLARGE: 22, // Extra large icons
  FONT_SIZE_XXLARGE: 24, // Largest text (buttons)

  // Font weights
  FONT_WEIGHT_NORMAL: 'normal',
  FONT_WEIGHT_BOLD: 'bold' as 'bold',
};

export const catalogItemStyles = StyleSheet.create({
  // Container styles
  container: {
    flexDirection: 'row',
    flex: 1,
    overflow: 'hidden',
    paddingHorizontal: 10,
  },
  containerWithPadding: {
    padding: 1,
    borderRadius: 2,
  },

  // Text container styles
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  // Title styles
  itemTitle: {
    color: colors.white,
    fontWeight: typography.FONT_WEIGHT_BOLD,
    fontSize: typography.FONT_SIZE_TITLE,
    marginBottom: 4,
    paddingVertical: 1,
  },
  itemTitleDeleted: {
    color: colors.black,
    textDecorationLine: 'line-through',
    fontWeight: typography.FONT_WEIGHT_BOLD,
    fontSize: typography.FONT_SIZE_TITLE,
    marginBottom: 4,
    paddingVertical: 1,
  },
  textPressed: {
    opacity: 0.5,
  },

  // Details styles
  itemDetails: {
    color: colors.lighterGrey,
    fontSize: typography.FONT_SIZE_DETAILS,
  },
  itemDetailsDeleted: {
    color: colors.black,
    fontSize: typography.FONT_SIZE_DETAILS,
    textDecorationLine: 'line-through',
  },

  // Button styles
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGrey,
    borderRadius: 5,
    padding: 4,
  },
  buttonsContainerLight: {
    backgroundColor: colors.white,
    padding: 0,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.slightlyLighterGrey,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  smallButton: {
    width: 33,
    height: 33,
  },
  buttonDisabled: {
    backgroundColor: colors.darkGrey,
    opacity: 0.5,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.FONT_SIZE_DETAILS,
    fontWeight: typography.FONT_WEIGHT_BOLD,
  },

  quantityText: {
    color: colors.white,
    fontSize: typography.FONT_SIZE_REGULAR,
    fontWeight: typography.FONT_WEIGHT_BOLD,
  },

  itemsDetailsDeleted: {
    color: colors.black,
    fontSize: typography.FONT_SIZE_DETAILS,
    textDecorationLine: 'line-through',
  },
});
