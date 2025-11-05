import axios from 'axios';

const BASE_DOMAIN = "https://hospital-management-backend-v955.onrender.com";

const apiClient = axios.create({
  baseURL: BASE_DOMAIN + "/api",
});

// Intercept all outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const token = JSON.parse(storedUser).token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
