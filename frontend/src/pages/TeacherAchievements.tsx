import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Trophy, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  id: string;
  student_id: string;
  type: "inter-college" | "external";
  date: string;
  content: string;
  location: string;
  university_name?: string;
  file_name: string;
  created_at: string;
}

export default function TeacherAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch("https://edugrade-in.onrender.com/api/teacher/achievements");
        const json = await res.json();

        if (json.achievements) {
          setAchievements(json.achievements);
        }
      } catch (err) {
        console.error("Error fetching achievements:", err);
      }
      setLoading(false);
    }

    fetchAchievements();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Student Achievements</h2>
        <p className="text-muted-foreground">View student achievement submissions</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading achievements...
          </CardContent>
        </Card>
      ) : achievements.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No achievements submitted yet
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {achievements.map((achievement) => (
            <Card key={achievement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-warning" />
                    <div>
                      <CardTitle className="text-lg">{achievement.content}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Student ID: {achievement.student_id}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      achievement.type === "inter-college" ? "default" : "secondary"
                    }
                  >
                    {achievement.type === "inter-college"
                      ? "Inter-College"
                      : "External"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="grid gap-2 text-sm">
                  <p>
                    <strong>Date of Participation:</strong> {achievement.date}
                  </p>
                  <p>
                    <strong>Location:</strong> {achievement.location}
                  </p>

                  {achievement.university_name && (
                    <p>
                      <strong>University:</strong> {achievement.university_name}
                    </p>
                  )}

                  <p>
                    <strong>Submitted:</strong>{" "}
                    {achievement.created_at?.split("T")[0]}
                  </p>

                  <div className="flex items-center gap-2 text-primary">
                    <ExternalLink className="h-4 w-4" />
                    <a
                      href={achievement.file_name}
                      target="_blank"
                      className="underline"
                    >
                      View File
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
