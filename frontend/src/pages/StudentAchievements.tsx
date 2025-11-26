import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { Trophy, Upload, ExternalLink, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentAchievements() {
  const [type, setType] = useState<'inter-college' | 'external'>('inter-college');
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const { toast } = useToast();
  const { userId } = useAuth();
  const [myAchievements, setMyAchievements] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ---------------------- LOAD SUBMISSIONS ----------------------- */
  const loadMyAchievements = async () => {
    if (!userId || userId === "null") {
      console.warn("UserId missing. Cannot fetch submissions.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/student/achievements/${userId}`);
      const json = await res.json();

      if (json.achievements) {
        setMyAchievements(json.achievements);
      }
    } catch (err) {
      console.error("Error loading achievements:", err);
    }
  };

  useEffect(() => {
    loadMyAchievements();
  }, [userId]);

  /* ---------------------- EDIT & DELETE ----------------------- */
  const handleEdit = (achievement: any) => {
    setEditingId(achievement.id);
    setType(achievement.type);
    setDate(achievement.date);
    setContent(achievement.content);
    setLocation(achievement.location);
    setUniversityName(achievement.university_name || "");
    // Note: file cannot be pre-filled
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;
    
    try {
      const res = await fetch(`http://localhost:4000/api/student/achievement/${id}`, {
        method: "DELETE"
      });
      
      if (!res.ok) throw new Error("Failed to delete");
      
      toast({ title: "Success", description: "Achievement deleted successfully" });
      await loadMyAchievements();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete achievement", variant: "destructive" });
    }
  };

  /* ---------------------- SUBMIT ACHIEVEMENT ----------------------- */
  const handleSubmit = async () => {
    console.log("DEBUG userId = ", userId);

    if (!userId || userId === "null") {
      toast({
        title: "Error",
        description: "Your account data is missing. Please logout and login again.",
        variant: "destructive",
      });
      return;
    }

    if (!date || !content || !location || !file) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (type === "external" && !universityName) {
      toast({
        title: "Error",
        description: "Please enter university name",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("regNo", userId);
    formData.append("type", type);
    formData.append("date", date);
    formData.append("content", content);
    formData.append("location", location);
    if (type === "external") formData.append("universityName", universityName);
    formData.append("file", file);

    try {
      const url = editingId 
        ? `http://localhost:4000/api/student/achievement/${editingId}`
        : "http://localhost:4000/api/student/achievement";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast({ title: "Success", description: json.message });

      // Reset form
      setDate("");
      setContent("");
      setLocation("");
      setUniversityName("");
      setFile(null);
      setType("inter-college");
      setEditingId(null);

      // Reload list
      await loadMyAchievements();

    } catch (err: any) {
      console.error("Error submitting achievement:", err);
      toast({
        title: "Error",
        description: "Failed to submit achievement",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">

      {/* --------------------------- FORM --------------------------- */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Submit Achievement</h2>
        <p className="text-muted-foreground">Record your academic and extracurricular achievements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            Achievement Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">Participation Type</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as 'inter-college' | 'external')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inter-college" id="inter" />
                <Label htmlFor="inter" className="font-normal cursor-pointer">Inter-College Participation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="external" id="external" />
                <Label htmlFor="external" className="font-normal cursor-pointer">External Participation</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Date of Participation *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <Label>Achievement Content *</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your achievement"
              rows={3}
            />
          </div>

          <div>
            <Label>Location *</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Sports Complex"
            />
          </div>

          {type === "external" && (
            <div>
              <Label>University Name *</Label>
              <Input
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="XYZ University"
              />
            </div>
          )}

          <div>
            <Label>Upload Certificate *</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png" />
            {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            {editingId ? "Update Achievement" : "Submit Achievement"}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={() => {
              setEditingId(null);
              setDate("");
              setContent("");
              setLocation("");
              setUniversityName("");
              setFile(null);
              setType("inter-college");
            }} className="w-full">
              Cancel Edit
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ----------------------- MY SUBMISSIONS ----------------------- */}
      <div className="space-y-4 mt-10">
        <h3 className="text-2xl font-semibold">My Submissions</h3>
        <p className="text-muted-foreground">Review your submitted achievements</p>

        {myAchievements.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No achievements submitted yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {myAchievements.map((a) => (
              <Card key={a.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-warning" />
                      <div>
                        <CardTitle className="text-lg">{a.content}</CardTitle>
                        <p className="text-sm text-muted-foreground">Type: {a.type}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 text-sm">
                  <p><strong>Date:</strong> {a.date}</p>
                  <p><strong>Location:</strong> {a.location}</p>

                  {a.university_name && (
                    <p><strong>University:</strong> {a.university_name}</p>
                  )}

                  <p><strong>Submitted:</strong> {a.created_at?.split("T")[0]}</p>

                  <a href={a.file_name} target="_blank" className="flex items-center gap-2 text-primary underline">
                    <ExternalLink className="h-4 w-4" />
                    View Certificate
                  </a>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(a)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
