import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { colors } from '../../core/theme';
import { sharedStyles, styles } from '../helpers/HeaderBar';

const CustomNavigationScreenHeaderTitle = ({
  title,
  subtitle = '',
  bold = true,
  minFontSize = 12,
}: {
  title: string;
  subtitle?: string;
  bold?: boolean;
  minFontSize?: number;
}) => {
  const { width } = useWindowDimensions();

  return (
    <View
      style={[styles.headerTitleContainer, { maxWidth: width - sharedStyles.SIDE_SPACING * 2 }]}
    >
      <Text
        style={[styles.headerTitle, styles.boldText]}
        numberOfLines={subtitle ? 1 : 2}
        adjustsFontSizeToFit
        minimumFontScale={minFontSize / sharedStyles.TITLE_FONT_SIZE}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[styles.headerSubtitle, styles.boldText]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={minFontSize / sharedStyles.SUBTITLE_FONT_SIZE}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default CustomNavigationScreenHeaderTitle;
