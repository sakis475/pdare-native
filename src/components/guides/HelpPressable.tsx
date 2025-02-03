import React from 'react';
import { TouchableOpacity } from 'react-native';
import { HelpIcon } from '../basic/Icons';

interface HelpIconProps {
  onPress: () => void;
}

export const HelpPressable: React.FC<HelpIconProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginRight: 15 }}>
      <HelpIcon size={28} />
    </TouchableOpacity>
  );
};
