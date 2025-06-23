import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { UserCircle, Menu, X, Map, Ticket } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { fadeInDown, listItem, staggerContainer } from "@/lib/animations";

export function Navigation() {
  const { user, isAuthenticated, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle navigation with proper client-side routing and preserve search params
  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    
    // Preserve search parameters when navigating between tabs
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;
    
    // Only preserve search params for main navigation tabs
    if (path === "/map" || path === "/popularity" || path === "/") {
      const newUrl = new URL(path, window.location.origin);
      
      // Copy relevant search parameters
      if (searchParams.get("q")) {
        newUrl.searchParams.set("q", searchParams.get("q")!);
      }
      if (searchParams.get("location")) {
        newUrl.searchParams.set("location", searchParams.get("location")!);
      }
      if (searchParams.get("category")) {
        newUrl.searchParams.set("category", searchParams.get("category")!);
      }
      
      // Use the full URL with search params
      window.history.pushState(null, "", newUrl.toString());
      setLocation(path);
    } else {
      // For other pages, navigate normally
      setLocation(path);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.header
      className="sticky top-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
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
                  className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors hover:bg-accent/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Ticket className="h-8 w-8 text-primary" />
                  <span className="font-bold text-xl">Ticket Bazaar</span>
                </motion.div>
              </Link>
            </motion.div>

            {/* Desktop Navigation Links */}
            <motion.div
              className="hidden md:flex items-center space-x-1"
              variants={staggerContainer(0.1, 0.1)}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={listItem}>
                <Link href="/">
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location === "/" ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"
                    }`}
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
                </Link>
              </motion.div>

              <motion.div variants={listItem}>
                <Link href="/map">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location === "/events/map" || location === "/map"
                        ? "text-primary bg-primary/5"
                        : "text-foreground hover:bg-accent"
                    }`}
                    onClick={() => handleNavigation("/map")}
                  >
                    <Map className="h-4 w-4" />
                    Map View
                  </button>
                </Link>
              </motion.div>

              <motion.div variants={listItem}>
                <Link href="/popularity">
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location === "/popularity" ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"
                    }`}
                    onClick={() => handleNavigation("/popularity")}
                  >
                    Popular Tickets
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Desktop Auth Actions */}
            <motion.div
              className="hidden md:flex items-center space-x-2"
              variants={staggerContainer(0.1, 0.1)}
              initial="hidden"
              animate="visible"
            >
              {!isAuthenticated && (
                <>
                  <motion.div variants={listItem}>
                    <Link href="/list-ticket">
                      <button className="px-4 py-2 text-sm font-medium text-primary rounded-lg transition-colors hover:bg-primary/5">
                        Start Selling
                      </button>
                    </Link>
                  </motion.div>

                  <motion.div variants={listItem}>
                    <Link href="/login">
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary rounded-lg transition-colors hover:bg-primary/5">
                        Sign In
                      </button>
                    </Link>
                  </motion.div>
                </>
              )}

              {isAuthenticated && (
                <>
                  <motion.div variants={listItem}>
                    <Link href="/my-tickets">
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          location === "/my-tickets" ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"
                        }`}
                      >
                        My Tickets
                      </button>
                    </Link>
                  </motion.div>

                  <motion.div variants={listItem}>
                    <Link href="/list-ticket">
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          location === "/list-ticket" ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"
                        }`}
                      >
                        Sell Tickets
                      </button>
                    </Link>
                  </motion.div>

                  <motion.div variants={listItem}>
                    <Link href="/profile">
                      <button
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          location === "/profile" ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"
                        }`}
                      >
                        <UserCircle className="h-4 w-4" />
                        {user?.email?.split("@")[0] || "Profile"}
                      </button>
                    </Link>
                  </motion.div>

                  <motion.div variants={listItem}>
                    <button
                      className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-colors hover:bg-accent"
                      onClick={() => {
                        logoutMutation.mutate(undefined, {
                          onSuccess: () => {
                            setLocation("/");
                          },
                        });
                      }}
                    >
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.button
                onClick={toggleMenu}
                className="p-2 rounded-lg text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/20"
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle mobile menu"
                aria-expanded={isMenuOpen}
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
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
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
                className="md:hidden mt-4 py-2 border-t relative z-[70] bg-background"
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
                      className={`py-3 px-2 block text-left w-full touch-target rounded-md transition-colors ${location === "/" ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"}`}
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
                      className={`flex items-center gap-2 py-3 px-2 text-left w-full touch-target rounded-md transition-colors ${location === "/events/map" || location === "/map" ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"}`}
                      onClick={() => handleNavigation("/map")}
                    >
                      <Map className="h-4 w-4" />
                      Map View
                    </button>
                  </motion.div>

                  <motion.div variants={listItem}>
                    <button
                      className={`py-3 px-2 block text-left w-full touch-target rounded-md transition-colors ${location === "/popularity" ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"}`}
                      onClick={() => handleNavigation("/popularity")}
                    >
                      Popular Tickets
                    </button>
                  </motion.div>

                  {isAuthenticated && (
                    <>
                      <motion.div variants={listItem}>
                        <button
                          className={`py-3 px-2 block text-left w-full touch-target rounded-md transition-colors ${location === "/my-tickets" ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"}`}
                          onClick={() => handleNavigation("/my-tickets")}
                        >
                          My Tickets
                        </button>
                      </motion.div>

                      <motion.div variants={listItem}>
                        <button
                          className={`py-3 px-2 block text-left w-full touch-target rounded-md transition-colors ${location === "/list-ticket" ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"}`}
                          onClick={() => handleNavigation("/list-ticket")}
                        >
                          Sell Tickets
                        </button>
                      </motion.div>

                      <motion.div variants={listItem}>
                        <button
                          className={`py-3 px-2 block text-left w-full touch-target rounded-md transition-colors ${location === "/profile" ? "text-primary bg-primary/5" : "text-foreground hover:bg-accent"}`}
                          onClick={() => handleNavigation("/profile")}
                        >
                          Profile
                        </button>
                      </motion.div>

                      <motion.div variants={listItem}>
                        <button
                          className="py-3 px-2 text-muted-foreground cursor-pointer block w-full text-left touch-target rounded-md transition-colors hover:bg-accent"
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

      {/* Mobile menu overlay - positioned outside nav container for proper click-outside functionality */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[50] md:hidden bg-black/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
}