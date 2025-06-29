import React from "react";
import { Scroll } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SEOManager } from "@/components/helmet-manager";
import { UnifiedSchema } from "@/components/schema/unified-schema";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SEOManager
        title="Terms of Service | Ticket Bazaar"
        description="Read the Ticket Bazaar terms of service agreement. Learn about user rights and responsibilities, ticket resale policies, dispute resolution, and more."
        canonicalUrl="https://ticketbazaar.co.in/terms-of-service"
      >
        <UnifiedSchema />
      </SEOManager>
      <Card className="w-full shadow-lg">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Scroll className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Terms of Service</CardTitle>
          </div>
          <CardDescription>Last Updated: June 29, 2025</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-10 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground">
              By accessing or using Ticket Bazaar services, you agree to be
              bound by these Terms of Service. If you do not agree to these
              terms, you must not access or use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Service Description - Discovery Platform Only
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                IMPORTANT: TicketBazaar is strictly a discovery and information platform. We are NOT involved in ticket sales, payment processing, or ticket delivery.
              </p>
            </div>
            <p className="text-muted-foreground mb-3">
              TicketBazaar operates exclusively as a discovery and contact platform that enables users to find information about tickets that may be available from other users. We function solely as an intermediary information service under applicable safe harbor provisions.
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-3 space-y-2">
              <li>We DO NOT sell, resell, or broker tickets</li>
              <li>We DO NOT process or handle any payments</li>
              <li>We DO NOT hold, store, or deliver tickets</li>
              <li>We DO NOT facilitate or execute transactions</li>
              <li>We DO NOT verify ticket authenticity or validity</li>
              <li>We DO NOT guarantee event occurrence or ticket legitimacy</li>
            </ul>
            <p className="text-muted-foreground">
              Our platform merely provides a space for users to post information about tickets they wish to sell and for other users to discover such listings. All negotiations, payments, and ticket transfers occur entirely outside our platform through direct user-to-user arrangements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <p className="text-muted-foreground">
              To access certain features of our service, you must register for
              an account. You agree to provide accurate information and maintain
              the security of your account credentials. You are responsible for
              all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              4. Listing and Selling Tickets
            </h2>
            <p className="text-muted-foreground mb-3">
              Sellers must accurately represent the tickets they list and must
              have the legal right to sell them. Resale prices must comply with
              applicable local laws and regulations governing ticket resale in
              the seller's and buyer's respective jurisdictions.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <p className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                <strong>Legal Compliance Responsibility:</strong> All buyers and sellers are responsible for ensuring that ticket resale complies with their local laws and taxes. TicketBazaar is not responsible for user compliance with applicable regulations.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Buying Tickets</h2>
            <p className="text-muted-foreground mb-3">
              Buyers are responsible for verifying event details before
              purchasing tickets. All sales are final unless the event is
              canceled or rescheduled. Refunds are subject to our Refund Policy
              and applicable laws.
            </p>
            <p className="text-muted-foreground">
              <strong>Buyer Compliance:</strong> Buyers must ensure that their ticket purchases comply with all applicable local laws, tax obligations, and resale regulations in their jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Payments - No Platform Involvement</h2>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <p className="text-gray-900 dark:text-gray-100 text-sm">
                <strong>No Payment Processing:</strong> TicketBazaar has NO involvement in any financial transactions between users. We do not process payments, hold funds, or provide payment protection.
              </p>
            </div>
            <p className="text-muted-foreground mb-3">
              All payment arrangements occur entirely outside our platform:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-3 space-y-2">
              <li>We DO NOT process credit cards, digital payments, or any form of payment</li>
              <li>We DO NOT provide escrow, payment protection, or buyer guarantees</li>
              <li>We DO NOT handle refunds, chargebacks, or payment disputes</li>
              <li>We DO NOT verify payment completion or transfer confirmation</li>
              <li>We have NO knowledge of or involvement in user payment methods</li>
            </ul>
            <p className="text-muted-foreground">
              Users are solely responsible for their payment arrangements and assume all risks associated with peer-to-peer financial transactions. Platform service fees, if any, are separate from and unrelated to user-to-user ticket transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Prohibited Activities
            </h2>
            <p className="text-muted-foreground">
              Users may not engage in fraudulent activities, manipulate prices,
              use automated systems to purchase tickets, or resell tickets at
              prices exceeding the original purchase price. Violations may
              result in account termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              8. Platform Role and Legal Status
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">TicketBazaar's Legal Status as Intermediary</h3>
              <p className="text-gray-700 dark:text-gray-200 text-sm">
                TicketBazaar operates as an "intermediary" under applicable information technology and e-commerce laws. We merely provide a platform for information exchange and are not liable for third-party content or actions.
              </p>
            </div>
            <p className="text-muted-foreground mb-3">
              <strong>What We Are:</strong> A passive intermediary platform that provides technological infrastructure for users to post and discover ticket-related information.
            </p>
            <p className="text-muted-foreground mb-3">
              <strong>What We Are NOT:</strong>
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-3 space-y-2">
              <li>A party to any transaction between users</li>
              <li>A ticket seller, reseller, broker, or agent</li>
              <li>A payment processor or escrow service</li>
              <li>A guarantor of ticket authenticity or delivery</li>
              <li>Responsible for event cancellations or changes</li>
              <li>Liable for user disputes or fraudulent activities</li>
            </ul>
            <p className="text-muted-foreground">
              Users acknowledge that TicketBazaar exercises no control over the quality, safety, legality, availability, or delivery of tickets listed on the platform. We do not endorse any user, listing, or transaction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              9. Dispute Resolution
            </h2>
            <p className="text-muted-foreground">
              Since we do not facilitate transactions, disputes between buyers and sellers must be resolved directly between the parties involved. We may provide guidance and support, but cannot mediate financial disputes or enforce transaction agreements. Users may pursue remedies available under applicable local laws for transaction-related disputes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              10. Comprehensive Limitation of Liability
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">DISCLAIMER OF LIABILITY</h3>
              <p className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, TICKETBAZAAR DISCLAIMS ALL LIABILITY FOR ANY USER-TO-USER TRANSACTIONS, TICKET VALIDITY, OR EVENT-RELATED ISSUES.
              </p>
            </div>
            <p className="text-muted-foreground mb-3">
              <strong>TicketBazaar is NOT liable for:</strong>
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-3 space-y-2">
              <li><strong>Ticket Delivery Issues:</strong> Failed, delayed, or non-delivery of tickets</li>
              <li><strong>Payment Disputes:</strong> Any payment-related conflicts between users</li>
              <li><strong>Ticket Validity:</strong> Counterfeit, invalid, or duplicate tickets</li>
              <li><strong>Event Changes:</strong> Cancellations, postponements, or venue changes</li>
              <li><strong>User Fraud:</strong> Scams, misrepresentations, or fraudulent listings</li>
              <li><strong>Transaction Failures:</strong> Incomplete or disputed transactions</li>
              <li><strong>Financial Losses:</strong> Any monetary losses from user transactions</li>
              <li><strong>Legal Violations:</strong> Users violating local ticket resale laws</li>
            </ul>
            <p className="text-muted-foreground mb-3">
              Users expressly acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>All transactions are at their own risk</li>
              <li>TicketBazaar provides no warranties regarding listings</li>
              <li>Users must conduct their own due diligence</li>
              <li>TicketBazaar's role is limited to providing information access</li>
              <li>Users waive all claims against TicketBazaar for transaction-related issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              11. User Acknowledgments and Responsibilities
            </h2>
            <p className="text-muted-foreground mb-3">
              By using TicketBazaar, users explicitly acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-3 space-y-2">
              <li>TicketBazaar is merely a discovery platform and not involved in transactions</li>
              <li>All ticket purchases are made directly from other users, not from TicketBazaar</li>
              <li>Users are solely responsible for verifying ticket authenticity before purchase</li>
              <li>Users must verify seller credibility through their own due diligence</li>
              <li>Payment arrangements are private agreements between users</li>
              <li>TicketBazaar cannot and will not intervene in transaction disputes</li>
              <li>Users assume all risks associated with peer-to-peer ticket purchases</li>
              <li>TicketBazaar makes no representations about listing accuracy</li>
              <li><strong>Users are fully responsible for ensuring compliance with all local laws, taxes, and resale regulations</strong></li>
            </ul>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-900 dark:text-gray-100">
                <strong>User Agreement:</strong> "I understand that TicketBazaar is only a discovery platform. I acknowledge that all transactions, payments, and ticket transfers occur outside of TicketBazaar's control, and I accept full responsibility for my interactions with other users."
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              12. Modifications to Terms
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Updates and Notifications</h3>
              <p className="text-gray-700 dark:text-gray-200 text-sm">
                TicketBazaar reserves the right to update these Terms. Significant changes will be notified via email or website banner.
              </p>
            </div>
            <p className="text-muted-foreground mb-3">
              We may modify these terms at any time by posting updated terms on our website. For significant changes that materially affect your rights or obligations, we will provide at least 30 days' advance notice through:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-3 space-y-2">
              <li>Email notification to your registered email address</li>
              <li>Prominent website banner on the platform</li>
              <li>In-app notification when you log in</li>
            </ul>
            <p className="text-muted-foreground mb-3">
              Minor changes, such as formatting updates or clarifications that do not affect your rights, may be made without advance notice.
            </p>
            <p className="text-muted-foreground">
              Your continued use of our services after the effective date of any changes constitutes acceptance of the modified terms. If you do not agree to the changes, you must discontinue use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Governing Law and Jurisdiction</h2>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Legal Jurisdiction</h3>
              <p className="text-gray-700 dark:text-gray-200 text-sm">
                These Terms are governed by the laws of India. All disputes shall be subject to the exclusive jurisdiction of the courts of Delhi.
              </p>
            </div>
            <p className="text-muted-foreground mb-3">
              By using TicketBazaar, you agree that any legal disputes arising from or relating to these Terms of Service or your use of the platform will be resolved exclusively in the courts of Delhi, India, under Indian law.
            </p>
            <p className="text-muted-foreground">
              This governing law clause applies regardless of your location or nationality. You waive any objection to the jurisdiction of Delhi courts and agree that Delhi courts have exclusive jurisdiction over all disputes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              14. Company Information
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Legal Entity Details</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-200 text-sm">
                <p><strong>Company Name:</strong> Atrina Technologies Pvt Ltd</p>
                <p><strong>CIN:</strong> [To be updated upon incorporation]</p>
                <p><strong>GSTIN:</strong> [To be updated upon registration]</p>
                <div>
                  <p><strong>Registered Office:</strong></p>
                  <div className="ml-4 mt-1">
                    <p>3/336, Jha Compound</p>
                    <p>Marris Road</p>
                    <p>Aligarh, UP 202001</p>
                    <p>India</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">
              TicketBazaar is operated by Atrina Technologies Pvt Ltd, a company incorporated under the laws of India. All legal obligations and liabilities under these Terms are assumed by Atrina Technologies Pvt Ltd.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              15. Contact Information
            </h2>
            <p className="text-muted-foreground mb-3">
              For questions regarding these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> legal@ticketbazaar.co.in</p>
              <p><strong>Postal Address:</strong></p>
              <div className="ml-4">
                <p>Atrina Technologies Pvt Ltd</p>
                <p>3/336, Jha Compound</p>
                <p>Marris Road</p>
                <p>Aligarh, UP 202001</p>
                <p>India</p>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
