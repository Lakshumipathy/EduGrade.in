import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useState, useEffect } from "react";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  postedDate: string;
}

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("assignments");
    if (stored) {
      setAssignments(JSON.parse(stored));
    }
    localStorage.setItem("lastCheckedAssignments", Date.now().toString());
  }, []);

  return (
    <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Assignments</h2>
          <p className="text-muted-foreground">View assignments posted by teachers</p>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No assignments posted yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>{assignment.subject}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-foreground">{assignment.description}</p>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Due: {assignment.dueDate}</span>
                    <span>Posted: {assignment.postedDate}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}
