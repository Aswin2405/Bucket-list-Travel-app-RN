export function getErrorMessage(err) {
  if (err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '')) {
    return "The server took too long to wake up from sleep. Please check your connection and try again — it should respond quickly now that it's warming up.";
  }
  if (err?.message === 'Network Error') {
    return "Can't reach the server right now. Check your internet connection and try again.";
  }
  return err?.response?.data?.message || err?.message || 'Something went wrong.';
}
