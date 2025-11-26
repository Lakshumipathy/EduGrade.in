import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Briefcase, X, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

type Status = "pending" | "approved" | "rejected";

interface BaseSubmission {
  id: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  semester: string;
  submittedDate: string;
  status: Status;
}

interface ResearchSubmission extends BaseSubmission {
  type: "research";
  researchTitle: string;
  researchDomain: string;
  publicationType: string;
  publisherName: string;
  doiLink: string;
  abstract: string;
  dateOfPublication: string;
  mentorName: string;
  organization: string;
  fileUrl?: string | null;
}

interface InternshipSubmission extends BaseSubmission {
  type: "internship";
  companyName: string;
  role: string;
  startDate: string;
  endDate: string;
  duration: string;
  internshipType: string;
  supervisorName: string;
  description: string;
  skills: string[];
  certificateUrl?: string | null;
  projectDetails?: string | null;
}

type Submission = ResearchSubmission | InternshipSubmission;

export default function StudentResearchInternship() {
  const [submissionType, setSubmissionType] = useState<"research" | "internship">(
    "research"
  );
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const { toast } = useToast();
  const { userId } = useAuth();

  // Student info
  const [studentName, setStudentName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");

  // Research form
  const [researchTitle, setResearchTitle] = useState("");
  const [researchDomain, setResearchDomain] = useState("");
  const [publicationType, setPublicationType] = useState("");
  const [publisherName, setPublisherName] = useState("");
  const [doiLink, setDoiLink] = useState("");
  const [abstract, setAbstract] = useState("");
  const [dateOfPublication, setDateOfPublication] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [organization, setOrganization] = useState("");
  const [researchFile, setResearchFile] = useState<File | null>(null);

  // Internship form
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [internshipType, setInternshipType] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [projectDetails, setProjectDetails] = useState("");

  /* ------------------------ LOAD SUBMISSIONS ------------------------ */

  useEffect(() => {
    if (userId) fetchSubmissions();
  }, [userId]);

  const fetchSubmissions = async () => {
    if (!userId) return;

    try {
      const { data: researchData, error: researchError } = await (supabase as any)
        .from("research_submissions")
        .select("*")
        .eq("student_id", userId)
        .order("submitted_date", { ascending: false });

      const { data: internshipData, error: internshipError } = await (supabase as any)
        .from("internship_submissions")
        .select("*")
        .eq("student_id", userId)
        .order("submitted_date", { ascending: false });

      if (researchError || internshipError) {
        console.error("Supabase fetch error:", researchError || internshipError);
        toast({
          title: "Error",
          description: "Failed to fetch submissions",
          variant: "destructive",
        });
        return;
      }

      const researchSubmissions: ResearchSubmission[] =
        researchData?.map((item: any) => ({
          id: item.id,
          type: "research",
          studentId: item.student_id,
          studentName: item.student_name,
          registerNumber: item.register_number,
          department: item.department,
          semester: item.semester,
          researchTitle: item.research_title,
          researchDomain: item.research_domain,
          publicationType: item.publication_type,
          publisherName: item.publisher_name,
          doiLink: item.doi_link,
          abstract: item.abstract,
          dateOfPublication: item.date_of_publication,
          mentorName: item.mentor_name,
          organization: item.organization,
          fileUrl: item.file_url,
          submittedDate: item.submitted_date,
          status: item.status as Status,
        })) || [];

      const internshipSubmissions: InternshipSubmission[] =
        internshipData?.map((item: any) => ({
          id: item.id,
          type: "internship",
          studentId: item.student_id,
          studentName: item.student_name,
          registerNumber: item.register_number,
          department: item.department,
          semester: item.semester,
          companyName: item.company_name,
          role: item.role,
          startDate: item.start_date,
          endDate: item.end_date,
          duration: item.duration,
          internshipType: item.internship_type,
          supervisorName: item.supervisor_name,
          description: item.description,
          skills: item.skills || [],
          certificateUrl: item.certificate_url,
          projectDetails: item.project_details,
          submittedDate: item.submitted_date,
          status: item.status as Status,
        })) || [];

      setSubmissions([...researchSubmissions, ...internshipSubmissions]);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    }
  };

  /* ------------------------ EDIT & DELETE ------------------------ */
  const handleEdit = (submission: Submission) => {
    setEditingSubmission(submission);
    setSubmissionType(submission.type);
    
    // Fill student info
    setStudentName(submission.studentName);
    setRegisterNumber(submission.registerNumber);
    setDepartment(submission.department);
    setSemester(submission.semester);
    
    if (submission.type === 'research') {
      const research = submission as ResearchSubmission;
      setResearchTitle(research.researchTitle);
      setResearchDomain(research.researchDomain);
      setPublicationType(research.publicationType);
      setPublisherName(research.publisherName);
      setDoiLink(research.doiLink);
      setAbstract(research.abstract);
      setDateOfPublication(research.dateOfPublication);
      setMentorName(research.mentorName);
      setOrganization(research.organization);
    } else {
      const internship = submission as InternshipSubmission;
      setCompanyName(internship.companyName);
      setRole(internship.role);
      setStartDate(internship.startDate);
      setEndDate(internship.endDate);
      setInternshipType(internship.internshipType);
      setSupervisorName(internship.supervisorName);
      setDescription(internship.description);
      setSkills(internship.skills);
      setProjectDetails(internship.projectDetails || "");
    }
  };

  const handleDelete = async (id: string, type: 'research' | 'internship') => {
    if (!confirm(`Are you sure you want to delete this ${type} submission?`)) return;
    
    try {
      const tableName = type === 'research' ? 'research_submissions' : 'internship_submissions';
      const { error } = await (supabase as any)
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Success", description: `${type} deleted successfully` });
      await fetchSubmissions();
    } catch (error) {
      toast({ title: "Error", description: `Failed to delete ${type}`, variant: "destructive" });
    }
  };

  /* ---------------------------- HELPERS ---------------------------- */

  const calculateDuration = () => {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return `${months} months ${days} days`;
  };

  const addSkill = () => {
    const val = skillsInput.trim();
    if (!val) return;
    if (!skills.includes(val)) setSkills([...skills, val]);
    setSkillsInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const validateStudentInfo = () => {
    if (!userId || userId === "null") {
      toast({
        title: "Error",
        description: "User details missing. Please login again.",
        variant: "destructive",
      });
      return false;
    }
    if (!studentName || !registerNumber || !department || !semester) {
      toast({
        title: "Error",
        description: "Please fill all student information fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  /* ------------------------ SUBMIT RESEARCH ------------------------ */

  const handleSubmitResearch = async () => {
    if (
      !validateStudentInfo() ||
      !researchTitle ||
      !researchDomain ||
      !publicationType ||
      !publisherName ||
      !doiLink ||
      !abstract ||
      !dateOfPublication ||
      !mentorName ||
      !organization
    ) {
      if (userId) {
        // validateStudentInfo already showed toast
        if (
          researchTitle &&
          researchDomain &&
          publicationType &&
          publisherName &&
          doiLink &&
          abstract &&
          dateOfPublication &&
          mentorName &&
          organization
        )
          return;
      }
      toast({
        title: "Error",
        description: "Please fill all required research fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSubmission && editingSubmission.type === 'research') {
        // Update existing research
        const { error } = await (supabase as any).from("research_submissions").update({
          student_name: studentName,
          register_number: registerNumber,
          department,
          semester,
          research_title: researchTitle,
          research_domain: researchDomain,
          publication_type: publicationType,
          publisher_name: publisherName,
          doi_link: doiLink,
          abstract,
          date_of_publication: dateOfPublication,
          mentor_name: mentorName,
          organization,
          file_url: researchFile ? researchFile.name : null,
        }).eq('id', editingSubmission.id);

        if (error) throw error;
        toast({ title: "Success", description: "Research updated successfully" });
      } else {
        // Create new research
        const { error } = await (supabase as any).from("research_submissions").insert({
          student_id: userId,
          student_name: studentName,
          register_number: registerNumber,
          department,
          semester,
          research_title: researchTitle,
          research_domain: researchDomain,
          publication_type: publicationType,
          publisher_name: publisherName,
          doi_link: doiLink,
          abstract,
          date_of_publication: dateOfPublication,
          mentor_name: mentorName,
          organization,
          file_url: researchFile ? researchFile.name : null,
        });

        if (error) throw error;
        toast({ title: "Success", description: "Research submission submitted successfully" });
      }

      resetResearchForm();
      setEditingSubmission(null);
      await fetchSubmissions();
    } catch (error: any) {
      console.error("Error submitting research:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit research",
        variant: "destructive",
      });
    }
  };

  /* ---------------------- SUBMIT INTERNSHIP ---------------------- */

  const handleSubmitInternship = async () => {
    if (
      !validateStudentInfo() ||
      !companyName ||
      !role ||
      !startDate ||
      !endDate ||
      !internshipType ||
      !supervisorName ||
      !description ||
      skills.length === 0
    ) {
      toast({
        title: "Error",
        description: "Please fill all required internship fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSubmission && editingSubmission.type === 'internship') {
        // Update existing internship
        const { error } = await (supabase as any).from("internship_submissions").update({
          student_name: studentName,
          register_number: registerNumber,
          department,
          semester,
          company_name: companyName,
          role,
          start_date: startDate,
          end_date: endDate,
          duration: calculateDuration(),
          internship_type: internshipType,
          supervisor_name: supervisorName,
          description,
          skills,
          certificate_url: certificate ? certificate.name : null,
          project_details: projectDetails || null,
        }).eq('id', editingSubmission.id);

        if (error) throw error;
        toast({ title: "Success", description: "Internship updated successfully" });
      } else {
        // Create new internship
        const { error } = await (supabase as any).from("internship_submissions").insert({
          student_id: userId,
          student_name: studentName,
          register_number: registerNumber,
          department,
          semester,
          company_name: companyName,
          role,
          start_date: startDate,
          end_date: endDate,
          duration: calculateDuration(),
          internship_type: internshipType,
          supervisor_name: supervisorName,
          description,
          skills,
          certificate_url: certificate ? certificate.name : null,
          project_details: projectDetails || null,
        });

        if (error) throw error;
        toast({ title: "Success", description: "Internship submission submitted successfully" });
      }

      resetInternshipForm();
      setEditingSubmission(null);
      await fetchSubmissions();
    } catch (error: any) {
      console.error("Error submitting internship:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit internship",
        variant: "destructive",
      });
    }
  };

  /* --------------------------- RESET FORMS --------------------------- */

  const resetStudentInfo = () => {
    setStudentName("");
    setRegisterNumber("");
    setDepartment("");
    setSemester("");
  };

  const resetResearchForm = () => {
    setResearchTitle("");
    setResearchDomain("");
    setPublicationType("");
    setPublisherName("");
    setDoiLink("");
    setAbstract("");
    setDateOfPublication("");
    setMentorName("");
    setOrganization("");
    setResearchFile(null);
    resetStudentInfo();
  };

  const resetInternshipForm = () => {
    setCompanyName("");
    setRole("");
    setStartDate("");
    setEndDate("");
    setInternshipType("");
    setSupervisorName("");
    setDescription("");
    setSkills([]);
    setSkillsInput("");
    setCertificate(null);
    setProjectDetails("");
    resetStudentInfo();
  };

  /* ============================== UI ============================== */

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Research & Internship
        </h2>
        <p className="text-muted-foreground">
          Submit your research contributions or internship details
        </p>
      </div>

      <Tabs defaultValue="submit" className="w-full">
        <TabsList>
          <TabsTrigger value="submit">Submit New</TabsTrigger>
          <TabsTrigger value="view">My Submissions</TabsTrigger>
        </TabsList>

        {/* ----------------------- SUBMIT TAB ----------------------- */}
        <TabsContent value="submit" className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="studentName">Name *</Label>
                <Input
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <Label htmlFor="registerNumber">Register Number *</Label>
                <Input
                  id="registerNumber"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  placeholder="Enter register number"
                />
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Enter department"
                />
              </div>
              <div>
                <Label htmlFor="semester">Semester *</Label>
                <Input
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="Enter semester"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submission type */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={submissionType}
                onValueChange={(value) =>
                  setSubmissionType(value as "research" | "internship")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select submission type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="research">Research Contribution</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Research form */}
          {submissionType === "research" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Research Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Research Title *</Label>
                  <Input
                    value={researchTitle}
                    onChange={(e) => setResearchTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Research Domain *</Label>
                  <Input
                    value={researchDomain}
                    onChange={(e) => setResearchDomain(e.target.value)}
                    placeholder="e.g., Machine Learning, IoT"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Publication Type *</Label>
                    <Select
                      value={publicationType}
                      onValueChange={setPublicationType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="journal">Journal</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Publisher Name *</Label>
                    <Input
                      value={publisherName}
                      onChange={(e) => setPublisherName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>DOI Link *</Label>
                  <Input
                    value={doiLink}
                    onChange={(e) => setDoiLink(e.target.value)}
                    placeholder="https://doi.org/..."
                  />
                </div>
                <div>
                  <Label>Abstract *</Label>
                  <Textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Date of Publication *</Label>
                  <Input
                    type="date"
                    value={dateOfPublication}
                    onChange={(e) => setDateOfPublication(e.target.value)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Mentor Name *</Label>
                    <Input
                      value={mentorName}
                      onChange={(e) => setMentorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>College/Organization *</Label>
                    <Input
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Upload PDF (Optional)</Label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      setResearchFile(e.target.files?.[0] || null)
                    }
                  />
                </div>
                <Button onClick={handleSubmitResearch} className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {editingSubmission?.type === 'research' ? 'Update Research' : 'Submit Research'}
                </Button>
                {editingSubmission?.type === 'research' && (
                  <Button variant="outline" onClick={() => {
                    setEditingSubmission(null);
                    resetResearchForm();
                  }} className="w-full">
                    Cancel Edit
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            // Internship form
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Internship Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Role *</Label>
                    <Input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g., Software Developer"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                {startDate && endDate && (
                  <div>
                    <Label>Duration</Label>
                    <Input value={calculateDuration()} disabled />
                  </div>
                )}
                <div>
                  <Label>Internship Type *</Label>
                  <Select
                    value={internshipType}
                    onValueChange={setInternshipType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Supervisor Name *</Label>
                  <Input
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description of Work *</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Skills Gained *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="Type a skill and press Add / Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button type="button" onClick={addSkill}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1">
                        {skill}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Certificate Upload *</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setCertificate(e.target.files?.[0] || null)
                    }
                  />
                </div>
                <div>
                  <Label>Project Details (Optional)</Label>
                  <Textarea
                    value={projectDetails}
                    onChange={(e) => setProjectDetails(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleSubmitInternship} className="w-full">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {editingSubmission?.type === 'internship' ? 'Update Internship' : 'Submit Internship'}
                </Button>
                {editingSubmission?.type === 'internship' && (
                  <Button variant="outline" onClick={() => {
                    setEditingSubmission(null);
                    resetInternshipForm();
                  }} className="w-full">
                    Cancel Edit
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ----------------------- VIEW TAB ----------------------- */}
        <TabsContent value="view" className="space-y-4">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No submissions yet
              </CardContent>
            </Card>
          ) : (
            submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {submission.type === "research" ? (
                        <BookOpen className="h-5 w-5 text-primary" />
                      ) : (
                        <Briefcase className="h-5 w-5 text-primary" />
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {submission.type === "research"
                            ? submission.researchTitle
                            : `${submission.companyName} - ${submission.role}`}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {submission.submittedDate}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        submission.status === "approved"
                          ? "default"
                          : submission.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {submission.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {submission.type === "research" ? (
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Domain:</strong>{" "}
                        {submission.researchDomain}
                      </p>
                      <p>
                        <strong>Publication:</strong>{" "}
                        {submission.publicationType} –{" "}
                        {submission.publisherName}
                      </p>
                      <p>
                        <strong>Mentor:</strong> {submission.mentorName}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Duration:</strong> {submission.duration}
                      </p>
                      <p>
                        <strong>Type:</strong> {submission.internshipType}
                      </p>
                      <p>
                        <strong>Skills:</strong>{" "}
                        {submission.skills.join(", ")}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(submission)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(submission.id, submission.type)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
