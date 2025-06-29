import React from "react";
import { Shield, Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SEOManager } from "@/components/helmet-manager";
import { UnifiedSchema } from "@/components/schema/unified-schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SEOManager
        title="Privacy Policy | Ticket Bazaar"
        description="Learn about how Ticket Bazaar collects, uses, and protects your personal information. Our privacy policy explains your rights and our data practices."
        canonicalUrl="https://ticketbazaar.co.in/privacy-policy"
      >
        <UnifiedSchema />
      </SEOManager>
      <Card className="w-full shadow-lg">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Privacy Policy</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <Button
                variant={language === 'english' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('english')}
              >
                English
              </Button>
              <Button
                variant={language === 'hindi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('hindi')}
              >
                हिंदी
              </Button>
            </div>
          </div>
          <CardDescription>
            {language === 'english' ? 'Last Updated: June 3, 2025' : 'अंतिम अपडेट: 3 जून 2025'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-10 space-y-6">
          {language === 'hindi' ? (
            <>
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg mb-6">
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                  <strong>सूचना:</strong> यह हमारी अंग्रेजी गोपनीयता नीति का हिंदी सारांश है। कानूनी उद्देश्यों के लिए, कृपया पूर्ण अंग्रेजी संस्करण देखें।
                </p>
              </div>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">गोपनीयता नीति सारांश</h2>
                
                <h3 className="text-lg font-medium mb-2 mt-4">1. हमारे बारे में</h3>
                <p className="text-muted-foreground mb-3">
                  टिकट बाज़ार एक पीयर-टू-पीयर टिकट मार्केटप्लेस है जो व्यक्तिगत विक्रेताओं को खरीदारों से जोड़ता है। हमारा पंजीकृत कार्यालय 3/336, झा कंपाउंड, मैरिस रोड, अलीगढ़ 202001, भारत में है।
                </p>
                
                <h3 className="text-lg font-medium mb-2 mt-4">2. हम कौन सी जानकारी एकत्र करते हैं</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
                  <li><strong>व्यक्तिगत जानकारी:</strong> नाम, ईमेल, फोन नंबर, जन्म तिथि</li>
                  <li><strong>पहचान सत्यापन:</strong> सरकारी आईडी विवरण (धोखाधड़ी रोकथाम के लिए)</li>
                  <li><strong>लेनदेन डेटा:</strong> टिकट विवरण, बिक्री/खरीद इतिहास</li>
                  <li><strong>तकनीकी जानकारी:</strong> आईपी पता, डिवाइस जानकारी, उपयोग डेटा</li>
                </ul>
                
                <h3 className="text-lg font-medium mb-2 mt-4">3. हम आपकी जानकारी का उपयोग कैसे करते हैं</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
                  <li>उपयोगकर्ताओं के बीच टिकट लेनदेन की सुविधा प्रदान करना</li>
                  <li>धोखाधड़ी की रोकथाम और सुरक्षा सुनिश्चित करना</li>
                  <li>ग्राहक सहायता प्रदान करना</li>
                  <li>कानूनी आवश्यकताओं का अनुपालन करना</li>
                </ul>
                
                <h3 className="text-lg font-medium mb-2 mt-4">4. जानकारी साझाकरण</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
                  <li><strong>अन्य उपयोगकर्ताओं के साथ:</strong> नाम, रेटिंग, लेनदेन इतिहास (विश्वास बनाने के लिए)</li>
                  <li><strong>सेवा प्रदाताओं के साथ:</strong> भुगतान प्रोसेसर, क्लाउड सेवाएं</li>
                  <li><strong>कानूनी आवश्यकताएं:</strong> जब कानून द्वारा आवश्यक हो</li>
                </ul>
                
                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-md mb-4">
                  <p className="text-foreground font-semibold">
                    महत्वपूर्ण: टिकट बाज़ार तीसरे पक्षों को व्यक्तिगत जानकारी नहीं बेचता है।
                  </p>
                </div>
                
                <h3 className="text-lg font-medium mb-2 mt-4">5. आपके अधिकार</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
                  <li><strong>पहुंच का अधिकार:</strong> अपनी व्यक्तिगत जानकारी की प्रति मांगें</li>
                  <li><strong>सुधार का अधिकार:</strong> गलत जानकारी को अपडेट करें</li>
                  <li><strong>मिटाने का अधिकार:</strong> अपना डेटा हटाने का अनुरोध करें</li>
                  <li><strong>डेटा पोर्टेबिलिटी:</strong> अपना डेटा डाउनलोड करें (प्रोफाइल पेज से)</li>
                </ul>
                
                <h3 className="text-lg font-medium mb-2 mt-4">6. डेटा सुरक्षा</h3>
                <p className="text-muted-foreground mb-3">
                  हम आपके डेटा की सुरक्षा के लिए एन्क्रिप्शन, सुरक्षित SSL/TLS कनेक्शन, और नियमित सुरक्षा ऑडिट का उपयोग करते हैं।
                </p>
                
                <h3 className="text-lg font-medium mb-2 mt-4">7. कुकीज़</h3>
                <p className="text-muted-foreground mb-3">
                  हम एनालिटिक्स के लिए कुकीज़ का उपयोग करते हैं। गैर-आवश्यक कुकीज़ केवल आपकी सहमति से उपयोग की जाती हैं।
                </p>
                
                <h3 className="text-lg font-medium mb-2 mt-4">8. आयु प्रतिबंध</h3>
                <p className="text-muted-foreground mb-3">
                  टिकट बाज़ार केवल 18 वर्ष या उससे अधिक आयु के उपयोगकर्ताओं के लिए है।
                </p>
                
                <h3 className="text-lg font-medium mb-2 mt-4">9. संपर्क जानकारी</h3>
                <p className="text-muted-foreground mb-3">
                  गोपनीयता संबंधी प्रश्नों के लिए: privacy@ticketbazaar.co.in<br />
                  हम 30 दिनों के भीतर जवाब देंगे।
                </p>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>प्रभावी तिथि:</strong> यह गोपनीयता नीति 3 जून 2025 से प्रभावी है।
                  </p>
                </div>
              </section>
            </>
          ) : (
            <>
              <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground mb-3">
              Ticket Bazaar operates as a global discovery and contact platform connecting individual ticket sellers with buyers worldwide. We are not a reseller or broker - we do not handle ticket payments, hold inventory, or facilitate transactions. We ensure full legal compliance while improving trust in peer-to-peer ticket transfers. We respect your privacy and are committed to protecting your personal data in compliance with applicable data protection laws including GDPR, CCPA, and other international standards.
            </p>
            <p className="text-muted-foreground">
              This Privacy Policy explains how we collect, use, process, and safeguard your information when you use our website, mobile applications, and related services. By using our platform, you consent to the data practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Data Fiduciary Information
            </h2>
            <p className="text-muted-foreground mb-3">
              As per the Digital Personal Data Protection Act (DPDP) and General Data Protection Regulation (GDPR) requirements, we provide the following information about our organization:
            </p>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div>
                <h3 className="text-lg font-medium mb-2">Legal Entity:</h3>
                <p className="text-muted-foreground font-medium">Ticket Bazaar</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Registered Address:</h3>
                <address className="text-muted-foreground not-italic">
                  3/336, Jha Compound<br />
                  Marris Road<br />
                  Aligarh<br />
                  202001<br />
                  India
                </address>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Data Protection Contact:</h3>
                <p className="text-muted-foreground">
                  Email: <a href="mailto:privacy@ticketbazaar.co.in" className="text-primary hover:underline">privacy@ticketbazaar.co.in</a>
                </p>
              </div>
            </div>
            
            <p className="text-muted-foreground mt-3">
              Ticket Bazaar acts as the data controller/data fiduciary for all personal data processed through our platform. We are responsible for determining the purposes and means of processing personal data as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              3. Information We Collect
            </h2>
            <p className="text-muted-foreground mb-3">
              As a discovery and contact platform, we collect information necessary to connect users and improve trust in peer-to-peer transfers:
            </p>
            
            <h3 className="text-lg font-medium mb-2">Personal Information:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Account Information:</strong> Full name, email address, phone number, date of birth (for age verification)</li>
              <li><strong>Identity Verification:</strong> Government-issued ID details for fraud prevention and compliance</li>
              <li><strong>Social Media Information:</strong> When you connect via Google, Facebook, or other social login providers</li>
              <li><strong>Profile Information:</strong> Profile picture, bio, preferences, Instagram handle (optional)</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Transaction & P2P Data:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Ticket Information:</strong> Event details, seat information, ticket pricing, transfer methods</li>
              <li><strong>Communication Records:</strong> Messages between buyers and sellers, contact requests</li>
              <li><strong>Transaction History:</strong> Purchase records, sale records, payment details, dispute information</li>
              <li><strong>Reviews & Ratings:</strong> User feedback, trust scores, transaction reviews</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Technical Information:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns, search queries</li>
              <li><strong>Location Data:</strong> General location for event discovery, precise location with consent</li>
              <li><strong>Cookies & Tracking:</strong> Session data, preferences, analytics information</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Third-Party Data:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
              <li><strong>Social Media:</strong> Public profile information from connected accounts</li>
              <li><strong>Payment Providers:</strong> Transaction status and verification data</li>
              <li><strong>Event Data:</strong> Publicly available event information from official sources</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              4. How We Use Your Information
            </h2>
            <p className="text-muted-foreground mb-3">
              We process your personal data for specific, legitimate purposes essential to our P2P marketplace operations:
            </p>

            <h3 className="text-lg font-medium mb-2">Core Platform Operations:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Facilitate peer-to-peer ticket transactions between users</li>
              <li>Verify user identity and prevent fraudulent activities</li>
              <li>Enable direct communication between buyers and sellers</li>
              <li>Process contact requests and transaction coordination</li>
              <li>Maintain user profiles and reputation systems</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Safety & Trust:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Verify ticket authenticity and prevent counterfeit sales</li>
              <li>Monitor transactions for suspicious or prohibited activity</li>
              <li>Investigate and resolve disputes between users</li>
              <li>Enforce platform rules and community guidelines</li>
              <li>Provide customer support and assistance</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Service Enhancement:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Personalize event recommendations based on location and preferences</li>
              <li>Improve search functionality and user experience</li>
              <li>Analyze platform usage to develop new features</li>
              <li>Send relevant notifications about events and platform updates</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Legal & Compliance:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Comply with applicable laws and regulatory requirements</li>
              <li>Respond to legal requests and law enforcement inquiries</li>
              <li>Maintain records for tax and accounting purposes</li>
              <li>Protect against legal liability and enforce our terms</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Marketing & Communications:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
              <li>Send promotional emails about relevant events (with consent)</li>
              <li>Share platform updates and new feature announcements</li>
              <li>Conduct surveys and research to improve our services</li>
              <li>Display targeted advertisements based on your interests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              5. Information Sharing and Disclosure
            </h2>
            <p className="text-muted-foreground mb-3">
              As a P2P marketplace, sharing certain information is essential for transactions. We share your information only as described below:
            </p>

            <h3 className="text-lg font-medium mb-2">With Other Platform Users:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Profile Information:</strong> Name, rating, review history to build trust</li>
              <li><strong>Contact Details:</strong> Phone number or Instagram handle when you initiate contact requests</li>
              <li><strong>Transaction History:</strong> Number of successful transactions (not specific details)</li>
              <li><strong>Ticket Listings:</strong> Information about tickets you're selling</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">With Service Providers:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Payment Processors:</strong> Stripe, Razorpay for payment processing</li>
              <li><strong>Cloud Services:</strong> Hosting, database, and file storage providers</li>
              <li><strong>Authentication:</strong> Google, Facebook for social login services</li>
              <li><strong>Analytics:</strong> Website usage and performance analytics</li>
              <li><strong>Communication:</strong> Email and SMS service providers</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Legal & Safety Requirements:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Law Enforcement:</strong> When required by valid legal process</li>
              <li><strong>Fraud Prevention:</strong> To prevent, detect, or investigate illegal activities</li>
              <li><strong>Compliance:</strong> To comply with applicable laws and regulations</li>
              <li><strong>Safety:</strong> To protect the safety of our users and platform</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Business Transfers:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>In connection with merger, acquisition, or sale of assets</li>
              <li>Users will be notified of any ownership changes</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">With Your Consent:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
              <li>Any other sharing will only occur with your explicit consent</li>
              <li>You can withdraw consent at any time where legally permissible</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Sale of Personal Information:</h3>
            <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-md mb-4">
              <p className="text-foreground font-semibold">
                TicketBazaar does not sell personal information to third parties.
              </p>
              <p className="text-muted-foreground mt-2">
                We have not sold personal information in the preceding 12 months and do not intend to sell personal information in the future. This commitment applies to all user data, including data from California residents under CCPA/CPRA and users worldwide.
              </p>
            </div>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
              <li>We do not exchange personal information for monetary consideration</li>
              <li>We do not share personal information with third parties for their own marketing purposes</li>
              <li>Any data sharing is limited to the purposes explicitly outlined in this policy</li>
              <li>You have the right to opt-out of any future sale of personal information should our practices change</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
            <p className="text-muted-foreground mb-3">
              We implement comprehensive security measures to protect your personal data in our P2P marketplace:
            </p>

            <h3 className="text-lg font-medium mb-2">Technical Safeguards:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>End-to-end encryption for sensitive data transmission</li>
              <li>Secure SSL/TLS connections for all platform interactions</li>
              <li>Regular security audits and penetration testing</li>
              <li>Automated fraud detection and prevention systems</li>
              <li>Secure cloud infrastructure with enterprise-grade protection</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Operational Security:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Access controls and authentication for staff</li>
              <li>Regular employee training on data protection</li>
              <li>Incident response procedures for security breaches</li>
              <li>Regular backup and disaster recovery procedures</li>
            </ul>

            <p className="text-muted-foreground">
              While we implement industry-standard security measures, no system is completely secure. We encourage users to practice good security habits and report any suspicious activity immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              7. Your Rights and Choices
            </h2>
            <p className="text-muted-foreground mb-3">
              Under applicable privacy laws, including GDPR, CCPA, and other international standards, you have specific rights regarding your personal data:
            </p>

            <h3 className="text-lg font-medium mb-2">Data Subject Rights:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Right to Access:</strong> Request a copy of your personal data we hold</li>
              <li><strong>Right to Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data (with some limitations for P2P transactions)</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, commonly used, and machine-readable format that can be transferred to another service provider</li>
              <li><strong>Right to Object:</strong> Object to processing of your data for certain purposes</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Platform Controls:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Profile Visibility:</strong> Control what information is visible to other users</li>
              <li><strong>Contact Preferences:</strong> Manage who can contact you and how</li>
              <li><strong>Marketing Communications:</strong> Opt-out of promotional emails and notifications</li>
              <li><strong>Data Download:</strong> Export your data through your account settings</li>
              <li><strong>Account Deletion:</strong> Delete your account and associated data</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Data Portability - Download Your Data:</h3>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-muted-foreground mb-3">
                You have the right to receive a copy of your personal data in a structured, commonly used, and machine-readable format. This allows you to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-3">
                <li>Review all information we have about you</li>
                <li>Transfer your data to another service provider</li>
                <li>Keep a personal backup of your information</li>
                <li>Verify the accuracy of your data</li>
              </ul>
              <p className="text-muted-foreground">
                <strong>How to request your data:</strong> Simply visit your profile page and click on the "Download My Data" button. We'll prepare a comprehensive data export including your profile information, transaction history, communications, and all other personal data we hold. You'll receive an email notification when your download is ready, typically within 24-48 hours.
              </p>
            </div>

            <h3 className="text-lg font-medium mb-2">Important Notes for P2P Transactions:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Some data may be retained for completed transactions to maintain platform integrity</li>
              <li>Reviews and ratings may be preserved even after account deletion for community trust</li>
              <li>Legal obligations may require us to retain certain data for specified periods</li>
            </ul>

            <p className="text-muted-foreground">
              To exercise any of these rights, contact us at privacy@ticketbazaar.co.in or use the data management tools in your account settings. We will respond within 30 days of receiving your request.
            </p>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-semibold mb-3">
              8. Cookies and Similar Technologies
            </h2>
            <p className="text-muted-foreground mb-3">
              We use cookies and similar technologies to enhance your browsing
              experience, analyze site traffic, and personalize content. By using our website, 
              you automatically consent to the use of all cookies described below.
            </p>
            
            <div className="bg-muted p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium mb-2">Cookie Consent:</h3>
              <p className="text-muted-foreground">
                By continuing to use our website, you automatically accept all cookies, including essential, performance, functional, and targeting cookies. We do not display a cookie consent banner. Your continued use of the site constitutes your agreement to our cookie practices. You can manage your cookie preferences through your browser settings if you wish to block or delete cookies.
              </p>
            </div>
            <h3 className="text-lg font-medium mb-2">
              Types of Cookies We Use:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
              <li>
                <strong>Essential Cookies:</strong> These cookies are necessary
                for the website to function properly and cannot be switched off
                in our systems.
              </li>
              <li>
                <strong>Performance Cookies:</strong> These cookies allow us to
                count visits and traffic sources so we can measure and improve
                the performance of our site.
              </li>
              <li>
                <strong>Functional Cookies:</strong> These cookies enable the
                website to provide enhanced functionality and personalization.
              </li>
              <li>
                <strong>Targeting Cookies:</strong> These cookies may be set
                through our site by our advertising partners to build a profile
                of your interests.
              </li>
            </ul>
            <p className="text-muted-foreground mt-3">
              You can set your browser to block or alert you about these
              cookies, but some parts of the site will not work if you do so.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              9. Age Restrictions and Children's Privacy
            </h2>
            <p className="text-muted-foreground mb-3">
              Ticket Bazaar is designed for users who are 18 years of age or older. We strictly comply with children's privacy protection laws.
            </p>
            
            <h3 className="text-lg font-medium mb-2">Age Verification:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Users must be at least 18 years old to create an account</li>
              <li>We may request age verification during registration</li>
              <li>Financial transactions require adult legal capacity</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Protection Measures:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>We do not knowingly collect data from users under 18</li>
              <li>If we discover a minor has created an account, we will immediately suspend it</li>
              <li>Parents/guardians can report underage accounts to privacy@ticketbazaar.co.in</li>
              <li>We will delete any data collected from minors upon discovery</li>
            </ul>

            <p className="text-muted-foreground">
              If you believe we have inadvertently collected information from someone under 18, please contact us immediately and we will take appropriate action.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              10. International Data Transfers
            </h2>
            <p className="text-muted-foreground mb-3">
              As a global platform serving users worldwide, we may transfer your data across borders:
            </p>

            <h3 className="text-lg font-medium mb-2">Data Processing Locations:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Data processing occurs in secure international data centers</li>
              <li>Cloud services may store data in multiple geographic regions</li>
              <li>Third-party service providers may process data in various countries</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Transfer Safeguards:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Standard Contractual Clauses for international transfers</li>
              <li>Adequacy decisions where applicable</li>
              <li>Certification schemes and codes of conduct</li>
              <li>Regular assessment of transfer risks and safeguards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              11. Third-Party Services and Integrations
            </h2>
            <p className="text-muted-foreground mb-3">
              Our platform integrates with various third-party services to enhance your experience:
            </p>

            <h3 className="text-lg font-medium mb-2">Social Media Platforms:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Google:</strong> Authentication, email services, maps integration</li>
              <li><strong>Facebook/Meta:</strong> Social login, sharing features</li>
              <li><strong>Instagram:</strong> Profile linking and verification</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Payment and Financial Services:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Stripe:</strong> International payment processing and financial transactions</li>
              <li><strong>Regional Payment Processors:</strong> Local payment services based on your location</li>
              <li>These services have their own privacy policies governing data use</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Analytics and Performance:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Website analytics to improve user experience</li>
              <li>Performance monitoring and error tracking</li>
              <li>Marketing analytics for relevant advertising</li>
            </ul>

            <p className="text-muted-foreground">
              When you interact with these third-party services, their privacy policies also apply. We encourage you to review their policies to understand how they handle your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              12. Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground mb-3">
              We may update this Privacy Policy periodically to reflect changes in our practices, services, or legal requirements:
            </p>

            <h3 className="text-lg font-medium mb-2">Notification Methods:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Email notification to registered users for material changes</li>
              <li>Prominent notice on our website and platform</li>
              <li>In-app notifications for significant policy updates</li>
              <li>Updated "Last Modified" date at the top of this policy</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Your Options:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Review changes before they take effect</li>
              <li>Contact us with questions about policy changes</li>
              <li>Delete your account if you disagree with new terms</li>
              <li>Continue using the platform constitutes acceptance of changes</li>
            </ul>

            <p className="text-muted-foreground">
              Significant changes will be communicated at least 30 days before taking effect, allowing you time to review and make informed decisions about your continued use of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Data Retention</h2>
            <p className="text-muted-foreground mb-3">
              We retain your personal data based on specific business needs and legal requirements:
            </p>

            <h3 className="text-lg font-medium mb-2">Retention Periods:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Account Data:</strong> Retained while your account is active plus 3 years after closure</li>
              <li><strong>Transaction Records:</strong> 7 years for financial compliance and tax purposes</li>
              <li><strong>Communication Logs:</strong> 3 years for dispute resolution and customer support</li>
              <li><strong>Reviews and Ratings:</strong> Indefinitely to maintain platform trust and integrity</li>
              <li><strong>Marketing Data:</strong> Until you opt-out or withdraw consent</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Secure Deletion:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Data is securely deleted when retention periods expire</li>
              <li>Multiple deletion passes to ensure data cannot be recovered</li>
              <li>Regular audits to verify deletion compliance</li>
              <li>Anonymization of historical data where possible</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Legal Holds:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
              <li>Data may be retained longer if subject to legal proceedings</li>
              <li>Regulatory investigations may extend retention periods</li>
              <li>Users will be notified if data retention is extended</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Contact Information and Data Protection Officer</h2>
            <p className="text-muted-foreground mb-3">
              For questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us through the following channels:
            </p>

            <h3 className="text-lg font-medium mb-2">General Privacy Inquiries:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Email:</strong> privacy@ticketbazaar.co.in</li>
              <li><strong>Response Time:</strong> We will respond within 30 days</li>
              <li><strong>Languages:</strong> Multiple languages supported based on your region</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Data Subject Rights Requests:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li>Use the data management tools in your account settings</li>
              <li>Email us with specific requests for access, correction, or deletion</li>
              <li>Include your account email and specific request details</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Company Information:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
              <li><strong>Company Name:</strong> Ticket Bazaar</li>
              <li><strong>Registered Address:</strong> 3/336, Jha Compound, Marris Road, Aligarh 202001, India</li>
              <li><strong>Global Operations:</strong> Serving customers worldwide</li>
              <li><strong>Business Hours:</strong> 24/7 support across multiple time zones</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Regulatory Complaints:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
              <li>You have the right to lodge complaints with relevant data protection authorities</li>
              <li>Contact your local data protection authority in your jurisdiction</li>
              <li>We comply with GDPR, CCPA, and other applicable privacy regulations</li>
            </ul>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Effective Date:</strong> This Privacy Policy is effective as of June 3, 2025, and governs all data processing activities from this date forward. Previous versions of our privacy policy remain available upon request.
              </p>
            </div>
          </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
