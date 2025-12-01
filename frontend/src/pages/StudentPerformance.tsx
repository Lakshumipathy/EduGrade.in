
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

type AchievementMonthStat = {
  month: string;
  count: number;
};

type ResearchInternshipMonthStat = {
  month: string;
  researchCount: number;
  internshipCount: number;
};

// ------------------ AI Summary Helpers ------------------

function getAchievementGrade(total: number): string {
  if (total >= 8) return "A";
  if (total >= 5) return "B";
  if (total >= 2) return "C";
  return "D";
}

function getAchievementReview(total: number): string {
  if (total >= 8)
    return "You have an excellent achievement record this year with consistent participation.";
  if (total >= 5)
    return "You have a very good achievement record. Keep participating regularly!";
  if (total >= 2)
    return "You have some achievements. Try participating in more events.";
  if (total === 1)
    return "Good start with one achievement. Try exploring more opportunities.";
  return "No achievements recorded yet. Start with small events or competitions.";
}

function getContributionGrade(total: number): string {
  if (total >= 4) return "A";
  if (total === 3) return "B";
  if (total >= 1) return "C";
  return "D";
}

function getContributionReview(
  totalResearch: number,
  totalInternship: number
): string {
  const total = totalResearch + totalInternship;

  if (total >= 4)
    return "You have a strong profile with multiple research/internship experiences.";
  if (total === 3)
    return "Good profile. Add one more activity to strengthen it.";
  if (total === 2)
    return "You are building your profile. Try adding more activities.";
  if (total === 1)
    return "You have one activity. Try doing one more for balance.";
  return "No submissions yet. Start with a mini research or internship.";
}

// ------------------ MAIN COMPONENT ------------------

export default function StudentPerformance() {
  const { toast } = useToast();
  const navigate = useNavigate();

 const BACKEND_URL = "https://edugrade-in.onrender.com/api/student/performance";


  const [regNo, setRegNo] = useState("");
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(stored);

    if (user.role !== "student") {
      navigate("/login");
      return;
    }

    setRegNo(user.regNo); // Auto-fill student reg no
  }, [navigate]);

  // ------------------ VERIFY PERFORMANCE ------------------

  const handleVerify = async () => {
    if (!regNo || !semester) {
      return toast({
        title: "Missing Details",
        description: "Please enter both Registration Number and Semester",
        variant: "destructive",
      });
    }

    setLoading(true);

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regNo, semester }),
      });

      if (!res.ok) {
        if (res.status === 0 || res.type === 'opaque') {
          throw new Error("Backend server is not running on port 4000");
        }
        throw new Error(`Server error: ${res.status}`);
      }

      const json = await res.json();
      setData(json);
      
      await fetchAchievementContribution(achievementYear);
      await fetchResearchInternshipContribution(contribYear);
      toast({
        title: "Performance Loaded",
        description: "Student performance data fetched successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ------------------ CONTRIBUTION API FUNCTIONS ------------------

  const [achievementYear, setAchievementYear] = useState(
    new Date().getFullYear().toString()
  );
  const [achievementStats, setAchievementStats] = useState<
    AchievementMonthStat[] | null
  >(null);
  const [achievementLoading, setAchievementLoading] = useState(false);

  const fetchAchievementContribution = async (year: string) => {
    if (!regNo) return;

    try {
      setAchievementLoading(true);

      const res = await fetch(
        `https://edugrade-in.onrender.com/api/contributions/achievements?regNo=${regNo}&year=${year}`
      );
      const json = await res.json();

      if (!res.ok) throw new Error(json.error);

      setAchievementStats(json.monthly || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setAchievementLoading(false);
    }
  };

  const [contribYear, setContribYear] = useState(
    new Date().getFullYear().toString()
  );
  const [contribStats, setContribStats] = useState<
    ResearchInternshipMonthStat[] | null
  >(null);
  const [contribLoading, setContribLoading] = useState(false);

  const fetchResearchInternshipContribution = async (year: string) => {
    if (!regNo) return;

    try {
      setContribLoading(true);

      const res = await fetch(
        `https://edugrade-in.onrender.com/api/contributions/research-internship?regNo=${regNo}&year=${year}`

      );
      const json = await res.json();

      if (!res.ok) throw new Error(json.error);

      setContribStats(json.monthly || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setContribLoading(false);
    }
  };

  // ------------------ UI (UNCHANGED) ------------------
  // ⭐ I am not modifying ANY UI — only backend URL fixes above.
  // ⭐ Your entire UI remains exactly the same.

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-2">
          <Button variant="outline" size="icon" onClick={() => window.history.back()} className="shadow-lg hover:shadow-xl transition-all duration-300">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Student Performance System</h2>
        </div>

        {/* ------------------ INPUT FORM ------------------ */}
        {!data && (
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-800">View Performance Data</CardTitle>
              <CardDescription className="text-lg text-slate-600">
                Enter your registration number and semester to view internal marks.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Registration Number</label>
                <Input value={regNo} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Semester</label>
                <Input
                  placeholder="Enter semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <Button className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl rounded-xl" disabled={loading} onClick={handleVerify}>
                {loading ? "Loading..." : " View Performance"}
              </Button>
            </CardContent>
          </Card>
        )}

      {/* ------------------ PERFORMANCE DATA ------------------ */}
      {data && (
        <>
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                 Student Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md">
                <p className="text-sm font-medium text-blue-700 mb-1">NAME</p>
                <p className="font-bold text-blue-900">{data.student.name}</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-md">
                <p className="text-sm font-medium text-green-700 mb-1">REG NO</p>
                <p className="font-bold text-green-900">{data.student.reg_no}</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-md">
                <p className="text-sm font-medium text-purple-700 mb-1">SEMESTER</p>
                <p className="font-bold text-purple-900">{data.student.semester}</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-md">
                <p className="text-sm font-medium text-orange-700 mb-1">PERCENTAGE</p>
                <p className="text-2xl font-bold text-orange-900">{data.overallPercentage}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                 Subject Performance Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-100 to-slate-200">
                      <TableHead className="font-bold text-slate-700">Subject Code</TableHead>
                      <TableHead className="font-bold text-slate-700">Subject Name</TableHead>
                      <TableHead className="font-bold text-slate-700">Marks</TableHead>
                      <TableHead className="font-bold text-slate-700">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.subjects.map((subject: any, i: number) => (
                      <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-mono text-sm bg-gray-100 font-medium">{subject.code}</TableCell>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell className="text-lg font-bold">{subject.total}/50</TableCell>
                        <TableCell>
                          <Badge variant={subject.status === 'Strong' ? 'success' : 'destructive'} className="px-3 py-1">
                            {subject.status === 'Strong' ? ' Strong' : ' Weak'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-indigo-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                Performance Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl p-4">
                <ResponsiveContainer>
                  <LineChart data={data.subjects}>
                    <XAxis 
                      dataKey="code" 
                      tick={{ fontSize: 12, fill: '#374151' }}
                      axisLine={{ stroke: '#6366f1' }}
                    />
                    <YAxis 
                      domain={[0, 50]} 
                      tick={{ fontSize: 12, fill: '#374151' }}
                      axisLine={{ stroke: '#6366f1' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#f1f5f9',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* AI Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle> Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const strongSubjects = data.subjects.filter((s: any) => s.status === 'Strong');
                const weakSubjects = data.subjects.filter((s: any) => s.status === 'Weak');
                const totalSubjects = data.subjects.length;
                
                const getPerformanceAnalysis = () => {
                  if (weakSubjects.length === 0) {
                    return {
                      type: 'excellent',
                      title: '🌟 Excellent Performance!',
                      message: `Outstanding work! You've achieved strong performance in all ${totalSubjects} subjects with an overall ${data.overallPercentage}% average. You're demonstrating consistent excellence across your curriculum.`,
                      bgColor: 'bg-green-50',
                      borderColor: 'border-green-200',
                      textColor: 'text-green-700'
                    };
                  } else if (strongSubjects.length > weakSubjects.length) {
                    return {
                      type: 'good',
                      title: ' Strong Overall Performance',
                      message: `Great job! You're performing well in ${strongSubjects.length} out of ${totalSubjects} subjects (${data.overallPercentage}% overall). Focus on improving the ${weakSubjects.length} subject${weakSubjects.length > 1 ? 's' : ''} that need attention.`,
                      bgColor: 'bg-blue-50',
                      borderColor: 'border-blue-200',
                      textColor: 'text-blue-700'
                    };
                  } else if (strongSubjects.length === weakSubjects.length) {
                    return {
                      type: 'balanced',
                      title: ' Balanced Performance',
                      message: `You have a balanced performance with ${strongSubjects.length} strong and ${weakSubjects.length} weak subjects (${data.overallPercentage}% overall). Focus on bringing up the weaker areas to achieve consistent excellence.`,
                      bgColor: 'bg-yellow-50',
                      borderColor: 'border-yellow-200',
                      textColor: 'text-yellow-700'
                    };
                  } else {
                    return {
                      type: 'needs-improvement',
                      title: '⚠️ Needs Focused Improvement',
                      message: `You have ${weakSubjects.length} subjects needing improvement compared to ${strongSubjects.length} strong subjects (${data.overallPercentage}% overall). With dedicated effort, you can significantly improve your performance.`,
                      bgColor: 'bg-red-50',
                      borderColor: 'border-red-200',
                      textColor: 'text-red-700'
                    };
                  }
                };
                
                const analysis = getPerformanceAnalysis();
                
                return (
                  <>
                    <div className={`${analysis.bgColor} border ${analysis.borderColor} p-4 rounded-lg mb-4`}>
                      <h3 className={`text-lg font-semibold ${analysis.textColor}`}>{analysis.title}</h3>
                      <p className={analysis.textColor}>{analysis.message}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 bg-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">{strongSubjects.length}</div>
                        <div className="text-sm text-green-600">Strong Subjects</div>
                      </div>
                      <div className="text-center p-3 bg-red-100 rounded-lg">
                        <div className="text-2xl font-bold text-red-700">{weakSubjects.length}</div>
                        <div className="text-sm text-red-600">Weak Subjects</div>
                      </div>
                    </div>
                    
                    {strongSubjects.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold text-green-700 mb-2">✅ Strong Subjects:</p>
                        <p className="text-green-600">{strongSubjects.map((s: any) => s.name).join(', ')}</p>
                      </div>
                    )}
                    
                    {weakSubjects.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold text-red-700 mb-2">📈 Subjects Needing Improvement:</p>
                        <p className="text-red-600">{weakSubjects.map((s: any) => s.name).join(', ')}</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>

          {/* Improvement Plan - Only show if there are weak subjects */}
          {data.improvementPlan && data.improvementPlan.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle> Personalized Improvement Plan</CardTitle>
                <CardDescription>Targeted strategies to improve your weak subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Suggested Plan</TableHead>
                      <TableHead>Resources</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.improvementPlan.map((plan: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{plan.subjectCode}</span>
                            <br />
                            <span className="font-medium">{plan.subjectName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">{plan.plan}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {plan.links?.map((link: any, j: number) => (
                              <a key={j} href={link.url} target="_blank" className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                                {link.label}
                              </a>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Success Celebration - Only show if no weak subjects */}
          {data.subjects.filter((s: any) => s.status === 'Weak').length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle> Congratulations!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-xl font-bold text-green-700 mb-2">Perfect Performance!</h3>
                  <p className="text-green-600 mb-4">
                    You've achieved strong performance in all subjects. This demonstrates excellent understanding and consistent effort across your curriculum.
                  </p>
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="bg-white px-4 py-2 rounded-lg shadow">
                      <div className="font-bold text-green-700">{data.overallPercentage}%</div>
                      <div className="text-gray-600">Overall Score</div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow">
                      <div className="font-bold text-blue-700">{data.subjects.length}/{data.subjects.length}</div>
                      <div className="text-gray-600">Strong Subjects</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievement Contribution */}
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle>Achievement Contribution</CardTitle>
      <CardDescription>Non-academic performance based on achievements</CardDescription>
    </div>

    <Select
      value={achievementYear}
      onValueChange={(v) => {
        setAchievementYear(v);
        fetchAchievementContribution(v);
      }}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i).map(
          (year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  </CardHeader>

  <CardContent>
    {/* Loading */}
    {achievementLoading && (
      <p className="text-muted-foreground">Loading achievements...</p>
    )}

    {/* No Data */}
    {!achievementLoading &&
      (!achievementStats || achievementStats.every((m) => m.count === 0)) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-semibold text-blue-800">
            No achievements recorded yet for this year.
          </p>
          <p className="text-sm text-blue-700">
            Start participating in events, hackathons, or competitions.
          </p>
        </div>
      )}

    {/* Data Available */}
    {!achievementLoading &&
      achievementStats &&
      achievementStats.some((m) => m.count > 0) && (
        <>
          {/* Enhanced Bar Chart */}
          <div className="h-80 w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
            <ResponsiveContainer>
              <BarChart data={achievementStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="achievementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#1e40af" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#374151' }}
                  axisLine={{ stroke: '#9ca3af' }}
                />
                <YAxis 
                  domain={[0, 'dataMax + 1']}
                  tick={{ fontSize: 12, fill: '#374151' }}
                  axisLine={{ stroke: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#achievementGradient)"
                  radius={[8, 8, 0, 0]}
                  stroke="#1e40af"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Processing */}
          {(() => {
            const total = achievementStats.reduce(
              (sum, m) => sum + m.count,
              0
            );

            const getStars = (t) => {
              if (t >= 8) return 5;
              if (t >= 5) return 4;
              if (t >= 2) return 3;
              if (t === 1) return 2;
              return 1;
            };

            const stars = getStars(total);

            const mostActive = achievementStats.reduce((a, b) =>
              b.count > a.count ? b : a
            );

            const aiSummary =
              stars === 5
                ? "You’ve shown excellent involvement across multiple events. Keep pushing your boundaries!"
                : stars === 4
                ? `Strong performer! Your ${total} achievements show great dedication. Consider participating in national-level competitions for greater impact.`
                : total >= 2
                ? `Good progress! You have ${total} achievement${total > 1 ? 's' : ''} under your belt. Try participating in 2-3 more events this semester to build momentum.`
                : total === 1
                ? "Great start with your first achievement! This is just the beginning - aim for 2-3 more activities this semester to build a strong profile."
                : "Ready to shine! Start with college-level competitions or hackathons. Even small participations count towards building your achievement portfolio.";

            const getAchievementStars = (t) => {
              if (t >= 8) return 5;
              if (t >= 5) return 4;
              if (t >= 2) return 3;
              if (t === 1) return 2;
              return 1;
            };

            const getAchievementReview = (t) => {
              if (t >= 8) return "You're an achievement champion with exceptional participation!\nYour dedication to excellence sets you apart from your peers.";
              if (t >= 5) return "Impressive achievement record showing consistent effort!\nKeep this momentum going to reach even greater heights.";
              if (t >= 2) return "Good foundation with solid participation in events!\nChallenge yourself with more competitions to boost your profile.";
              if (t === 1) return "Great first step into the world of achievements!\nThis is just the beginning of your success journey.";
              return "Your achievement journey awaits - take the first step!\nStart with college events to build confidence and experience.";
            };

            return (
              <div className="mt-6 space-y-4">
                {/* Achievement Stars */}
                <div className="text-2xl font-bold text-yellow-500">
                  {"⭐".repeat(getAchievementStars(total))}
                </div>

                {/* Most Active Month */}
                <div className="text-md font-semibold">
                  Most Active Month:{" "}
                  <span className="text-blue-600">
                    {mostActive.month} ({mostActive.count})
                  </span>
                </div>

                {/* Achievement Review */}
                <p className="text-sm text-muted-foreground whitespace-pre-line">{getAchievementReview(total)}</p>
              </div>
            );
          })()}
        </>
      )}
  </CardContent>
</Card>


        {/* Research & Internship Contribution */}
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle>Research & Internship Contribution</CardTitle>
      <CardDescription>Research papers and internships completed</CardDescription>
    </div>

    <Select
      value={contribYear}
      onValueChange={(v) => {
        setContribYear(v);
        fetchResearchInternshipContribution(v);
      }}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i).map(
          (year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  </CardHeader>

  <CardContent>
    {/* Loading */}
    {contribLoading && (
      <p className="text-muted-foreground">Loading contributions...</p>
    )}

    {/* No Data */}
    {!contribLoading &&
      (!contribStats ||
        contribStats.every((m) => m.researchCount + m.internshipCount === 0)) && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="font-semibold text-purple-800">
            No research or internship submissions yet.
          </p>
          <p className="text-sm text-purple-700">
            Start with a mini research project or short-term internship.
          </p>
        </div>
      )}

    {/* Data Available */}
    {!contribLoading &&
      contribStats &&
      contribStats.some(
        (m) => m.researchCount + m.internshipCount > 0
      ) && (
        <>
          {/* Enhanced Dual Bar Chart */}
          <div className="h-80 w-full bg-gradient-to-br from-purple-50 to-cyan-50 rounded-lg p-4">
            <ResponsiveContainer>
              <BarChart data={contribStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="researchGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="internshipGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#0891b2" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#374151' }}
                  axisLine={{ stroke: '#9ca3af' }}
                />
                <YAxis 
                  domain={[0, 'dataMax + 1']}
                  tick={{ fontSize: 12, fill: '#374151' }}
                  axisLine={{ stroke: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                />
                <Bar
                  dataKey="researchCount"
                  name="🔬 Research"
                  fill="url(#researchGradient)"
                  radius={[4, 4, 0, 0]}
                  stroke="#7c3aed"
                  strokeWidth={1}
                />
                <Bar
                  dataKey="internshipCount"
                  name="💼 Internship"
                  fill="url(#internshipGradient)"
                  radius={[4, 4, 0, 0]}
                  stroke="#0891b2"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Processing */}
          {(() => {
            const totalResearch = contribStats.reduce(
              (s, m) => s + m.researchCount,
              0
            );
            const totalInternship = contribStats.reduce(
              (s, m) => s + m.internshipCount,
              0
            );

            // Quality Score
            const score =
              totalResearch * 2 + totalInternship * 3;

            const starScore =
              score >= 12
                ? 5
                : score >= 8
                ? 4
                : score >= 4
                ? 3
                : score >= 1
                ? 2
                : 1;

            const getPersonalizedSummary = () => {
              if (totalResearch > 0 && totalInternship > 0) {
                return `Outstanding! You've balanced ${totalResearch} research project${totalResearch > 1 ? 's' : ''} with ${totalInternship} internship${totalInternship > 1 ? 's' : ''}. This diverse experience makes you highly competitive for both academia and industry.`;
              } else if (totalResearch > 0) {
                return `Great research focus! You've completed ${totalResearch} research project${totalResearch > 1 ? 's' : ''}. Consider adding an internship to gain industry exposure and broaden your skill set.`;
              } else if (totalInternship > 0) {
                return `Excellent industry exposure! You've completed ${totalInternship} internship${totalInternship > 1 ? 's' : ''}. Consider engaging in research projects to strengthen your academic profile.`;
              } else {
                return "Ready to start your journey! Consider beginning with either a research project under faculty guidance or applying for internships to gain practical experience.";
              }
            };

            const impactText = getPersonalizedSummary();

            const getContributionStars = (research, internship) => {
              const total = research + internship;
              if (research > 0 && internship > 0) return 5;
              if (total >= 2) return 4;
              if (total === 1) return 3;
              return 2;
            };

            const getContributionReview = (research, internship) => {
              if (research > 0 && internship > 0) {
                return "Perfect blend of academic research and industry experience!\nYou're building a well-rounded profile that stands out to employers.";
              } else if (research > 0) {
                return `Strong research foundation with ${research} project${research > 1 ? 's' : ''} completed!\nConsider adding internship experience to balance theory with practice.`;
              } else if (internship > 0) {
                return `Excellent industry exposure with ${internship} internship${internship > 1 ? 's' : ''} completed!\nResearch projects could add academic depth to your profile.`;
              } else {
                return "Your professional journey is about to begin!\nStart with research projects or internships to build valuable experience.";
              }
            };

            return (
              <div className="mt-6 space-y-4">
                {/* Contribution Stars */}
                <div className="text-2xl font-bold text-yellow-500">
                  {"⭐".repeat(getContributionStars(totalResearch, totalInternship))}
                </div>

                {/* Contribution Counts */}
                <div className="text-md font-semibold">
                  Research: <span className="text-purple-600">{totalResearch}</span> | 
                  Internships: <span className="text-cyan-600">{totalInternship}</span>
                </div>

                {/* Contribution Review */}
                <p className="text-sm text-muted-foreground whitespace-pre-line">{getContributionReview(totalResearch, totalInternship)}</p>
              </div>
            );
          })()}
        </>
      )}
  </CardContent>
</Card>

        </>
      )}
      </div>
    </div>
  );
}
