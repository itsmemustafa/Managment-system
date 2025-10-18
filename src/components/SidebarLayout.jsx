import React from "react";
import { TextAnimate } from "@/components/ui/text-animate";
import logo from "@/assets/elryanlogo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import getUser from "../Utils/getUser";
import { BubbleBackground } from "@/components/animate-ui/components/backgrounds/bubble";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LogOut,
  PlusCircle,
  Eye,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Activity,
  Gauge,
  HomeIcon,
} from "lucide-react";

const NavItem = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <SidebarMenuItem>
      <Link to={to} className="block">
        <SidebarMenuButton
          isActive={isActive}
          className={
            isActive
              ? "bg-[#3c5dac] text-white hover:bg-[#3c5dac] hover:text-white"
              : "hover:bg-[#3c5dac]/10 hover:text-[#3c5dac]"
          }
        >
          <Icon className="h-4 w-4" />
          <span>{children}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
};

const SidebarLayout = ({ children, title = "Dashboard" }) => {
  const navigate = useNavigate();
  
  // Get user once at parent level instead of in every NavItem
  const user = getUser('currentUser');
  const role = user?.role;
  const email = user?.email;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      navigate("/", { replace: true });
    }
  };

  // Determine if charts should be shown based on role
  const showCharts = role === "ADMIN" || role === "SUPERVISOR";
  const showUserManagement = role === "ADMIN";

  const colors = {
    first:  '255,255,255',   
    second: '245,250,255',  
    third:  '235,245,255', 
    fourth: '190,170,255',  
    fifth:  '160,150,255',   
    sixth:  '110,100,255',   
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar
        collapsible="icon"
        className="relative overflow-hidden bg-sidebar text-sidebar-foreground border-r"
      >
        <BubbleBackground colors={colors} interactive={false} className="absolute inset-0" />
        <SidebarHeader className="relative z-10 border-b">
          <div className="flex items-center gap-2 px-4 py-3">
            <img
              src={logo}
              alt="Elryan Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold text-base truncate text-[#3c5dac]">
              Elryan
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="relative z-10">
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">
              Home
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem to="/home" icon={HomeIcon}>
                  Home page
                </NavItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        

          <SidebarSeparator className="my-1" />
  {/* Maintenance Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">
              Maintenance
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                 <NavItem to="/ShowMaintainance" icon={Eye}>
                  View Maintenance
                </NavItem>
                <NavItem to="/EnterMaintainance" icon={PlusCircle}>
                  Add Maintenance
                </NavItem>
               
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
 <SidebarSeparator className="my-1" />
          {/* Installations Section */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">
              Installations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>  
                  <NavItem to="/ShowInstallations" icon={Eye}>
                  View Installations
                </NavItem>
                <NavItem to="/EnterInstallations" icon={PlusCircle}>
                  Add Installation
                </NavItem>
            
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-1" />

        
          {/* Charts Section - Only for Admin/Supervisor */}
          {showCharts && (
            <>
              <SidebarSeparator className="my-1" />
              
              <SidebarGroup>
                <SidebarGroupLabel className="text-muted-foreground">
                  Analytics
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu> 
                    <NavItem to="/chart2" icon={BarChart3}>
                     Top Brands Issues
                    </NavItem> 
                    <NavItem to="/chart6" icon={Activity}>
                     Top Installations
                    </NavItem>
                    <NavItem to="/chart1" icon={LineChart}>
                     Device Maintenance
                    </NavItem>
                        <NavItem to="/chart4" icon={BarChart3}>
                    Governorate Performance
                    </NavItem>
                     <NavItem to="/chart8" icon={Gauge}>
                     Brand Performance
                    </NavItem>
                    <NavItem to="/chart5" icon={PieChart}>
                     Project Impact
                    </NavItem>
                    <NavItem to="/chart3" icon={PieChart}>
                     Maintenance Timeline
                    </NavItem>
               
                   
                    <NavItem to="/chart7" icon={TrendingUp}>
             Installation Trends
                    </NavItem>
                   
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}  
          {/* User Management Section */}
          {showUserManagement && (
            <>
              <SidebarSeparator className="my-1" />
              <SidebarGroup>
                <SidebarGroupLabel className="text-muted-foreground">
                  User Management
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <NavItem to="/UsersTable" icon={Users}>
                      View Users
                    </NavItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>

        <SidebarFooter className="relative z-10 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="text-red-600 hover:text-white hover:bg-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="flex flex-col h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-blue-500/10 backdrop-blur px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="flex-shrink-0" />
            <span className="text-sm font-medium text-muted-foreground capitalize">
              {role?.toLowerCase()}
            </span>
          </div>
          <TextAnimate animation="slideLeft" by="word" className="text-xl font-semibold">
            {email?.split('@')[0]}
          </TextAnimate>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-muted/30">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarLayout;