export function isItemCompleted(item) {
  return item.status === 'completed' || (item.tasks?.length > 0 && item.tasks.every((t) => t.completed));
}
