import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  club: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export default function TeacherEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState("");
  const [club, setClub] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("clubEvents");
    if (stored) {
      setEvents(JSON.parse(stored));
    }
  }, []);

  const handlePost = () => {
    if (!title || !club || !date || !time || !location) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      title,
      club,
      date,
      time,
      location,
      description,
    };

    const updated = [...events, newEvent];
    setEvents(updated);
    localStorage.setItem("clubEvents", JSON.stringify(updated));
    localStorage.setItem("lastEventPosted", Date.now().toString());

    // Add to teacher recent activities
    const activity = {
      id: Date.now().toString(),
      message: `Event posted: ${title}`,
      timestamp: new Date().toISOString(),
      type: 'event'
    };
    const activities = JSON.parse(localStorage.getItem('teacherActivities') || '[]');
    activities.unshift(activity);
    localStorage.setItem('teacherActivities', JSON.stringify(activities));

    setTitle("");
    setClub("");
    setDate("");
    setTime("");
    setLocation("");
    setDescription("");

    toast({
      title: "Success",
      description: "Event posted successfully",
    });
  };

  const handleDelete = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    localStorage.setItem("clubEvents", JSON.stringify(updated));
    toast({
      title: "Deleted",
      description: "Event removed",
    });
  };

  return (
    <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Club Events</h2>
          <p className="text-muted-foreground">Post and manage club activities</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post New Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Science Club Meeting"
                />
              </div>
              <div>
                <Label htmlFor="club">Club Name</Label>
                <Input
                  id="club"
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                  placeholder="e.g., Science Club"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Lab 101"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event details..."
                rows={3}
              />
            </div>
            <Button onClick={handlePost} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Post Event
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Posted Events</h3>
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No events posted yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{event.club}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p className="text-foreground"><strong>Date:</strong> {event.date}</p>
                      <p className="text-foreground"><strong>Time:</strong> {event.time}</p>
                      <p className="text-foreground"><strong>Location:</strong> {event.location}</p>
                      {event.description && (
                        <p className="text-muted-foreground mt-2">{event.description}</p>
                      )}
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
