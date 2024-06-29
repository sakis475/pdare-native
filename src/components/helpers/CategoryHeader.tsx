import { Text, View } from 'react-native';
import { colors } from '../../core/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
      <Icon name={'chevron-double-right'} size={20} color="#fff" />
      <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white' }}>{title}</Text>
    </View>
  </View>
);
