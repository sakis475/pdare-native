import { Text, View } from 'react-native';
import { colors } from '../../core/theme';
import { DoubleRightIcon } from '../basic/Icons';

export const CategoryHeader = ({ title }: any) => (
  <View
    style={{
      marginBottom: 10,
      backgroundColor: colors.darkerGrey,
      paddingVertical: 10,
    }}
  >
    <View
      style={{
        marginLeft: 16,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <DoubleRightIcon />
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.white }}>{title}</Text>
    </View>
  </View>
);
