import { Helmet } from 'react-helmet';
import AppLayout from '@/components/layout/AppLayout';

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - The Trading Diary</title>
        <meta name="description" content="Read our terms of service and understand the rules for using The Trading Diary platform." />
      </Helmet>
      
      <AppLayout>
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using The Trading Diary platform, you accept and agree to be bound by the terms
                and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p>
                Permission is granted to temporarily access the materials on The Trading Diary for personal,
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
              <p>
                The materials on The Trading Diary are provided on an 'as is' basis. The Trading Diary makes no
                warranties, expressed or implied, and hereby disclaims and negates all other warranties including,
                without limitation, implied warranties or conditions of merchantability, fitness for a particular
                purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
              <p>
                In no event shall The Trading Diary or its suppliers be liable for any damages (including, without
                limitation, damages for loss of data or profit, or due to business interruption) arising out of the
                use or inability to use the materials on The Trading Diary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Trading Disclaimer</h2>
              <p>
                Trading financial instruments involves substantial risk of loss. The Trading Diary is a journaling
                and analytics tool only and does not provide financial advice. Past performance is not indicative
                of future results.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. User Content</h2>
              <p>
                You retain all rights to the trading data and content you upload to The Trading Diary. By uploading
                content, you grant us a license to store, process, and display this content as necessary to provide
                our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Account Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account at any time for violations of these terms
                or for any other reason at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Modifications</h2>
              <p>
                The Trading Diary may revise these terms of service at any time without notice. By using this platform
                you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at support@thetradingdiary.com
              </p>
            </section>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
