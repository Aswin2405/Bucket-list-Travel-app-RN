import { useEffect, useRef } from 'react';
import { subscribeColdStart } from '../utils/coldStartNotice';
import { useAlertControls } from '../context/AlertContext';

const MESSAGE = "This may take up to a minute. Thanks for your patience!";

export default function ColdStartNotice() {
  const { showAlert, dismiss } = useAlertControls();
  const isShowingRef = useRef(false);

  useEffect(() => {
    return subscribeColdStart((isWaking) => {
      if (isWaking && !isShowingRef.current) {
        isShowingRef.current = true;
        showAlert('Waking up the server…', MESSAGE, null, { loading: true });
      } else if (!isWaking && isShowingRef.current) {
        isShowingRef.current = false;
        dismiss();
      }
    });
  }, [showAlert, dismiss]);

  return null;
}
