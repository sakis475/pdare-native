import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors } from '../../core/theme';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';
import { UserIcon } from '../basic/Icons';

export const sharedStyles = {
  HEADER_HEIGHT: 60,
  HORIZONTAL_PADDING: 16,
  SIDE_SPACING: 60,
  TITLE_FONT_SIZE: 18,
  SUBTITLE_FONT_SIZE: 16,
  SUBTITLE_MARGIN_TOP: 2,
};

export function HeaderBar({
  headerTitle,
  headerSubtitle,
}: {
  headerTitle?: string;
  headerSubtitle?: string;
}) {
  return (
    <View style={styles.headerBarContainer}>
      <View style={styles.textContainer}>
        <Text
          style={styles.headerTitle}
          adjustsFontSizeToFit
          numberOfLines={headerSubtitle ? 1 : 2}
        >
          {headerTitle}
        </Text>
        {headerSubtitle && (
          <Text style={styles.headerSubtitle} adjustsFontSizeToFit numberOfLines={1}>
            {headerSubtitle}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigate(ScreenNames.RestaurantSettingsScreen)}
      >
        <Text style={styles.profileIcon}>
          <UserIcon />
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export const styles = StyleSheet.create({
  headerTitleContainer: {
    height: sharedStyles.HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sharedStyles.HORIZONTAL_PADDING,
  },

  // Styles for HeaderBar
  headerBarContainer: {
    height: sharedStyles.HEADER_HEIGHT,
    backgroundColor: colors.darkerGrey,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: sharedStyles.HORIZONTAL_PADDING,
  },
  textContainer: {
    position: 'absolute',
    left: sharedStyles.SIDE_SPACING,
    right: sharedStyles.SIDE_SPACING,
    height: sharedStyles.HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Shared text styles
  headerTitle: {
    color: colors.white,
    fontWeight: '700',
    fontSize: sharedStyles.TITLE_FONT_SIZE,
    textAlign: 'center',
    width: '100%',
  },
  headerSubtitle: {
    color: colors.white,
    fontWeight: '500',
    fontSize: sharedStyles.SUBTITLE_FONT_SIZE,
    textAlign: 'center',
    width: '100%',
    marginTop: sharedStyles.SUBTITLE_MARGIN_TOP,
  },
  boldText: {
    fontWeight: 'bold',
  },

  // Profile button styles
  profileButton: {
    position: 'absolute',
    right: sharedStyles.HORIZONTAL_PADDING,
    height: sharedStyles.HEADER_HEIGHT,
    justifyContent: 'center',
  },
  profileIcon: {
    color: colors.white,
  },
});
