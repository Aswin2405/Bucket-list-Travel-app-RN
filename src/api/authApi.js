import client from './client';

export const signup = (name, email, password) =>
  client.post('/auth/signup', { name, email, password }).then((res) => res.data);

export const login = (email, password) =>
  client.post('/auth/login', { email, password }).then((res) => res.data);

export const getMe = () => client.get('/auth/me').then((res) => res.data);

export const logout = () => client.post('/auth/logout').then((res) => res.data);

export const updateProfile = (payload) => client.patch('/auth/me', payload).then((res) => res.data);
