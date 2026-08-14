// Render's free tier spins the backend down after inactivity, so the first
// request after a while can take 30-60s to wake it back up. This is a tiny
// pub-sub so the axios client (outside the React tree) can tell the UI to
// show a "waking up" notice without every request having to know about it.
let listeners = [];
let pendingSlowRequests = 0;

function emit() {
  const isWaking = pendingSlowRequests > 0;
  listeners.forEach((listener) => listener(isWaking));
}

export function subscribeColdStart(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function markSlowRequestStarted() {
  pendingSlowRequests += 1;
  emit();
}

export function markSlowRequestEnded() {
  pendingSlowRequests = Math.max(0, pendingSlowRequests - 1);
  emit();
}
