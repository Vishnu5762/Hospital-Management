
import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Runs on initial load to check for stored token
    useEffect(() => {
        const storedUser = authService.getCurrentUser();
        if (storedUser && storedUser.token) {
            try {
                const decodedToken = jwtDecode(storedUser.token);
                // Simple token expiration check
                if (decodedToken.exp * 1000 > Date.now()) {
                    setUser(storedUser);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
                } else {
                    authService.logout();
                }
            } catch (error) {
                authService.logout();
            }
        }
    }, []);

    const login = async (username, password) => {
        const userData = await authService.login(username, password);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user, role: user?.role }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);