import { Link } from "wouter";
import { Ticket } from "lucide-react";

import instagramLogo from "../../assets/instagram-logo.png";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white pt-8 pb-6 border-t safe-area-bottom">
      <div className="container mx-auto mobile-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <div className="flex items-center space-x-1 mb-4">
              <Ticket className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-bold font-poppins text-primary">
                Ticket Bazaar
              </h3>
            </div>
            <p className="text-sm text-textSecondary mb-4">
              Discovery and contact platform for event tickets. We are not a reseller or broker - we don't handle payments, hold inventory, or facilitate transactions. We ensure legal compliance in peer-to-peer transfers.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.instagram.com/ticketbazaar.co.in"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={instagramLogo} alt="Instagram" className="h-6 w-6" />
              </a>
              <a
                href="https://www.linkedin.com/company/ticket-bazaar-co-in/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#0077B5"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>



          <div>
            <h4 className="font-medium text-base mb-4">Sell Tickets</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-to-sell-tickets">
                  <a className="text-textSecondary hover:text-primary">
                    How to Sell Ticket Online
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/list-ticket">
                  <a className="text-textSecondary hover:text-primary">
                    Sell Your Tickets
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/resell-tickets">
                  <a className="text-textSecondary hover:text-primary">
                    Resell Tickets
                  </a>
                </Link>
              </li>

            </ul>
          </div>

          <div>
            <h4 className="font-medium text-base mb-4">Buy Tickets</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/buy-second-hand-tickets">
                  <a className="text-textSecondary hover:text-primary">
                    Buy Second Hand Tickets
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/?category=concerts">
                  <a className="text-textSecondary hover:text-primary">
                    Concert Tickets
                  </a>
                </Link>
              </li>
            </ul>
          </div>


        </div>

        <div className="border-t mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-textSecondary mb-4 md:mb-0">
              © {year} Ticket Bazaar. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm">
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-textSecondary hover:text-primary"
              >
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-textSecondary hover:text-primary"
              >
                Terms of Service
              </a>
              <a
                href="/privacy-policy#cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-textSecondary hover:text-primary"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
