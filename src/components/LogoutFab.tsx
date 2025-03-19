import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LogoutIcon } from './basic/Icons';
import { logout } from '../helpers/storage/tokenRequests';
import { colors } from '../core/theme';
import { useStrings } from '../core/localization/languageContext';

interface CustomLogoutProps {
  variant?: 'upperRightSmall' | 'normal';
}

export const LogoutFAB: React.FC<CustomLogoutProps> = ({ variant = 'normal' }) => {
  const strings = useStrings();

  if (variant === 'upperRightSmall') {
    return (
      <TouchableOpacity style={styles.smallButtonContainer} onPress={() => logout()}>
        <Text style={styles.smallButtonText}>{strings.LOGOUT}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.fabContainer} onPress={() => logout()}>
      <View style={styles.fabWrapper}>
        <View style={styles.fab}>
          <LogoutIcon style={styles.icon} />
        </View>
        <Text style={styles.fabText} numberOfLines={1}>
          {strings.LOGOUT}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Original styles for normal variant
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fabWrapper: {
    alignItems: 'center',
    width: 'auto',
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.slightlyDarkerGrey,
    borderColor: colors.slightlyLighterGrey,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  icon: {
    zIndex: 2,
  },
  fabText: {
    color: colors.white,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    backgroundColor: colors.slightlyDarkerGrey,
    paddingHorizontal: 4,
    borderRadius: 4,
    zIndex: 1,
    width: 'auto',
    maxWidth: 200,
  },

  // New styles for upperRightSmall variant
  smallButtonContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.slightlyDarkerGrey,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderColor: colors.slightlyLighterGrey,
    borderWidth: 1,
    zIndex: 10,
  },
  smallButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
});
