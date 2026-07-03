import client from './client';
import { cached, TTL } from '../utils/memoryCache';

export const getWeather = (destination, startDate, endDate) =>
  cached(`weather:${destination}|${startDate}|${endDate}`, TTL.MIN_30, () =>
    client.get('/weather', { params: { destination, startDate, endDate } }).then((res) => res.data)
  );
