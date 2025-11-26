import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import DashboardLayout from "@/components/DashboardLayout";

import Login from "./pages/Login";

import StudentDashboard from "./pages/StudentDashboard";
import StudentPerformance from "./pages/StudentPerformance";
import StudentAssignments from "./pages/StudentAssignments";
import StudentEvents from "./pages/StudentEvents";
import StudentAchievements from "./pages/StudentAchievements";
import StudentResearchInternship from "./pages/StudentResearchInternship";

import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherAssignments from "./pages/TeacherAssignments";
import TeacherEvents from "./pages/TeacherEvents";
import TeacherAchievements from "./pages/TeacherAchievements";
import TeacherResearchInternship from "./pages/TeacherResearchInternship";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>

            {/* LOGIN PAGE — NO SIDEBAR */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

            {/* ALL STUDENT + TEACHER PAGES WITH SIDEBAR */}
            <Route element={<DashboardLayout><Outlet /></DashboardLayout>}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/performance" element={<StudentPerformance />} />
              <Route path="/student/assignments" element={<StudentAssignments />} />
              <Route path="/student/events" element={<StudentEvents />} />
              <Route path="/student/achievements" element={<StudentAchievements />} />
              <Route path="/student/research-internship" element={<StudentResearchInternship />} />

              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/assignments" element={<TeacherAssignments />} />
              <Route path="/teacher/events" element={<TeacherEvents />} />
              <Route path="/teacher/achievements" element={<TeacherAchievements />} />
              <Route path="/teacher/research-internship" element={<TeacherResearchInternship />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
