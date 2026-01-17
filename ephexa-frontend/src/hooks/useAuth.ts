import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import type { LoginCredentials, SignupData, User } from '../types';

export function useAuth() {
    const navigate = useNavigate();
    const {
        user,
        token,
        isAuthenticated,
        isLoading,
        setUser,
        login: setLogin,
        logout: setLogout,
        setLoading,
    } = useAuthStore();

    const { addToast } = useUIStore();

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                api.setToken(token);
                // We should ideally fetch current user to validate token and get fresh data
                // but doing it on every mount might be expensive if this hook is used multiple times.
                // It's meant to be used once in layout or top level, or check if user is already loaded?
                // For now, keep existing logic but maybe consider avoiding double fetch if user exists?
                // The implementation fetches if token exists.
                const response = await api.getCurrentUser();
                if (!response.success) {
                    setLogout();
                    api.setToken(null);
                } else if (response.data) {
                    // Update user store with fresh data
                    setUser(response.data);
                }
            }
            setLoading(false);
        };

        // Only run if we have a token but maybe not validated?
        // Simulating "on mount" or token change
        initAuth();
    }, [token, setLoading, setLogout, setUser]);

    const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
        setLoading(true);
        const response = await api.login(credentials);

        if (response.success && response.data) {
            api.setToken(response.data.token);
            socketService.connect(response.data.token);
            setLogin(response.data.user, response.data.token);
            addToast({ type: 'success', message: 'Welcome back!' });
            return true;
        } else {
            addToast({ type: 'error', message: response.error || 'Login failed' });
            setLoading(false);
            return false;
        }
    }, [setLogin, setLoading, addToast]);

    const signup = useCallback(async (data: SignupData): Promise<boolean> => {
        setLoading(true);
        const response = await api.signup(data);

        if (response.success && response.data) {
            api.setToken(response.data.token);
            socketService.connect(response.data.token);
            setLogin(response.data.user, response.data.token);
            addToast({ type: 'success', message: 'Account created successfully!' });
            return true;
        } else {
            addToast({ type: 'error', message: response.error || 'Signup failed' });
            setLoading(false);
            return false;
        }
    }, [setLogin, setLoading, addToast]);

    const googleLogin = useCallback(async (credential: string): Promise<boolean> => {
        setLoading(true);
        const response = await api.googleAuth(credential);

        if (response.success && response.data) {
            api.setToken(response.data.token);
            socketService.connect(response.data.token);
            setLogin(response.data.user, response.data.token);
            addToast({ type: 'success', message: 'Welcome!' });
            return true;
        } else {
            addToast({ type: 'error', message: response.error || 'Google login failed' });
            setLoading(false);
            return false;
        }
    }, [setLogin, setLoading, addToast]);

    const logout = useCallback(async () => {
        await api.logout();
        socketService.disconnect();
        api.setToken(null);
        setLogout();
        addToast({ type: 'info', message: 'You have been logged out' });
        navigate('/');
    }, [setLogout, addToast, navigate]);

    const deleteAccount = useCallback(async (): Promise<boolean> => {
        const response = await api.deleteAccount();

        if (response.success) {
            socketService.disconnect();
            api.setToken(null);
            setLogout();
            addToast({ type: 'info', message: 'Account deleted successfully' });
            navigate('/');
            return true;
        } else {
            addToast({ type: 'error', message: response.error || 'Failed to delete account' });
            return false;
        }
    }, [setLogout, addToast, navigate]);

    const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
        setLoading(true);
        const response = await api.updateProfile(data);

        if (response.success && response.data) {
            // Merge existing user data with updates
            const updatedUser = { ...user, ...response.data } as User;
            setUser(updatedUser);
            addToast({ type: 'success', message: 'Profile updated successfully' });
            setLoading(false);
            return true;
        } else {
            addToast({ type: 'error', message: response.error || 'Failed to update profile' });
            setLoading(false);
            return false;
        }
    }, [user, setUser, setLoading, addToast]);

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        signup,
        googleLogin,
        logout,
        deleteAccount,
        updateProfile,
    };
}
