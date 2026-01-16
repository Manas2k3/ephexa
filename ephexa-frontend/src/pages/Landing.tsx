import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Button } from '../components/ui';

export function Landing() {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-navy via-indigo/20 to-navy" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sand/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blush/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-100 mb-6">
                            Connect Safely with{' '}
                            <span className="bg-gradient-to-r from-sand to-blush bg-clip-text text-transparent">
                                Like-Minded Adults
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join interest-based chat rooms and have meaningful conversations in a secure,
                            moderated environment designed for adults 18 and over.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup">
                                <Button size="lg">
                                    Get Started Free
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="secondary" size="lg">
                                    Log In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-navy-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-100 mb-12">
                        Why Choose EPHEXA?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-6 rounded-2xl bg-indigo/20 border border-indigo/30">
                            <div className="w-12 h-12 rounded-xl bg-sand/20 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-100 mb-2">Verified Adults Only</h3>
                            <p className="text-gray-400">
                                All users must verify they are 18+ before joining.
                                We keep our community safe for responsible adults.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-6 rounded-2xl bg-indigo/20 border border-indigo/30">
                            <div className="w-12 h-12 rounded-xl bg-blush/20 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blush" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-100 mb-2">Interest-Based Matching</h3>
                            <p className="text-gray-400">
                                Connect with people who share your interests.
                                No random strangers—only meaningful conversations.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-6 rounded-2xl bg-indigo/20 border border-indigo/30">
                            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-100 mb-2">Privacy First</h3>
                            <p className="text-gray-400">
                                Messages auto-delete after sessions end.
                                We don't store personal data beyond what's necessary.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Safety Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-100 mb-6">
                                Your Safety is Our Priority
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-100">Active Moderation</h4>
                                        <p className="text-gray-400 text-sm">Content is filtered for inappropriate language in real-time.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-100">Report & Block</h4>
                                        <p className="text-gray-400 text-sm">Easily report or block users who violate our guidelines.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-100">Rate Limiting</h4>
                                        <p className="text-gray-400 text-sm">Anti-spam measures prevent message flooding.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-100">No Anonymous Access</h4>
                                        <p className="text-gray-400 text-sm">All users must register with verified credentials.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-2xl bg-gradient-to-br from-indigo/30 to-navy border border-indigo/30 p-8 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-sand to-blush flex items-center justify-center">
                                        <svg className="w-12 h-12 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-100">100% Safe</p>
                                    <p className="text-gray-400">Moderated Environment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 18+ Disclaimer */}
            <section className="py-12 bg-warning/10 border-y border-warning/20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <svg className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-warning">Adults Only (18+)</h2>
                    </div>
                    <p className="text-gray-300">
                        EPHEXA is exclusively for adults aged 18 and over. By using this service,
                        you confirm that you are at least 18 years old and agree to our{' '}
                        <Link to="/terms" className="text-sand hover:underline">Terms of Service</Link> and{' '}
                        <Link to="/privacy" className="text-sand hover:underline">Privacy Policy</Link>.
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-100 mb-4">
                        Ready to Start Chatting?
                    </h2>
                    <p className="text-gray-300 mb-8">
                        Join thousands of adults having safe, meaningful conversations every day.
                    </p>
                    <Link to="/signup">
                        <Button size="lg">
                            Create Your Account
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Button>
                    </Link>
                </div>
            </section>
        </Layout>
    );
}
