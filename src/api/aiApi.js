import client from './client';
import { cached, TTL } from '../utils/memoryCache';

// Suggestions/explore are meant to feel fresh (they vary per request), so they
// are intentionally NOT cached. Insights, trip plans and packing lists depend
// only on their inputs, so we cache them per key for instant revisits.

export const getSuggestions = (category) =>
  client.get('/ai/suggestions', { params: { category } }).then((res) => res.data);

export const getExploreDestinations = (category) =>
  client.get('/ai/explore', { params: { category } }).then((res) => res.data);

export const getInsights = (destination) =>
  cached(`insights:${destination}`, TTL.HOUR_1, () =>
    client.get('/ai/insights', { params: { destination } }).then((res) => res.data)
  );

export const getTripPlan = (destination, origin) =>
  cached(`tripplan:${destination}|${origin}`, TTL.HOUR_1, () =>
    client.get('/ai/trip-plan', { params: { destination, origin } }).then((res) => res.data)
  );

export const getPackingList = (destination, startDate, endDate) =>
  cached(`packing:${destination}|${startDate}|${endDate}`, TTL.HOUR_1, () =>
    client.get('/ai/packing-list', { params: { destination, startDate, endDate } }).then((res) => res.data)
  );

export const getRecommendations = () => client.get('/ai/recommendations').then((res) => res.data);

export const getSurprise = () => client.get('/ai/surprise').then((res) => res.data);
