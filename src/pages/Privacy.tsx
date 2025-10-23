import { Helmet } from 'react-helmet';
import AppLayout from '@/components/layout/AppLayout';

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - The Trading Diary</title>
        <meta name="description" content="Learn how The Trading Diary collects, uses, and protects your personal information." />
      </Helmet>
      
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, including your name, email address, and trading data
                you choose to log in our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>
              <p>
                Your trading data is stored securely in encrypted databases. We implement industry-standard security
                measures to protect your information from unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share aggregated,
                anonymized data for analytics purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our service and hold certain
                information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Rectify inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
              <p>
                Our service is not intended for users under the age of 18. We do not knowingly collect personal
                information from children under 18.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@thetradingdiary.com
              </p>
            </section>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
