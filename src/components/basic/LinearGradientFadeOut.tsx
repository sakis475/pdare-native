import { Platform, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../core/theme';

export const LinearGradientFadeOut = ({ height = 100 }: { height?: number }) => {
  return (
    <LinearGradient
      style={[styles.gradient, { height: height, opacity: Platform.OS === 'ios' ? 0.2 : 1 }]}
      colors={['transparent', colors.black]}
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
});
