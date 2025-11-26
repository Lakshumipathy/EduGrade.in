import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Bell, TrendingUp, FileText, Calendar, Trophy, BookOpen, Clock, Target, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<{ type: string; count: number }[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkNotifications = () => {
      const lastCheckedAssignments = localStorage.getItem("lastCheckedAssignments") || "0";
      const lastCheckedEvents = localStorage.getItem("lastCheckedEvents") || "0";
      const lastCheckedDataset = localStorage.getItem("lastCheckedDataset") || "0";
      const lastAssignmentPosted = localStorage.getItem("lastAssignmentPosted") || "0";
      const lastEventPosted = localStorage.getItem("lastEventPosted") || "0";
      const lastDatasetUploaded = localStorage.getItem("lastDatasetUploaded") || "0";

      const newNotifications = [];
      
      if (parseInt(lastAssignmentPosted) > parseInt(lastCheckedAssignments)) {
        const assignments = JSON.parse(localStorage.getItem("assignments") || "[]");
        if (assignments.length > 0) {
          newNotifications.push({ type: "assignments", count: assignments.length });
        }
      }

      if (parseInt(lastEventPosted) > parseInt(lastCheckedEvents)) {
        const events = JSON.parse(localStorage.getItem("clubEvents") || "[]");
        if (events.length > 0) {
          newNotifications.push({ type: "events", count: events.length });
        }
      }

      if (parseInt(lastDatasetUploaded) > parseInt(lastCheckedDataset)) {
        const datasetUploaded = localStorage.getItem("datasetUploaded");
        if (datasetUploaded === "true") {
          newNotifications.push({ type: "dataset", count: 1 });
        }
      }

      setNotifications(newNotifications);
    };

    checkNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {notifications.length > 0 && (
          <Alert className="border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl">
            <Bell className="h-5 w-5 text-white" />
            <AlertTitle className="text-white font-semibold">New Updates Available!</AlertTitle>
            <AlertDescription className="space-y-1 text-blue-100">
              {notifications.map((notif, idx) => (
                <div key={idx}>
                  {notif.type === "assignments" && (
                    <Link to="/student/assignments" className="text-white hover:text-blue-200 block font-medium">
                      {notif.count} new assignment{notif.count > 1 ? "s" : ""} posted
                    </Link>
                  )}
                  {notif.type === "events" && (
                    <Link to="/student/events" className="text-white hover:text-blue-200 block font-medium">
                      {notif.count} new event{notif.count > 1 ? "s" : ""} posted
                    </Link>
                  )}
                  {notif.type === "dataset" && (
                    <Link to="/student/performance" className="text-white hover:text-blue-200 block font-medium">
                      Check Your Performance 
                    </Link>
                  )}
                </div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome Back!</CardTitle>
                <CardDescription className="text-lg text-slate-600">
                  Your academic dashboard is ready to help you succeed
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-6 text-lg">
              Track your academic progress, manage assignments, and explore opportunities for growth.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <p className="font-semibold text-blue-800">Performance</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <p className="font-semibold text-green-800">Goals</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <Award className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <p className="font-semibold text-purple-800">Achievements</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <p className="font-semibold text-orange-800">Schedule</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">Quick Actions</CardTitle>
            <CardDescription className="text-lg text-slate-600">Access your most used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/student/performance">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-3 border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  <TrendingUp className="h-8 w-8" />
                  <span className="font-semibold">View Performance</span>
                </Button>
              </Link>
              <Link to="/student/assignments">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-3 border-0 bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  <FileText className="h-8 w-8" />
                  <span className="font-semibold">Assignments</span>
                </Button>
              </Link>
              <Link to="/student/achievements">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-3 border-0 bg-gradient-to-br from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Trophy className="h-8 w-8" />
                  <span className="font-semibold">Achievements</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Academic Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-500 shadow-sm">
                  <div>
                    <p className="font-semibold text-blue-900">Performance Review</p>
                    <p className="text-blue-700">Check your latest grades</p>
                  </div>
                  <Badge className="bg-blue-500 text-white">New</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-l-4 border-green-500 shadow-sm">
                  <div>
                    <p className="font-semibold text-green-900">Club Events</p>
                    <p className="text-green-700">Upcoming activities</p>
                  </div>
                  <Badge variant="outline" className="border-green-500 text-green-700">3 Events</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-l-4 border-purple-500 shadow-sm">
                  <div>
                    <p className="font-semibold text-purple-900">Research Projects</p>
                    <p className="text-purple-700">Track your submissions</p>
                  </div>
                  <Badge variant="outline" className="border-purple-500 text-purple-700">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                Study Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-500 shadow-sm">
                  <p className="font-semibold text-blue-900">📚 Daily Study</p>
                  <p className="text-blue-700">Maintain consistent study hours for better retention</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-l-4 border-green-500 shadow-sm">
                  <p className="font-semibold text-green-900">🎯 Set Goals</p>
                  <p className="text-green-700">Break down large tasks into smaller, manageable goals</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-l-4 border-purple-500 shadow-sm">
                  <p className="font-semibold text-purple-900">🤝 Collaborate</p>
                  <p className="text-purple-700">Join study groups and participate in discussions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
