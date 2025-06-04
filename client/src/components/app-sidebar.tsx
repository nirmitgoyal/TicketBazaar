import {
  Home,
  Map,
  Ticket,
  UserCircle,
  Plus,
  LogOut,
  Calendar,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logoutMutation } = useAuth();

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Ticket className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">TicketHub</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation("/")}
                  isActive={location === "/"}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation("/map")}
                  isActive={location === "/map" || location === "/events/map"}
                >
                  <Map className="h-4 w-4" />
                  <span>Map View</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation("/events/category/all")}
                  isActive={location.startsWith("/events/category")}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Browse Events</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAuthenticated && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Your Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNavigation("/my-tickets")}
                      isActive={location === "/my-tickets"}
                    >
                      <Ticket className="h-4 w-4" />
                      <span>My Tickets</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNavigation("/list-ticket")}
                      isActive={location === "/list-ticket"}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Sell Tickets</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNavigation("/profile")}
                      isActive={location === "/profile"}
                    >
                      <UserCircle className="h-4 w-4" />
                      <span>Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {!isAuthenticated && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Get Started</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNavigation("/list-ticket")}
                      isActive={location === "/list-ticket"}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Start Selling</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNavigation("/login")}
                      isActive={location === "/login"}
                    >
                      <UserCircle className="h-4 w-4" />
                      <span>Sign In</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {isAuthenticated && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
