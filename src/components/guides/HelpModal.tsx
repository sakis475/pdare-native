import { ReactNode } from 'react';
import BaseModal from '../basic/BaseModal';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
  helpContent: ReactNode;
  title: string;
}

export const HelpModal: React.FC<HelpModalProps> = ({ visible, onClose, helpContent, title }) => {
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      onConfirm={onClose}
      title={title}
      showButtons={true}
      theme="dark"
      buttonVariant="okOnly"
    >
      {helpContent}
    </BaseModal>
  );
};
