import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Role = "student" | "teacher";
type Mode = "login" | "register";

const API_BASE = "http://localhost:4001/api";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<Role>("student");
  const [mode, setMode] = useState<Mode>("login");

  const [studentRegNo, setStudentRegNo] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentConfirm, setStudentConfirm] = useState("");

  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherConfirm, setTeacherConfirm] = useState("");

  const [loading, setLoading] = useState(false);

  const resetPasswords = () => {
    setStudentPassword("");
    setStudentConfirm("");
    setTeacherPassword("");
    setTeacherConfirm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      let url = "";
      let body: any = {};

      if (role === "student" && mode === "register") {
        if (studentPassword !== studentConfirm) {
          toast({
            title: "Password mismatch",
            description: "Passwords do not match",
            variant: "destructive",
          });
          return;
        }
        url = `${API_BASE}/auth/student/register`;
        body = {
          regNo: studentRegNo.trim(),
          email: studentEmail.trim(),
          password: studentPassword,
        };
      }

      if (role === "student" && mode === "login") {
        url = `${API_BASE}/auth/student/login`;
        body = {
          regNo: studentRegNo.trim(),
          password: studentPassword,
        };
      }

      if (role === "teacher" && mode === "register") {
        if (teacherPassword !== teacherConfirm) {
          toast({
            title: "Password mismatch",
            description: "Passwords do not match",
            variant: "destructive",
          });
          return;
        }
        url = `${API_BASE}/auth/teacher/register`;
        body = {
          name: teacherName.trim(),
          email: teacherEmail.trim(),
          password: teacherPassword,
        };
      }

      if (role === "teacher" && mode === "login") {
        url = `${API_BASE}/auth/teacher/login`;
        body = {
          email: teacherEmail.trim(),
          password: teacherPassword,
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok && res.status >= 500) {
        throw new Error("Backend server is not running. Please start the server.");
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend server is not responding properly. Please check server status.");
      }

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Request failed");
      }

      if (mode === "register") {
        toast({
          title: "Account created",
          description: "You can now log in.",
        });
        resetPasswords();
        setMode("login");
        return;
      }

      if (role === "student") {
        // UPDATE AUTH CONTEXT
        login("student", json.regNo);

        localStorage.setItem(
          "user",
          JSON.stringify({
            role: "student",
            regNo: json.regNo,
            email: json.email,
          })
        );

        navigate("/student/dashboard");
      }
 else {
        localStorage.setItem(
          "user",
          JSON.stringify({
            role: "teacher",
            email: json.email,
            name: json.name || "",
          })
        );
        navigate("/teacher/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStudent = role === "student";
  const isLogin = mode === "login";

return (
  <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-cyan-800 flex flex-col items-center p-6">

    {/* ---------- LOGO + TITLE SECTION ---------- */}
    <div
      className="flex flex-col items-center mt-10 text-center text-white space-y-4 animate-fadeInSlow"
    >
      {/* Logo circle with cyan glow */}
      <div className="h-28 w-28 rounded-full flex items-center justify-center shadow-xl backdrop-blur-xl bg-cyan-300/20 border border-cyan-200/30 animate-glow">
        <span className="text-5xl">🎓</span>
      </div>

      {/* Title */}
      <h1 className="text-5xl font-extrabold tracking-wide drop-shadow-2xl animate-slideUp">
        EduGrade
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-cyan-100 opacity-95 leading-tight max-w-xs animate-slideUp">
        Smart Academic Performance System 
        <br /> for Students &amp; Teachers
      </p>
    </div>

    {/* Divider Line */}
    <div className="mt-6 w-40 h-[2px] bg-white/20 rounded-full animate-fadeInSlow"></div>

    {/* ---------- LOGIN CARD BELOW ---------- */}
    <div className="w-full max-w-lg mt-10 animate-slideUp">
      <Card className="shadow-2xl border border-gray-200 rounded-2xl bg-white/95 backdrop-blur-xl">
        <CardHeader className="text-center space-y-3">

          <CardTitle className="text-3xl font-bold text-gray-900">
            {mode === "login" ? "Welcome Back" : "Create an Account"}
          </CardTitle>

          <CardDescription className="text-gray-600">
            {role === "student"
              ? "Access the student portal using your register number"
              : "Access the teacher portal using your email"}
          </CardDescription>

          {/* Role Switch */}
          <div className="flex justify-center mt-4">
            <div className="flex bg-gray-100 p-1 rounded-full shadow-inner">
              {["student", "teacher"].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r as Role);
                    setMode("login");
                  }}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    role === r
                      ? "bg-cyan-600 text-white shadow"
                      : "text-gray-600 hover:text-cyan-600"
                  }`}
                >
                  {r === "student" ? "Student" : "Teacher"}
                </button>
              ))}
            </div>
          </div>

          {/* Login/Register Switch */}
          <div className="flex justify-center mt-3">
            <div className="flex bg-gray-100 p-1 rounded-full shadow-inner">
              {["login", "register"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m as Mode)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    mode === m
                      ? "bg-cyan-600 text-white shadow"
                      : "text-gray-600 hover:text-cyan-600"
                  }`}
                >
                  {m === "login" ? "Login" : "Register"}
                </button>
              ))}
            </div>
          </div>

        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* STUDENT FORM */}
            {role === "student" && (
              <>
                <div className="space-y-2">
                  <Label>Register Number</Label>
                  <Input
                    
                    value={studentRegNo}
                    onChange={(e) => setStudentRegNo(e.target.value)}
                    required
                  />
                </div>

                {mode === "register" && (
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    required
                  />
                </div>

                {mode === "register" && (
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={studentConfirm}
                      onChange={(e) => setStudentConfirm(e.target.value)}
                      required
                    />
                  </div>
                )}
              </>
            )}

            {/* TEACHER FORM */}
            {role === "teacher" && (
              <>
                {mode === "register" && (
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Your full name"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@college.edu"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    required
                  />
                </div>

                {mode === "register" && (
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={teacherConfirm}
                      onChange={(e) => setTeacherConfirm(e.target.value)}
                      required
                    />
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full py-5 text-lg bg-cyan-600 hover:bg-cyan-700 text-white shadow-xl rounded-xl"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? `Login as ${role === "student" ? "Student" : "Teacher"}`
                : `Register as ${role === "student" ? "Student" : "Teacher"}`}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  </div>
);

}