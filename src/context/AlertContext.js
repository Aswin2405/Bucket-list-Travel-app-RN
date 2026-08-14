import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import CustomAlert from '../components/CustomAlert';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [state, setState] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
    loading: false,
  });

  const showAlert = useCallback((title, message, buttons, options) => {
    const loading = !!options?.loading;
    setState({
      visible: true,
      title,
      message,
      // A loading alert has nothing to confirm yet, so it shows a spinner
      // instead of buttons and dismisses itself once the request settles.
      buttons: loading ? [] : buttons && buttons.length ? buttons : [{ text: 'OK' }],
      loading,
    });
  }, []);

  const dismiss = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const value = useMemo(() => ({ showAlert, dismiss }), [showAlert, dismiss]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <CustomAlert
        visible={state.visible}
        title={state.title}
        message={state.message}
        buttons={state.buttons}
        loading={state.loading}
        onDismiss={dismiss}
      />
    </AlertContext.Provider>
  );
}

// Most callers just want to pop a simple alert, so this keeps returning the
// showAlert function directly rather than the full context object.
export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within an AlertProvider');
  return ctx.showAlert;
}

// For callers that also need to dismiss the alert programmatically (e.g. a
// loading notice that closes itself once the underlying request finishes).
export function useAlertControls() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlertControls must be used within an AlertProvider');
  return ctx;
}
