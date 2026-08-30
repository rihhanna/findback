import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Eye, Database, Cookie, Mail, Lock } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-white" />
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">
                Privacy Policy
              </h1>
            </div>
            <p className="text-white/80 text-sm mt-1">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-500" />
                Information We Collect
              </h2>
              <p className="text-gray-600 leading-relaxed">
                When you use FindBack, we collect the following information:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 ml-4">
                <li><strong>Account Information:</strong> Name, email address, and phone number you provide during registration</li>
                <li><strong>Item Information:</strong> Details about lost or found items you post, including photos, descriptions, and locations</li>
                <li><strong>Communication:</strong> Messages you send through our chat system</li>
                <li><strong>Usage Data:</strong> How you interact with the platform (pages visited, searches, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary-500" />
                How We Use Your Information
              </h2>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 ml-4">
                <li>To connect people who have lost items with those who have found them</li>
                <li>To facilitate communication between users through our chat system</li>
                <li>To improve and personalize your experience on the platform</li>
                <li>To send notifications about activity related to your items</li>
                <li>To maintain the security and integrity of the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-500" />
                Data Security
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We take data security seriously. All data is encrypted in transit using SSL/TLS, and stored securely in our database with industry-standard security measures. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Cookie className="w-5 h-5 text-primary-500" />
                Cookies
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We use cookies to maintain your session, remember your preferences, and analyze how you use our platform. You can control cookie settings in your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Rights</h2>
              <p className="text-gray-600 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 ml-4">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  📧 <a href="mailto:hrihhana@gmail.com" className="text-primary-500 hover:underline">hrihhana@gmail.com</a>
                </p>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-4 text-sm text-gray-400">
              <p>FindBack is committed to protecting your privacy. We will never share your personal information with third parties without your explicit consent.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}