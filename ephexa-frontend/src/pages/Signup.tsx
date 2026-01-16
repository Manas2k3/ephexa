import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Button, Input } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export function Signup() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        isAdultConfirmed: false,
        agreedToTerms: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { signup, isLoading } = useAuth();

    const calculateAge = (dob: string) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        } else if (calculateAge(formData.dateOfBirth) < 18) {
            newErrors.dateOfBirth = 'You must be at least 18 years old';
        }

        if (!formData.isAdultConfirmed) {
            newErrors.isAdultConfirmed = 'You must confirm you are 18+';
        }

        if (!formData.agreedToTerms) {
            newErrors.agreedToTerms = 'You must agree to the terms';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        await signup(formData);
    };

    const handleChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Layout>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-100 mb-2">Create Account</h1>
                        <p className="text-gray-400">Join EPHEXA today</p>
                    </div>

                    {/* Form */}
                    <div className="bg-indigo/20 border border-indigo/30 rounded-2xl p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                error={errors.email}
                                autoComplete="email"
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                error={errors.password}
                                helperText="At least 8 characters"
                                autoComplete="new-password"
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                error={errors.confirmPassword}
                                autoComplete="new-password"
                            />

                            <Input
                                label="Date of Birth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                error={errors.dateOfBirth}
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                            />

                            {/* Age Confirmation Checkbox */}
                            <div>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAdultConfirmed}
                                        onChange={(e) => handleChange('isAdultConfirmed', e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-indigo/50 bg-navy-light text-sand focus:ring-sand focus:ring-offset-navy"
                                    />
                                    <span className="text-sm text-gray-300">
                                        I confirm that I am <strong className="text-sand">18 years or older</strong> and understand this platform is for adults only.
                                    </span>
                                </label>
                                {errors.isAdultConfirmed && (
                                    <p className="mt-1 text-sm text-error">{errors.isAdultConfirmed}</p>
                                )}
                            </div>

                            {/* Terms Checkbox */}
                            <div>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.agreedToTerms}
                                        onChange={(e) => handleChange('agreedToTerms', e.target.checked)}
                                        className="mt-1 w-4 h-4 rounded border-indigo/50 bg-navy-light text-sand focus:ring-sand focus:ring-offset-navy"
                                    />
                                    <span className="text-sm text-gray-300">
                                        I agree to the{' '}
                                        <Link to="/terms" className="text-sand hover:underline">Terms of Service</Link>
                                        {' '}and{' '}
                                        <Link to="/privacy" className="text-sand hover:underline">Privacy Policy</Link>.
                                    </span>
                                </label>
                                {errors.agreedToTerms && (
                                    <p className="mt-1 text-sm text-error">{errors.agreedToTerms}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                isLoading={isLoading}
                            >
                                Create Account
                            </Button>
                        </form>

                        {/* Login Link */}
                        <p className="mt-6 text-center text-gray-400 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-sand hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
