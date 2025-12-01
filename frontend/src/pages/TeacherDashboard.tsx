import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, CheckCircle, Users, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  message: string;
  timestamp: string;
  type: 'dataset' | 'assignment' | 'event';
}

export default function TeacherDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const { toast } = useToast();

  const [selectedSemester, setSelectedSemester] = useState("");

  const BACKEND_BASE = "https://edugrade-in.onrender.com";

  useEffect(() => {
    const stored = localStorage.getItem("teacherActivities");
    if (stored) {
      const activities = JSON.parse(stored) as Activity[];
      setRecentActivities(
        activities
          .slice(0, 5)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      );
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return toast({
        title: "No File Selected",
        description: "Please choose a dataset file.",
        variant: "destructive",
      });
    }

    if (!selectedSemester) {
      return toast({
        title: "Semester Required",
        description: "Please enter the semester of this dataset.",
        variant: "destructive",
      });
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("datasetName", file.name);
      formData.append("uploadedBy", "Teacher");
      formData.append("semester", selectedSemester);

      const res = await fetch(`${BACKEND_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Upload failed");
      }

      toast({
        title: "Dataset uploaded successfully!",
        description: `Students can now view their performance data.`,
      });

      const timestamp = new Date().toISOString();
      const activity: Activity = {
        id: Date.now().toString(),
        message: `Dataset "${file.name}" uploaded`,
        timestamp,
        type: "dataset",
      };

      const activities = JSON.parse(localStorage.getItem("teacherActivities") || "[]") as Activity[];
      activities.unshift(activity);
      localStorage.setItem("teacherActivities", JSON.stringify(activities));
      setRecentActivities(activities.slice(0, 5));

      setFile(null);
      setSelectedSemester("");

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error?.message || "Could not upload dataset. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const stats = [
    { label: "Total Students", value: "62", icon: Users, color: "text-primary" },
    { label: "Active Datasets", value: "1", icon: FileText, color: "text-success" },
    { label: "Pending Reviews", value: "0", icon: CheckCircle, color: "text-warning" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">Teacher Dashboard</h2>
          <p className="text-lg text-slate-600">Manage student performance data and analytics</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${
                  index === 0 ? 'bg-blue-100 text-blue-600' :
                  index === 1 ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Upload className="h-7 w-7 text-white" />
              </div>
              Upload Student Performance Data
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">Upload CSV or Excel files containing student performance data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* ⭐ NEW: Semester Input (Minimal, UI unchanged) */}
           <Input 
  placeholder="Enter semester"
  value={selectedSemester}
  onChange={(e) => setSelectedSemester(e.target.value)}
  className="mt-4 max-w-xs"
/>


            <div className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-10 text-center hover:border-purple-500 transition-all duration-300 shadow-inner">
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="max-w-xs mx-auto border-purple-200 focus:border-purple-500"
              />
              {file && (
                <p className="mt-4 text-purple-700 font-medium">Selected: {file.name}</p>
              )}
            </div>

            <Button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl rounded-xl"
            >
              {uploading ? "Uploading..." : "Upload Dataset"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Upload className="h-6 w-6 text-white" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-4 p-4 rounded-xl shadow-sm ${
                      activity.type === "dataset"
                        ? "bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500"
                        : activity.type === "assignment"
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500"
                        : "bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        activity.type === "dataset"
                          ? "bg-green-500"
                          : activity.type === "assignment"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{activity.message}</p>
                      <p className="text-slate-600">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 text-lg">No recent activities</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
