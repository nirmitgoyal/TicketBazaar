import { Shield, CheckCircle, AlertTriangle, User, Instagram, FileText, CreditCard, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function SellerPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto mobile-container max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4"
          >
            Seller Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Guidelines and policies for selling tickets on Ticket Bazaar's peer-to-peer platform
          </motion.p>
        </div>

        {/* Account Requirements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <User className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Account Requirements</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Instagram Verification</h3>
                <p className="text-gray-600">Link your Instagram profile for identity verification and buyer confidence</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">DigiLocker Verification</h3>
                <p className="text-gray-600">Complete government ID verification through DigiLocker for enhanced trust</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Accurate Information</h3>
                <p className="text-gray-600">Provide truthful and complete information in your profile and listings</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Listing Requirements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Listing Requirements</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Authentic Tickets Only</h3>
                <p className="text-gray-600">Only list genuine tickets that you legally own and have the right to sell</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Complete Details</h3>
                <p className="text-gray-600">Include accurate event information, seat details, and any restrictions</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Fair Pricing</h3>
                <p className="text-gray-600">Set reasonable prices and be transparent about any additional fees</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Current Availability</h3>
                <p className="text-gray-600">Remove or update listings immediately when tickets are sold</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Communication Guidelines */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <Instagram className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Communication Guidelines</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Respond Promptly</h3>
                <p className="text-gray-600">Reply to buyer inquiries on Instagram within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Professional Conduct</h3>
                <p className="text-gray-600">Maintain respectful and professional communication at all times</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Clear Terms</h3>
                <p className="text-gray-600">Clearly communicate payment methods, meeting arrangements, and transfer process</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Transaction Guidelines */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <CreditCard className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Transaction Guidelines</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Secure Payment Methods</h3>
                <p className="text-gray-600">Accept secure, traceable payment methods like UPI, bank transfers, or digital wallets</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Safe Meeting Locations</h3>
                <p className="text-gray-600">Meet buyers in public, well-lit locations for ticket exchanges</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Ticket Verification</h3>
                <p className="text-gray-600">Allow buyers to verify ticket authenticity before completing the transaction</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Prohibited Activities */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-red-50 rounded-2xl border border-red-200 p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <h2 className="text-2xl font-bold text-red-900">Prohibited Activities</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Fraudulent Tickets</h3>
                <p className="text-red-700">Selling fake, duplicate, or invalid tickets is strictly prohibited</p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Price Manipulation</h3>
                <p className="text-red-700">Excessive price inflation or predatory pricing practices</p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Multiple Selling</h3>
                <p className="text-red-700">Selling the same ticket to multiple buyers</p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Harassment</h3>
                <p className="text-red-700">Inappropriate behavior, spam, or harassment of buyers</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Responsibilities */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <Clock className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Seller Responsibilities</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Event Changes</h3>
                <p className="text-gray-600">Notify buyers immediately of any event cancellations, postponements, or venue changes</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Refund Arrangements</h3>
                <p className="text-gray-600">Discuss and agree on refund policies for event cancellations before completing sales</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Documentation</h3>
                <p className="text-gray-600">Keep records of all transactions and communications for dispute resolution</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Platform Rights */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-blue-50 rounded-2xl border border-blue-200 p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-blue-900">Platform Rights</h2>
          </div>
          <div className="prose text-blue-800">
            <p className="mb-4">
              Ticket Bazaar reserves the right to remove listings, suspend accounts, or ban users who violate these policies. 
              We may also verify ticket authenticity and seller credentials at any time.
            </p>
            <p className="mb-4">
              Repeat violations may result in permanent account suspension and reporting to relevant authorities.
            </p>
            <p>
              By listing tickets on our platform, you agree to comply with all applicable laws and regulations regarding 
              ticket resale in your jurisdiction.
            </p>
          </div>
        </motion.section>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Questions About Our Seller Policy?
          </h2>
          <p className="text-gray-600 mb-6">
            Contact our support team for clarification on any policy matters
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.linkedin.com/company/ticket-bazaar-co-in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Contact Support
            </a>
            <a
              href="mailto:support@ticketbazaar.in"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary font-medium rounded-lg border border-primary hover:bg-primary hover:text-white transition-colors duration-200"
            >
              Email Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}