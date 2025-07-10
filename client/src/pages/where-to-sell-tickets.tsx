import { SEOManager } from "@/components/helmet-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Clock, Users, ArrowRight, MapPin, Target, Award } from "lucide-react";
import { Link } from "wouter";
import { generateLandingPageSEO, generateSellingStructuredData } from "@/utils/seo-utils";

export default function WhereToSellTicketsPage() {
  const seoData = generateLandingPageSEO("where-to-sell-tickets");
  const faqStructuredData = generateSellingStructuredData("selling");

  return (
    <>
      <SEOManager
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalUrl="https://ticketbazaar.co.in/where-to-sell-tickets"
      />
      
      <script type="application/ld+json">
        {JSON.stringify(seoData.structuredData)}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </script>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Where to Sell Tickets | Best Places to Sell Tickets Online
              </h1>
              <p className="text-xl mb-8">
                Find the best places to sell tickets online. Learn where to sell concert tickets, where to sell tickets safely, and discover why TicketBazaar is India's #1 choice for selling tickets online.
              </p>
              <Link href="/sell">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Start Selling on TicketBazaar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why TicketBazaar Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why TicketBazaar is the Best Place to Sell Tickets Online
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <Card>
                  <CardHeader>
                    <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle className="text-center">Most Secure Platform</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      TicketBazaar is India's most secure ticket selling platform with verified buyers, secure transactions, and buyer protection. The safest place to sell tickets online.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle className="text-center">Largest Buyer Network</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      Connect with thousands of verified ticket buyers across India. More buyers means faster sales and better prices for your tickets.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle className="text-center">Highest Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      95% of tickets listed on TicketBazaar sell within 48 hours. The most effective platform to sell concert tickets and event tickets in India.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Where to Sell Tickets: Platform Comparison
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-4 text-left font-semibold">Feature</th>
                      <th className="border p-4 text-center font-semibold text-primary">TicketBazaar</th>
                      <th className="border p-4 text-center font-semibold text-gray-600">Social Media</th>
                      <th className="border p-4 text-center font-semibold text-gray-600">General Classifieds</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-4 font-medium">Verified Buyers</td>
                      <td className="border p-4 text-center"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                      <td className="border p-4 text-center">❌</td>
                      <td className="border p-4 text-center">❌</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-4 font-medium">Secure Transactions</td>
                      <td className="border p-4 text-center"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                      <td className="border p-4 text-center">❌</td>
                      <td className="border p-4 text-center">❌</td>
                    </tr>
                    <tr>
                      <td className="border p-4 font-medium">Dedicated Ticket Platform</td>
                      <td className="border p-4 text-center"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                      <td className="border p-4 text-center">❌</td>
                      <td className="border p-4 text-center">❌</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-4 font-medium">Fraud Protection</td>
                      <td className="border p-4 text-center"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                      <td className="border p-4 text-center">❌</td>
                      <td className="border p-4 text-center">❌</td>
                    </tr>
                    <tr>
                      <td className="border p-4 font-medium">Quick Sales</td>
                      <td className="border p-4 text-center"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                      <td className="border p-4 text-center">⚠️ Limited</td>
                      <td className="border p-4 text-center">⚠️ Limited</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Location-based Selling */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Where to Sell Concert Tickets by City
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Mumbai
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Sell concert tickets in Mumbai on TicketBazaar. High demand for Bollywood concerts, international artists, and music festivals.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• NSCI Dome events</li>
                      <li>• Jio Garden concerts</li>
                      <li>• Phoenix Marketcity shows</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Delhi NCR
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Best place to sell tickets in Delhi for concerts, sports events, and entertainment shows. Active buyer community.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Jawaharlal Nehru Stadium</li>
                      <li>• Kingdom of Dreams</li>
                      <li>• India Gate events</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Bangalore
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Sell tickets online in Bangalore for tech events, concerts, and cultural shows. Large tech community seeking entertainment.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Palace Grounds events</li>
                      <li>• UB City Mall shows</li>
                      <li>• Forum Mall events</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Tips for Where to Sell Tickets Successfully
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Choose the Right Platform</h3>
                    <p className="text-gray-600">
                      TicketBazaar is specifically designed for ticket sales, unlike general platforms. Our specialized features ensure better visibility and faster sales for your tickets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Target Active Buyers</h3>
                    <p className="text-gray-600">
                      Sell where buyers are actively looking. TicketBazaar has thousands of verified buyers specifically searching for event tickets, not random classified ads.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Ensure Security</h3>
                    <p className="text-gray-600">
                      Only sell on platforms with verified users and secure transaction methods. TicketBazaar's verification process protects both buyers and sellers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">List Early for Best Results</h3>
                    <p className="text-gray-600">
                      List your tickets as soon as you know you can't attend. Early listings get more visibility and better prices on TicketBazaar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Frequently Asked Questions About Where to Sell Tickets
              </h2>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Where is the best place to sell concert tickets?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      TicketBazaar is the best place to sell concert tickets in India. We offer verified buyers, secure transactions, fraud protection, and the highest success rate for ticket sales. Our platform is specifically designed for ticket selling, unlike general marketplaces.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Where can I sell my tickets safely?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Sell your tickets safely on TicketBazaar with verified buyers, secure messaging, and transaction protection. Avoid selling on social media or unverified platforms where fraud is common.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What's the fastest way to sell tickets online?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      List your tickets on TicketBazaar for the fastest sales. Our active buyer community and specialized platform ensure 95% of tickets sell within 48 hours. Include good photos and competitive pricing for best results.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Where to sell football tickets and sports tickets?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      TicketBazaar is perfect for selling football tickets, cricket tickets, and all sports event tickets. We have dedicated sports fans actively looking for tickets to upcoming matches and tournaments.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Sell Your Tickets on India's Best Platform?
              </h2>
              <p className="text-xl mb-8">
                Join thousands who choose TicketBazaar as the best place to sell tickets online. Safe, secure, and successful ticket selling starts here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sell">
                  <Button size="lg" variant="secondary" className="font-semibold">
                    Start Selling Your Tickets
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/how-to-sell-tickets">
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Learn How to Sell Tickets
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
