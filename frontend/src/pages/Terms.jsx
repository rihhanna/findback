import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Shield, Users, Clock } from 'lucide-react'

export default function Terms() {
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
              <FileText className="w-8 h-8 text-white" />
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">
                Terms of Service
              </h1>
            </div>
            <p className="text-white/80 text-sm mt-1">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Acceptance of Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                By using FindBack, you agree to these Terms of Service. If you do not agree to these terms, please do not use the platform. We reserve the right to update these terms at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                User Responsibilities
              </h2>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 ml-4">
                <li><strong>Accuracy:</strong> You are responsible for providing accurate information about lost or found items</li>
                <li><strong>Respect:</strong> Treat other users with respect and communicate honestly</li>
                <li><strong>No Spam:</strong> Do not use the platform for spam, scams, or fraudulent activities</li>
                <li><strong>No Misuse:</strong> Do not misuse the reporting system or mark items as returned falsely</li>
                <li><strong>Compliance:</strong> You must comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                User Content & Conduct
              </h2>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 ml-4">
                <li>You retain ownership of content you post (photos, descriptions, etc.)</li>
                <li>You grant FindBack a license to display and promote your content on the platform</li>
                <li>Prohibited content: offensive language, harassment, explicit images, or illegal activities</li>
                <li>We reserve the right to remove any content that violates these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-500" />
                Disclaimer of Liability
              </h2>
              <p className="text-gray-600 leading-relaxed">
                FindBack acts as a platform to connect users. We are not responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 ml-4">
                <li>The accuracy of information posted by users</li>
                <li>Transactions or agreements between users</li>
                <li>Loss or damage to items posted on the platform</li>
                <li>Conduct or behavior of users on the platform</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-3">
                Use FindBack at your own risk. All interactions are between users, and we encourage you to exercise caution and use common sense.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                Account Termination
              </h2>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 ml-4">
                <li>You may delete your account at any time</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                <li>We may remove inactive accounts after a period of inactivity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These terms are governed by the laws of Somalia. Any disputes shall be resolved in the courts of Mogadishu, Somalia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  📧 <a href="mailto:hrihhana@gmail.com" className="text-primary-500 hover:underline">hrihhana@gmail.com</a>
                </p>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-4 text-sm text-gray-400">
              <p>By using FindBack, you acknowledge that you have read, understood, and agree to these Terms of Service.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}