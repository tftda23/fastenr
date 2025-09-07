import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Fastenr',
  description: 'Terms of Service for Fastenr Customer Success Platform',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Fastenr ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2>2. Beta Service Notice</h2>
            <p>
              Fastenr is currently in beta testing phase. The Service is provided "as is" and may contain bugs, errors, or other issues. 
              We are continuously working to improve the platform and appreciate your feedback during this beta period.
            </p>

            <h2>3. Use License</h2>
            <p>
              Permission is granted to temporarily access and use Fastenr for personal or business purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained in the Service</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2>4. Data and Privacy</h2>
            <p>
              Your privacy is important to us. We collect and use information in accordance with our Privacy Policy. 
              By using the Service, you consent to the collection and use of information as outlined in our Privacy Policy.
            </p>

            <h2>5. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
              You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>

            <h2>6. Prohibited Uses</h2>
            <p>You may not use our Service:</p>
            <ul>
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>

            <h2>7. Service Availability</h2>
            <p>
              We strive to maintain high availability of our Service, but we do not guarantee uninterrupted access. 
              The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
            </p>

            <h2>8. Beta Limitations</h2>
            <p>
              During the beta period:
            </p>
            <ul>
              <li>Features may be added, modified, or removed without notice</li>
              <li>Data backup and recovery procedures are in development</li>
              <li>Service level agreements do not apply</li>
            </ul>

            <h2>9. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of Fastenr and its licensors. 
              The Service is protected by copyright, trademark, and other laws.
            </p>

            <h2>10. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, 
              under our sole discretion, for any reason whatsoever and without limitation.
            </p>

            <h2>11. Disclaimer</h2>
            <p>
              The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, 
              this Company excludes all representations, warranties, conditions and terms.
            </p>

            <h2>12. Limitation of Liability</h2>
            <p>
              In no event shall Fastenr, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>

            <h2>13. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>

            <h2>14. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <ul>
              <li>Email: support@fastenr.co</li>
              <li>Website: https://fastenr.co</li>
            </ul>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Beta Notice:</strong> These terms are subject to change during our beta period. 
                We will notify users of any significant changes via email or through the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}