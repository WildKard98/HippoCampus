import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // or the deployed backend URL
});

export default api;
