import React from "react";
import { Scroll } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SEO from "@/components/seo";
import { OrganizationSchema } from "@/components/schema/organization-schema";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SEO
        title="Terms of Service | Ticket Bazaar"
        description="Read the Ticket Bazaar terms of service agreement. Learn about user rights and responsibilities, ticket resale policies, dispute resolution, and more."
        canonicalUrl="https://ticketbazaar.co.in/terms-of-service"
      >
        <OrganizationSchema />
      </SEO>
      <Card className="w-full shadow-lg">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Scroll className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Terms of Service</CardTitle>
          </div>
          <CardDescription>Last Updated: April 6, 2025</CardDescription>
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
              2. Service Description
            </h2>
            <p className="text-muted-foreground">
              Ticket Bazaar provides a platform for users to buy and sell
              tickets for events in India. We facilitate transactions between
              buyers and sellers but do not guarantee the validity of tickets or
              the occurrence of events.
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
            <p className="text-muted-foreground">
              Sellers must accurately represent the tickets they list and must
              have the legal right to sell them. Resale prices may not exceed
              the original ticket price in accordance with applicable laws and
              regulations governing ticket resale in India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Buying Tickets</h2>
            <p className="text-muted-foreground">
              Buyers are responsible for verifying event details before
              purchasing tickets. All sales are final unless the event is
              canceled or rescheduled. Refunds are subject to our Refund Policy
              and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Payment and Fees</h2>
            <p className="text-muted-foreground">
              Ticket Bazaar charges service fees for facilitating transactions
              on our platform. These fees are displayed during the checkout
              process. Payment processing is handled securely through our
              payment partners.
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
              8. Dispute Resolution
            </h2>
            <p className="text-muted-foreground">
              Disputes between buyers and sellers should first be addressed
              through our platform's dispute resolution system. If a resolution
              cannot be reached, users may pursue remedies available under
              Indian law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              9. Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              Ticket Bazaar is not liable for the actions of users, the validity
              of tickets, or the cancellation or rescheduling of events. Our
              liability is limited to the fees paid for our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              10. Modifications to Terms
            </h2>
            <p className="text-muted-foreground">
              We may modify these terms at any time by posting updated terms on
              our website. Your continued use of our services after such changes
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms are governed by the laws of India. Any disputes
              arising from these terms shall be subject to the exclusive
              jurisdiction of the courts in Delhi, India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              12. Contact Information
            </h2>
            <p className="text-muted-foreground">
              For questions regarding these Terms of Service, please contact us
              at legal@ticketbazaar.co.in.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
