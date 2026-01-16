import { Layout } from '../components/layout';

export function Terms() {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-100 mb-2">Terms of Service</h1>
                <p className="text-gray-400 mb-8">Last updated: January 2026</p>

                <div className="prose prose-invert max-w-none space-y-8">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">1. Introduction</h2>
                        <p className="text-gray-300">
                            Welcome to EPHEXA. These Terms of Service ("Terms") govern your use of our
                            real-time communication platform. By accessing or using EPHEXA, you agree
                            to be bound by these Terms and our Privacy Policy.
                        </p>
                    </section>

                    {/* Age Requirement */}
                    <section className="bg-warning/10 border border-warning/20 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-warning mb-4">2. Age Requirement (18+)</h2>
                        <p className="text-gray-300 mb-4">
                            <strong className="text-warning">EPHEXA is exclusively for adults aged 18 years and older.</strong>
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>You must be at least 18 years old to create an account</li>
                            <li>You must provide accurate date of birth information</li>
                            <li>You must confirm your age during registration</li>
                            <li>Accounts found to belong to minors will be immediately terminated</li>
                        </ul>
                    </section>

                    {/* Account Responsibilities */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">3. Account Responsibilities</h2>
                        <p className="text-gray-300 mb-4">When using EPHEXA, you agree to:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Provide accurate and complete registration information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Notify us immediately of any unauthorized access</li>
                            <li>Accept responsibility for all activities under your account</li>
                        </ul>
                    </section>

                    {/* Prohibited Conduct */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">4. Prohibited Conduct</h2>
                        <p className="text-gray-300 mb-4">You agree NOT to:</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Share illegal, harmful, or threatening content</li>
                            <li>Harass, bully, or intimidate other users</li>
                            <li>Share explicit content involving minors in any form</li>
                            <li>Impersonate other individuals or entities</li>
                            <li>Spam or send unsolicited promotional content</li>
                            <li>Attempt to circumvent safety or moderation features</li>
                            <li>Use automated tools or bots to access the service</li>
                            <li>Share personal information of others without consent</li>
                        </ul>
                    </section>

                    {/* Content Moderation */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">5. Content Moderation</h2>
                        <p className="text-gray-300 mb-4">
                            EPHEXA employs various moderation measures to maintain a safe environment:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Automated profanity filtering on messages</li>
                            <li>Rate limiting to prevent spam</li>
                            <li>User reporting system</li>
                            <li>Account suspension for violations</li>
                        </ul>
                        <p className="text-gray-300 mt-4">
                            We reserve the right to remove content and suspend or terminate accounts
                            that violate these Terms at our sole discretion.
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">6. Data Retention</h2>
                        <p className="text-gray-300 mb-4">
                            EPHEXA minimizes data storage for your privacy:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>Messages are stored only during active sessions</li>
                            <li>Messages are automatically deleted after session expiry</li>
                            <li>We log only essential metadata (user ID, session ID, timestamps, IP hash)</li>
                            <li>We do not store or log the content of your messages long-term</li>
                        </ul>
                    </section>

                    {/* Limitation of Liability */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">7. Limitation of Liability</h2>
                        <p className="text-gray-300">
                            EPHEXA is provided "as is" without warranties of any kind. We are not
                            responsible for the conduct of users or the content they share. To the
                            maximum extent permitted by law, we disclaim all liability for any
                            damages arising from your use of the service.
                        </p>
                    </section>

                    {/* Changes to Terms */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">8. Changes to Terms</h2>
                        <p className="text-gray-300">
                            We may update these Terms from time to time. We will notify you of any
                            significant changes by posting the new Terms on this page and updating
                            the "Last updated" date. Continued use of EPHEXA after changes
                            constitutes acceptance of the new Terms.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">9. Contact Us</h2>
                        <p className="text-gray-300">
                            If you have questions about these Terms, please contact us at{' '}
                            <a href="mailto:legal@safechat.example.com" className="text-sand hover:underline">
                                legal@safechat.example.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
