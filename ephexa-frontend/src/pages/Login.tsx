import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Layout } from '../components/layout';
import { Button, Input } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useUIStore } from '../stores/uiStore';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const navigate = useNavigate();

    const { login, googleLogin, isLoading } = useAuth();
    const { addToast } = useUIStore();

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Invalid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const success = await login({ email, password });
        if (success) {
            navigate('/dashboard');
        }
    };

    const handleGoogleSuccess = async (response: CredentialResponse) => {
        if (response.credential) {
            const success = await googleLogin(response.credential);
            if (success) {
                navigate('/dashboard');
            }
        } else {
            addToast({
                type: 'error',
                message: 'Google login failed. Please try again.',
            });
        }
    };

    const handleGoogleError = () => {
        addToast({
            type: 'error',
            message: 'Google login failed. Please try again.',
        });
    };

    return (
        <Layout>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-100 mb-2">Welcome Back</h1>
                        <p className="text-gray-400">Sign in to continue chatting</p>
                    </div>

                    {/* Form */}
                    <div className="bg-indigo/20 border border-indigo/30 rounded-2xl p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={errors.email}
                                autoComplete="email"
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={errors.password}
                                autoComplete="current-password"
                            />

                            <Button
                                type="submit"
                                fullWidth
                                isLoading={isLoading}
                            >
                                Sign In
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-indigo/30" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-indigo/20 text-gray-400">or continue with</span>
                            </div>
                        </div>

                        {/* Google Login */}
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="filled_black"
                                size="large"
                                width="300"
                                text="continue_with"
                                shape="rectangular"
                            />
                        </div>

                        {/* Sign Up Link */}
                        <p className="mt-6 text-center text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-sand hover:underline font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
