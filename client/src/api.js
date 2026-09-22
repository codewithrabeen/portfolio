import axios from "axios";

const apiBaseURL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

export default api;
