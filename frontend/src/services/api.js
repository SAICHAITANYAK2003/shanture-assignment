import axios from 'axios';

// Use env variable in production (Render backend URL)
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export default api;
