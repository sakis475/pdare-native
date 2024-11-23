import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IoniconsIcons from 'react-native-vector-icons/Ionicons';

import { colors } from '../../core/theme';
import { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const CommentIcon = ({
  size = 13,
  color = colors.veryLighterGrey,
  style,
}: IconProps = {}) => {
  return <MaterialIcons name="insert-comment" size={size} color={color} style={style} />;
};

export const LogoutIcon = ({ size = 35, color = colors.white, style }: IconProps) => {
  return <MaterialIcons name="logout" size={size} color={color} style={style} />;
};

export const SortIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <MaterialIcons name="sort-by-alpha" size={size} color={color} style={style} />;
};

export const AddIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <MaterialIcons name="add" size={size} color={color} style={style} />;
};

export const AppsIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <FontAwesomeIcon name="th-large" size={size} color={color} style={style} />;
};

export const HistoryIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <MaterialIcons name="history" size={size} color={color} style={style} />;
};
export const tickBoxIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <MaterialIcons name="check" size={size} color={color} style={style} />;
};

export const restoreIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <MaterialIcons name="restore" size={size} color={color} style={style} />;
};

export const EditIcon = ({ size = 24, color = '#c8c6ff', style }: IconProps = {}) => {
  return <MaterialIcons name="edit" size={size} color={color} style={style} />;
};

export const TrashIcon = ({ size = 24, color = '#ffc4c4', style }: IconProps = {}) => {
  return <MaterialIcons name="delete" size={size} color={color} style={style} />;
};

export const ChevronUpIcon = ({ size = 24, color = '#fff', style }: IconProps = {}) => {
  return <MaterialCommunityIcons name="chevron-up" size={size} color={color} style={style} />;
};

export const ChevronDownIcon = ({ size = 24, color = '#fff', style }: IconProps = {}) => {
  return <MaterialCommunityIcons name="chevron-down" size={size} color={color} style={style} />;
};

export const ChevronRightIcon = ({ size = 24, color = '#fff', style }: IconProps = {}) => {
  return <MaterialCommunityIcons name="chevron-right" size={size} color={color} style={style} />;
};

export const ULeftArrowIcon = ({ size = 22, color = colors.white, style }: IconProps = {}) => {
  return <MaterialCommunityIcons name="arrow-u-left-top" size={size} color={color} style={style} />;
};

export const DoubleDownIcon = ({ size = 20, color = colors.white, style }: IconProps = {}) => {
  return <FontAwesomeIcon name="angle-double-down" size={size} color={color} style={style} />;
};

export const DoubleRightIcon = ({ size = 20, color = colors.white, style }: IconProps = {}) => {
  return <FontAwesomeIcon name="angle-double-right" size={size} color={color} style={style} />;
};

export const UsersIcon = ({ size = 13, color = colors.veryLighterGrey, style }: IconProps = {}) => {
  return <FontAwesome5 name="users" size={size} color={color} style={style} />;
};

export const UndoIcon = ({ size = 18, color = 'white', style }: IconProps = {}) => {
  return <FontAwesome5 name="undo" size={size} color={color} style={style} />;
};

export const BarsIcon = ({ size = 20, color = colors.white, style }: IconProps) => {
  return <FontAwesome6 name="bars" size={size} color={color} style={style} />;
};

export const UserIcon = ({ size = 40, color, style }: IconProps = {}) => {
  return <IoniconsIcons name="person-circle-outline" size={size} color={color} style={style} />;
};

export const BackIcon = ({ size = 30, color = colors.white, style }: IconProps) => {
  return <IoniconsIcons name="arrow-back" size={size} color={color} style={style} />;
};

export const InfoIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return (
    <IoniconsIcons name="information-circle-outline" size={size} color={color} style={style} />
  );
};

export const ClipboardIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <IoniconsIcons name="clipboard-outline" size={size} color={color} style={style} />;
};

export const ClipboardMultipleIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return (
    <IoniconsIcons name="clipboard-multiple-outline" size={size} color={color} style={style} />
  );
};
