
import React from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, Home, Search, User, Plus } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { Link, useLocation } from 'react-router-dom';

export function MobileNav() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/list-ticket', label: 'Sell', icon: Plus },
    { href: user ? '/profile' : '/login', label: user ? 'Profile' : 'Login', icon: User },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="mobile:fixed mobile:bottom-0 mobile:left-0 mobile:right-0 mobile:bg-white mobile:border-t mobile:border-gray-200 mobile:z-50 mobile:safe-area-bottom">
        <nav className="mobile:flex mobile:justify-around mobile:py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`mobile:flex mobile:flex-col mobile:items-center mobile:py-2 mobile:px-3 mobile:min-w-[64px] mobile:touch-target mobile:rounded-lg mobile:transition-colors ${
                  isActive 
                    ? 'mobile:text-primary mobile:bg-primary/10' 
                    : 'mobile:text-muted-foreground mobile:hover:text-primary'
                }`}
              >
                <Icon className="mobile:h-5 mobile:w-5 mobile:mb-1" />
                <span className="mobile:text-xs mobile:font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Header Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mobile:flex desktop:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">TicketBazaar</h2>
              {user && (
                <p className="text-sm text-muted-foreground mt-1">
                  Welcome, {user.fullName}
                </p>
              )}
            </div>
            
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg touch-target transition-colors ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
