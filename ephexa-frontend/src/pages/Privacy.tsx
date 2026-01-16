import { Layout } from '../components/layout';

export function Privacy() {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-100 mb-2">Privacy Policy</h1>
                <p className="text-gray-400 mb-8">Last updated: January 2026</p>

                <div className="prose prose-invert max-w-none space-y-8">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">1. Introduction</h2>
                        <p className="text-gray-300">
                            At EPHEXA, we take your privacy seriously. This Privacy Policy explains
                            what information we collect, how we use it, and your rights regarding
                            your personal data. By using EPHEXA, you agree to the collection and
                            use of information in accordance with this policy.
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">2. Information We Collect</h2>

                        <h3 className="text-lg font-medium text-sand mt-4 mb-2">Account Information</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Email address</li>
                            <li>Password (stored securely using industry-standard hashing)</li>
                            <li>Date of birth (for age verification)</li>
                            <li>Google account ID (if using Google OAuth)</li>
                        </ul>

                        <h3 className="text-lg font-medium text-sand mt-4 mb-2">Session Data</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>User ID</li>
                            <li>Session ID</li>
                            <li>Timestamps of activity</li>
                            <li>IP address hash (NOT the raw IP address)</li>
                        </ul>

                        <h3 className="text-lg font-medium text-sand mt-4 mb-2">What We DON'T Collect</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Real name or identity documents</li>
                            <li>Phone number</li>
                            <li>Physical address</li>
                            <li>Payment information (no payments in Phase 1)</li>
                            <li>Biometric data</li>
                            <li>Device-specific identifiers</li>
                        </ul>
                    </section>

                    {/* Message Privacy */}
                    <section className="bg-success/10 border border-success/20 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-success mb-4">3. Message Privacy</h2>
                        <p className="text-gray-300 mb-4">
                            <strong className="text-success">Your messages are temporary by design.</strong>
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Messages are stored only for the duration of active sessions</li>
                            <li>Messages are automatically deleted after session expiry (within 24 hours)</li>
                            <li>We do NOT read, analyze, or store message content long-term</li>
                            <li>Profanity filtering is done in real-time and does not create logs</li>
                        </ul>
                    </section>

                    {/* How We Use Your Information */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">4. How We Use Your Information</h2>
                        <p className="text-gray-300 mb-4">We use collected information to:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Authenticate you and maintain your session</li>
                            <li>Verify that you are 18+ years old</li>
                            <li>Provide real-time chat functionality</li>
                            <li>Detect and prevent abuse (spam, harassment)</li>
                            <li>Improve our service and fix bugs</li>
                            <li>Respond to legal requests when required</li>
                        </ul>
                    </section>

                    {/* Data Security */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">5. Data Security</h2>
                        <p className="text-gray-300 mb-4">We implement security measures including:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>HTTPS encryption for all communications</li>
                            <li>Secure password hashing (bcrypt)</li>
                            <li>IP address hashing (SHA-256)</li>
                            <li>Regular security audits</li>
                            <li>Limited data retention periods</li>
                        </ul>
                    </section>

                    {/* Data Retention */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">6. Data Retention</h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li><strong>Messages:</strong> Deleted within 24 hours of session end</li>
                            <li><strong>Session logs:</strong> Retained for 30 days for security</li>
                            <li><strong>Account data:</strong> Retained until you delete your account</li>
                            <li><strong>Reports:</strong> Retained for moderation review</li>
                        </ul>
                    </section>

                    {/* Your Rights */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">7. Your Rights</h2>
                        <p className="text-gray-300 mb-4">You have the right to:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Update inaccurate information</li>
                            <li><strong>Deletion:</strong> Delete your account and all associated data</li>
                            <li><strong>Portability:</strong> Export your data in a standard format</li>
                            <li><strong>Objection:</strong> Object to certain processing activities</li>
                        </ul>
                        <p className="text-gray-300 mt-4">
                            To exercise these rights, use the Settings page or contact us directly.
                        </p>
                    </section>

                    {/* Third Parties */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">8. Third Parties</h2>
                        <p className="text-gray-300 mb-4">We may share limited data with:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li><strong>Google:</strong> If you use Google OAuth for login</li>
                            <li><strong>Law enforcement:</strong> When legally required</li>
                        </ul>
                        <p className="text-gray-300 mt-4">
                            We do NOT sell your personal data to advertisers or data brokers.
                        </p>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">9. Cookies & Local Storage</h2>
                        <p className="text-gray-300">
                            We use browser local storage to maintain your authentication session.
                            We do not use tracking cookies or share data with advertising networks.
                        </p>
                    </section>

                    {/* Changes */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">10. Changes to This Policy</h2>
                        <p className="text-gray-300">
                            We may update this Privacy Policy from time to time. We will notify you
                            of any significant changes by posting the new policy on this page.
                            Continued use of EPHEXA after changes constitutes acceptance.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">11. Contact Us</h2>
                        <p className="text-gray-300">
                            For privacy-related questions or requests, contact us at{' '}
                            <a href="mailto:privacy@safechat.example.com" className="text-sand hover:underline">
                                privacy@safechat.example.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
