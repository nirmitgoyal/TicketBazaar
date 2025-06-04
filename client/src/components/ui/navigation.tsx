import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Home, Plus, User, Ticket } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location === path;

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="text-xl font-bold">TicketHub</div>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button 
                variant={isActive("/") ? "default" : "ghost"} 
                size="sm"
              >
                <Home className="w-4 h-4 mr-2" />
                Events
              </Button>
            </Link>
            
            {user && (
              <>
                <Link href="/list-ticket">
                  <Button 
                    variant={isActive("/list-ticket") ? "default" : "ghost"} 
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    List Ticket
                  </Button>
                </Link>
                
                <Link href="/my-tickets">
                  <Button 
                    variant={isActive("/my-tickets") ? "default" : "ghost"} 
                    size="sm"
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    My Tickets
                  </Button>
                </Link>
                
                <Link href="/profile">
                  <Button 
                    variant={isActive("/profile") ? "default" : "ghost"} 
                    size="sm"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.fullName}
                </span>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}