import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { Button } from '../ui/Button';

export function Header() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { isConnected } = useChatStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 glass-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sand to-blush flex items-center justify-center">
                            <svg className="w-5 h-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-100">EPHEXA</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="text-gray-300 hover:text-gray-100 transition-colors">
                                    Dashboard
                                </Link>
                                <Link to="/settings" className="text-gray-300 hover:text-gray-100 transition-colors">
                                    Settings
                                </Link>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-gray-400'}`} />
                                    <span className="text-sm text-gray-400">
                                        {isConnected ? 'Connected' : 'Disconnected'}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/terms" className="text-gray-300 hover:text-gray-100 transition-colors">
                                    Terms
                                </Link>
                                <Link to="/privacy" className="text-gray-300 hover:text-gray-100 transition-colors">
                                    Privacy
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Auth Buttons & Mobile Toggle */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => navigate('/settings')}
                                className="hidden md:flex"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Account</span>
                            </Button>
                        ) : (
                            <div className="hidden md:flex items-center gap-3">
                                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                                    Log In
                                </Button>
                                <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                                    Sign Up
                                </Button>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-300 hover:text-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-navy-dark border-t border-indigo/30">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/settings"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Settings
                                </Link>
                                <div className="px-3 py-2 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-gray-400'}`} />
                                    <span className="text-sm text-gray-400">
                                        {isConnected ? 'Connected' : 'Disconnected'}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    to="/terms"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Terms
                                </Link>
                                <Link
                                    to="/privacy"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Privacy
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
