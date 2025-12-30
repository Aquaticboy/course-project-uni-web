import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Перевірка токена при завантаженні сторінки
    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('token');
            
            if (token) {
                try {
                    // Робимо запит на /auth/me, щоб перевірити чи валідний токен
                    const response = await fetch('http://localhost:3001/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        // Якщо токен протух — видаляємо
                        localStorage.removeItem('token');
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkUserLoggedIn();
    }, []);

    // 2. Функція Входу
    const login = (userData, token) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    // 3. Функція Виходу
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/'; // Жорстке перезавантаження на головну
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Хук для використання в компонентах
export const useAuth = () => useContext(AuthContext);