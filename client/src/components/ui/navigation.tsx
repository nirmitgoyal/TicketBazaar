import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { UserCircle, Menu, X, Map, Ticket } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { fadeInDown, listItem, staggerContainer } from "@/lib/animations";
import { RealTimeNotifications } from "@/components/real-time-notifications";

export function Navigation() {
  const { user, isAuthenticated, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle navigation with proper client-side routing
  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    setLocation(path);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.header
      className="bg-white shadow-md sticky top-0 z-50"
      data-testid="navigation"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <nav aria-label="Main Navigation">
        <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-2 min-w-0 flex-shrink-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/">
              <motion.div
                className="flex items-center space-x-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Ticket className="h-6 w-6 text-primary" />
                <motion.div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    Ticket Bazaar
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">P2P Marketplace</p>
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden md:flex items-center space-x-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <motion.button
              className={`px-4 py-2 rounded-lg transition-all duration-200 touch-target ${
                location === "/"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
              data-testid="nav-home"
              onClick={() =>
                handleNavigation(
                  location === "/map" || location === "/events/map"
                    ? "/map-to-home"
                    : "/",
                )
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Home
            </motion.button>

            <motion.button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 touch-target ${
                location === "/events/map" || location === "/map"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
              data-testid="nav-map"
              onClick={() => handleNavigation("/map")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Map className="h-4 w-4" />
              Map View
            </motion.button>

            {isAuthenticated && (
              <>
                <motion.button
                  className={`px-4 py-2 rounded-lg transition-all duration-200 touch-target ${
                    location === "/my-tickets"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  }`}
                  onClick={() => handleNavigation("/my-tickets")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  My Tickets
                </motion.button>

                <motion.button
                  className={`px-4 py-2 rounded-lg transition-all duration-200 touch-target ${
                    location === "/list-ticket"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  }`}
                  data-testid="nav-list-ticket"
                  onClick={() => handleNavigation("/list-ticket")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sell Tickets
                </motion.button>

                <motion.button
                  className={`px-4 py-2 rounded-lg transition-all duration-200 touch-target ${
                    location === "/profile"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  }`}
                  data-testid="nav-profile"
                  onClick={() => handleNavigation("/profile")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Profile
                </motion.button>

                <motion.button
                  className="text-gray-600 hover:text-primary hover:bg-gray-50 px-4 py-2 rounded-lg transition-all duration-200 touch-target"
                  onClick={() => {
                    logoutMutation.mutate(undefined, {
                      onSuccess: () => setLocation("/"),
                    });
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </>
            )}

            {!isAuthenticated && (
              <motion.button
                className="border-primary text-primary hover:bg-primary/10 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => handleNavigation("/list-ticket")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Selling
              </motion.button>
            )}
          </motion.div>

          {/* Mobile Navigation Controls */}
          <motion.div
            className="md:hidden flex items-center space-x-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <RealTimeNotifications />

            <motion.div
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  className="border-primary text-primary hover:bg-primary/10 flex items-center justify-center gap-1 px-3 py-2 touch-target border border-input bg-background h-9 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => handleNavigation("/list-ticket")}
                >
                  <span className="text-xs whitespace-nowrap">Sell</span>
                </button>
              </motion.div>
            </motion.div>

            {isAuthenticated && (
              <motion.div
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.button
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs cursor-pointer overflow-hidden bg-primary touch-target"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  onClick={() => handleNavigation("/profile")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {user?.instagram ? (
                    <img
                      src={`https://unavatar.io/instagram/${user.instagram}`}
                      alt={user.fullName || "User"}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : null}
                  <span
                    className={`w-full h-full flex items-center justify-center ${user?.instagram ? "hidden" : "flex"}`}
                  >
                    {user?.fullName?.charAt(0).toUpperCase() || "U"}
                  </span>
                </motion.button>
              </motion.div>
            )}

            <motion.button
              className="text-textPrimary touch-target p-1"
              onClick={toggleMenu}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden mt-4 py-2 border-t"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.nav
                className="flex flex-col space-y-2"
                variants={staggerContainer(0.05, 0.1)}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={listItem}>
                  <button
                    className={`py-3 px-2 block text-left w-full touch-target rounded-md transition-colors ${location === "/" ? "text-primary bg-primary/5" : "text-textPrimary hover:bg-gray-50"}`}
                    onClick={() =>
                      handleNavigation(
                        location === "/map" || location === "/events/map"
                          ? "/map-to-home"
                          : "/",
                      )
                    }
                  >
                    Home
                  </button>
                </motion.div>

                <motion.div variants={listItem}>
                  <button
                    className={`flex items-center gap-2 py-3 px-2 text-left w-full touch-target rounded-md transition-colors ${location === "/events/map" || location === "/map" ? "text-primary bg-primary/5" : "text-textPrimary hover:bg-gray-50"}`}
                    onClick={() => handleNavigation("/map")}
                  >
                    <Map className="h-4 w-4" />
                    Map View
                  </button>
                </motion.div>

                {isAuthenticated && (
                  <>
                    <motion.div variants={listItem}>
                      <button
                        className={`py-3 px-2 block text-left w-full touch-target rounded-md transition-colors ${location === "/my-tickets" ? "text-primary bg-primary/5" : "text-textPrimary hover:bg-gray-50"}`}
                        onClick={() => handleNavigation("/my-tickets")}
                      >
                        My Tickets
                      </button>
                    </motion.div>

                    <motion.div variants={listItem}>
                      <button
                        className={`py-3 px-2 block text-left w-full touch-target rounded-md transition-colors ${location === "/list-ticket" ? "text-primary bg-primary/5" : "text-textPrimary hover:bg-gray-50"}`}
                        onClick={() => handleNavigation("/list-ticket")}
                      >
                        Sell Tickets
                      </button>
                    </motion.div>

                    <motion.div variants={listItem}>
                      <button
                        className={`py-3 px-2 block text-left w-full touch-target rounded-md transition-colors ${location === "/profile" ? "text-primary bg-primary/5" : "text-textPrimary hover:bg-gray-50"}`}
                        onClick={() => handleNavigation("/profile")}
                      >
                        Profile
                      </button>
                    </motion.div>

                    <motion.div variants={listItem}>
                      <button
                        className="py-3 px-2 text-textPrimary cursor-pointer block w-full text-left touch-target rounded-md transition-colors hover:bg-gray-50"
                        onClick={() => {
                          logoutMutation.mutate(undefined, {
                            onSuccess: () => {
                              setLocation("/");
                              setIsMenuOpen(false);
                            },
                          });
                        }}
                      >
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}

                {!isAuthenticated && (
                  <>
                    <motion.div variants={listItem}>
                      <button
                        className="py-3 px-2 block font-medium text-primary text-left w-full touch-target rounded-md transition-colors hover:bg-primary/5"
                        onClick={() => handleNavigation("/list-ticket")}
                      >
                        Start Selling
                      </button>
                    </motion.div>

                    <motion.div variants={listItem}>
                      <button
                        className="py-3 px-2 flex items-center gap-2 text-primary font-medium w-full text-left touch-target rounded-md transition-colors hover:bg-primary/5"
                        onClick={() => handleNavigation("/login")}
                      >
                        Sign In
                      </button>
                    </motion.div>
                  </>
                )}
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </nav>
    </motion.header>
  );
}
