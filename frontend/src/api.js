import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000', // Your backend must be running on this port
});
export default api;