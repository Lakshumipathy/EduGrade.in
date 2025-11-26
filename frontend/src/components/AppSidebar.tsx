import { Home, FileText, Calendar, Trophy, BookOpen, TrendingUp, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const studentItems = [
  { title: "Dashboard", url: "/student/dashboard", icon: Home },
  { title: "Performance Review", url: "/student/performance", icon: TrendingUp },
  { title: "Assignments", url: "/student/assignments", icon: FileText },
  { title: "Club Events", url: "/student/events", icon: Calendar },
  { title: "Achievements", url: "/student/achievements", icon: Trophy },
  { title: "Research/Internship", url: "/student/research-internship", icon: BookOpen },
];

const teacherItems = [
  { title: "Dashboard", url: "/teacher/dashboard", icon: Home },
  { title: "Assignments", url: "/teacher/assignments", icon: FileText },
  { title: "Club Events", url: "/teacher/events", icon: Calendar },
  { title: "Achievements", url: "/teacher/achievements", icon: Trophy },
  { title: "Research/Internship", url: "/teacher/research-internship", icon: BookOpen },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentPath = location.pathname;
  const [assignmentsBadge, setAssignmentsBadge] = useState(0);
  const [eventsBadge, setEventsBadge] = useState(0);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setRole(user.role);
    }
  }, []);

  useEffect(() => {
    if (role === "student") {
      const checkNotifications = () => {
        const lastCheckedAssignments = localStorage.getItem("lastCheckedAssignments") || "0";
        const lastCheckedEvents = localStorage.getItem("lastCheckedEvents") || "0";
        const lastAssignmentPosted = localStorage.getItem("lastAssignmentPosted") || "0";
        const lastEventPosted = localStorage.getItem("lastEventPosted") || "0";

        if (parseInt(lastAssignmentPosted) > parseInt(lastCheckedAssignments)) {
          const assignments = JSON.parse(localStorage.getItem("assignments") || "[]");
          setAssignmentsBadge(assignments.length);
        } else {
          setAssignmentsBadge(0);
        }

        if (parseInt(lastEventPosted) > parseInt(lastCheckedEvents)) {
          const events = JSON.parse(localStorage.getItem("clubEvents") || "[]");
          setEventsBadge(events.length);
        } else {
          setEventsBadge(0);
        }
      };

      checkNotifications();
      const interval = setInterval(checkNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [role]);

  const items = role === 'student' ? studentItems : teacherItems;

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user');
    navigate('/');
  };

  const getBadge = (title: string) => {
    if (role === "student") {
      if (title === "Assignments") return assignmentsBadge;
      if (title === "Club Events") return eventsBadge;
    }
    return undefined;
  };

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <div className="p-6">
          <h2 className="text-xl font-bold text-sidebar-foreground">EduGrade</h2>
          <p className="text-sm text-sidebar-foreground/70 capitalize">{role} Portal</p>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                      badge={getBadge(item.title)}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <SidebarMenuButton onClick={handleLogout} className="w-full text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" />
            {open && <span>Logout</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
