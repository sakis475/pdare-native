import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IoniconsIcons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';

import { colors } from '../../core/theme';
import { StyleProp, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const WaitingIcon = ({
  size = 13,
  color = colors.veryLighterGrey,
  style,
}: IconProps = {}) => {
  return <Entypo name="hour-glass" size={size} color={color} style={style} />;
};

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
export const TickBoxIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <MaterialIcons name="check" size={size} color={color} style={style} />;
};

export const RestoreIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <MaterialIcons name="restore" size={size} color={color} style={style} />;
};

export const EditIcon = ({ size = 24, color = '#c8c6ff', style }: IconProps = {}) => {
  return <MaterialIcons name="edit" size={size} color={color} style={style} />;
};

export const MoreIconHorizontal = ({ size = 24, color = '#c8c6ff', style }: IconProps = {}) => {
  return <MaterialIcons name="more-horiz" size={size} color={color} style={style} />;
};

export const TrashIcon = ({ size = 24, color = '#ffc4c4', style }: IconProps = {}) => {
  return <FontAwesome6 name="trash" size={size} color={color} style={style} />;
};

export const WarningIcon = ({ size = 24, color = '#ffc4c4', style }: IconProps = {}) => {
  return <Ionicons name="warning" size={size} color={color} style={style} />;
};

export const RefreshIcon = ({ size = 24, color = '#fff', style }: IconProps = {}) => {
  return <Ionicons name="refresh" size={size} color={color} style={style} />;
};

export const LanguageIcon = ({ size = 24, color = '#fff', style }: IconProps = {}) => {
  return <Ionicons name="globe-outline" size={size} color={color} style={style} />;
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

export const TableIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return (
    <MaterialCommunityIcons
      name="apps"
      size={size}
      color={color}
      style={style}
    ></MaterialCommunityIcons>
  );
};

export const ClockIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return (
    <MaterialCommunityIcons
      name="clock-time-eight-outline"
      size={size}
      color={color}
      style={style}
    ></MaterialCommunityIcons>
  );
};

export const DoubleDownIcon = ({ size = 20, color = colors.white, style }: IconProps = {}) => {
  return <FontAwesomeIcon name="angle-double-down" size={size} color={color} style={style} />;
};

export const DoubleRightIcon = ({ size = 20, color = colors.white, style }: IconProps = {}) => {
  return <FontAwesomeIcon name="angle-double-right" size={size} color={color} style={style} />;
};

export const DoubleLeftIcon = ({ size = 20, color = colors.white, style }: IconProps = {}) => {
  return <FontAwesomeIcon name="angle-double-left" size={size} color={color} style={style} />;
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

export const UserIcon = ({ size = 40, color = colors.white, style }: IconProps = {}) => {
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

export const SettingsIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <IoniconsIcons name="settings-sharp" size={size} color={color} style={style} />;
};

export const ClipboardMultipleIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return (
    <MaterialCommunityIcons
      name="clipboard-multiple-outline"
      size={size}
      color={color}
      style={style}
    />
  );
};

export const SearchIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <FontAwesome5 name="search" size={size} color={color} style={style} />;
};

export const PlusIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <MaterialCommunityIcons name="plus" size={size} color={color} style={style} />;
};

export const MinusIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <FontAwesome5 name="minus" size={size} color={color} style={style} />;
};

export const CouvertIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return (
    <MaterialCommunityIcons name="silverware-fork-knife" size={size} color={color} style={style} />
  );
};

export const SendIcon = ({ size = 24, color = colors.white, style }: IconProps) => {
  return <MaterialCommunityIcons name="send" size={size} color={color} style={style} />;
};

export const RadioButtonChecked = ({ size = 20, color = colors.white, style }: IconProps = {}) => {
  return <MaterialIcons name="radio-button-checked" size={size} color={color} style={style} />;
};

export const CheckBoxChecked = ({ size = 20, color = colors.white, style }: IconProps = {}) => {
  return <MaterialIcons name="check-box" size={size} color={color} style={style} />;
};

export const CloseIcon = ({ size = 24, color = colors.white, style }: IconProps = {}) => {
  return <MaterialIcons name="close" size={size} color={color} style={style} />;
};

export const EyeOff = ({ size = 24, color = colors.white, style }: IconProps = {}) => {
  return <MaterialCommunityIcons name="eye-off" size={size} color={color} style={style} />;
};

export const EyeOn = ({ size = 24, color = colors.white, style }: IconProps = {}) => {
  return <MaterialCommunityIcons name="eye" size={size} color={color} style={style} />;
};

export const HelpIcon = ({ size = 24, color = colors.white, style }: IconProps = {}) => {
  return (
    <MaterialCommunityIcons name="help-circle-outline" size={size} color={color} style={style} />
  );
};
