
import axios from 'axios';

// API_URL is relative; the proxy handles forwarding to http://localhost:8080/api/auth/
const BASE_DOMAIN = "https://hospital-management-backend-v955.onrender.com";
const API_URL = BASE_DOMAIN+ "/api/auth/"; 

const login = async (username, password) => {
    // 1. Post credentials to the backend
    const response = await axios.post(API_URL + "login", { username, password });

    if (response.data.token) {
        // 2. Store JWT token and user details on successful login
        localStorage.setItem("user", JSON.stringify(response.data));
        // 3. Configure Axios to include the JWT token in all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem("user");
    delete axios.defaults.headers.common['Authorization'];
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const authService = { login, logout, getCurrentUser };
export default authService;
