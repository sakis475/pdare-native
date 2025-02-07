import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HelpContextType {
  showHelpModal: boolean;
  helpContent: ReactNode;
  helpTitle: string;
  openHelpModal: (content: ReactNode, title: string) => void;
  closeHelpModal: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const HelpProvider = ({ children }: { children: React.ReactNode }) => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpContent, setHelpContent] = useState<ReactNode>(null);
  const [helpTitle, setHelpTitle] = useState('');

  const openHelpModal = (content: ReactNode, title: string) => {
    setHelpContent(content);
    setHelpTitle(title);
    setShowHelpModal(true);
  };

  const closeHelpModal = () => {
    setShowHelpModal(false);
  };

  return (
    <HelpContext.Provider
      value={{
        showHelpModal,
        helpContent,
        helpTitle,
        openHelpModal,
        closeHelpModal,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
};

export const useHelpModal = () => {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelpModal must be used within a HelpProvider');
  }
  return context;
};
