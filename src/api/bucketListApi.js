import client from './client';

export const getItems = () => client.get('/items').then((res) => res.data);
export const getItem = (id) => client.get(`/items/${id}`).then((res) => res.data);
export const createItem = (payload) => client.post('/items', payload).then((res) => res.data);
export const updateItem = (id, payload) => client.put(`/items/${id}`, payload).then((res) => res.data);
export const deleteItem = (id) => client.delete(`/items/${id}`).then((res) => res.data);
export const addTask = (id, title) => client.post(`/items/${id}/tasks`, { title }).then((res) => res.data);
export const toggleTask = (id, taskId) => client.patch(`/items/${id}/tasks/${taskId}`).then((res) => res.data);
export const completeItem = (id) => client.patch(`/items/${id}/complete`).then((res) => res.data);
export const shareItem = (id, email) => client.post(`/items/${id}/share`, { email }).then((res) => res.data);
export const unshareItem = (id, userId) => client.delete(`/items/${id}/share/${userId}`).then((res) => res.data);
export const addPackingItems = (id, items, source) =>
  client.post(`/items/${id}/packing`, { items, source }).then((res) => res.data);
export const togglePackingItem = (id, packId) =>
  client.patch(`/items/${id}/packing/${packId}`).then((res) => res.data);
export const deletePackingItem = (id, packId) =>
  client.delete(`/items/${id}/packing/${packId}`).then((res) => res.data);
export const addExpense = (id, description, amount) =>
  client.post(`/items/${id}/expenses`, { description, amount }).then((res) => res.data);
export const deleteExpense = (id, expenseId) =>
  client.delete(`/items/${id}/expenses/${expenseId}`).then((res) => res.data);
