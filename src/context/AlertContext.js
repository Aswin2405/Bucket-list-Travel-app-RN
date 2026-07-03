import React, { createContext, useCallback, useContext, useState } from 'react';
import CustomAlert from '../components/CustomAlert';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [state, setState] = useState({ visible: false, title: '', message: '', buttons: [{ text: 'OK' }] });

  const showAlert = useCallback((title, message, buttons) => {
    setState({
      visible: true,
      title,
      message,
      buttons: buttons && buttons.length ? buttons : [{ text: 'OK' }],
    });
  }, []);

  const dismiss = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      <CustomAlert
        visible={state.visible}
        title={state.title}
        message={state.message}
        buttons={state.buttons}
        onDismiss={dismiss}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within an AlertProvider');
  return ctx;
}
