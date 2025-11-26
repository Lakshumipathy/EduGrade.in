import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  postedDate: string;
}

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("assignments");
    if (stored) {
      setAssignments(JSON.parse(stored));
    }
  }, []);

  const handlePost = () => {
    if (!title || !subject || !description || !dueDate) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title,
      subject,
      description,
      dueDate,
      postedDate: new Date().toISOString().split('T')[0],
    };

    const updated = [...assignments, newAssignment];
    setAssignments(updated);
    localStorage.setItem("assignments", JSON.stringify(updated));
    localStorage.setItem("lastAssignmentPosted", Date.now().toString());

    // Add to teacher recent activities
    const activity = {
      id: Date.now().toString(),
      message: `Assignment posted: ${title}`,
      timestamp: new Date().toISOString(),
      type: 'assignment'
    };
    const activities = JSON.parse(localStorage.getItem('teacherActivities') || '[]');
    activities.unshift(activity);
    localStorage.setItem('teacherActivities', JSON.stringify(activities));

    setTitle("");
    setSubject("");
    setDescription("");
    setDueDate("");

    toast({
      title: "Success",
      description: "Assignment posted successfully",
    });
  };

  const handleDelete = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    setAssignments(updated);
    localStorage.setItem("assignments", JSON.stringify(updated));
    toast({
      title: "Deleted",
      description: "Assignment removed",
    });
  };

  return (
    <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Assignments</h2>
          <p className="text-muted-foreground">Post and manage student assignments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post New Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Physics Lab Report"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Physics"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Assignment details and instructions..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <Button onClick={handlePost} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Post Assignment
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Posted Assignments</h3>
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No assignments posted yet
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-2">{assignment.description}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Due Date: {assignment.dueDate}</p>
                    <p>Posted: {assignment.postedDate}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
    </div>
  );
}
