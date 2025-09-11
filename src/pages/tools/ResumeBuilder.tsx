import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Download, User } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface Education {
  id: string;
  institution: string;
  degree: string;
  location: string;
  duration: string;
}

interface Experience {
  id: string;
  position: string;
  company: string;
  location: string;
  duration: string;
  responsibilities: string[];
}

interface Project {
  id: string;
  name: string;
  technologies: string;
  duration: string;
  description: string[];
}

interface ResumeData {
  personalInfo: {
    name: string;
    phone: string;
    email: string;
    linkedin: string;
    github: string;
  };
  education: Education[];
  experience: Experience[];
  projects: Project[];
  technicalSkills: {
    languages: string;
    frameworks: string;
    developerTools: string;
    libraries: string;
  };
}

const ResumeBuilder = () => {
  const { toast } = useToast();
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "",
      phone: "",
      email: "",
      linkedin: "",
      github: "",
    },
    education: [{ id: "1", institution: "", degree: "", location: "", duration: "" }],
    experience: [{ id: "1", position: "", company: "", location: "", duration: "", responsibilities: [""] }],
    projects: [{ id: "1", name: "", technologies: "", duration: "", description: [""] }],
    technicalSkills: {
      languages: "",
      frameworks: "",
      developerTools: "",
      libraries: "",
    },
  });

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      location: "",
      duration: "",
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      position: "",
      company: "",
      location: "",
      duration: "",
      responsibilities: [""],
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience],
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  };

  const updateExperience = (id: string, field: keyof Omit<Experience, 'responsibilities'>, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const updateExperienceResponsibilities = (id: string, responsibilities: string[]) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, responsibilities } : exp
      ),
    }));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "",
      technologies: "",
      duration: "",
      description: [""],
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id),
    }));
  };

  const updateProject = (id: string, field: keyof Omit<Project, 'description'>, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    }));
  };

  const updateProjectDescription = (id: string, description: string[]) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, description } : proj
      ),
    }));
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Header
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(resumeData.personalInfo.name || "Your Name", 105, yPos, { align: "center" });
      yPos += 10;

      // Contact info
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const contactInfo = [
        resumeData.personalInfo.phone,
        resumeData.personalInfo.email,
        resumeData.personalInfo.linkedin,
        resumeData.personalInfo.github
      ].filter(info => info).join(" | ");
      doc.text(contactInfo, 105, yPos, { align: "center" });
      yPos += 15;

      // Education
      if (resumeData.education.some(edu => edu.institution)) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("EDUCATION", 20, yPos);
        doc.line(20, yPos + 2, 190, yPos + 2);
        yPos += 8;

        resumeData.education.forEach(edu => {
          if (edu.institution) {
            doc.setFont("helvetica", "bold");
            doc.text(edu.institution, 20, yPos);
            doc.setFont("helvetica", "normal");
            doc.text(edu.location, 190, yPos, { align: "right" });
            yPos += 5;
            
            doc.setFont("helvetica", "italic");
            doc.text(edu.degree, 20, yPos);
            doc.setFont("helvetica", "normal");
            doc.text(edu.duration, 190, yPos, { align: "right" });
            yPos += 8;
          }
        });
        yPos += 5;
      }

      // Experience
      if (resumeData.experience.some(exp => exp.position)) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("EXPERIENCE", 20, yPos);
        doc.line(20, yPos + 2, 190, yPos + 2);
        yPos += 8;

        resumeData.experience.forEach(exp => {
          if (exp.position) {
            doc.setFont("helvetica", "bold");
            doc.text(exp.position, 20, yPos);
            doc.setFont("helvetica", "normal");
            doc.text(exp.duration, 190, yPos, { align: "right" });
            yPos += 5;
            
            doc.setFont("helvetica", "italic");
            doc.text(exp.company, 20, yPos);
            doc.setFont("helvetica", "normal");
            doc.text(exp.location, 190, yPos, { align: "right" });
            yPos += 5;

            exp.responsibilities.forEach(resp => {
              if (resp.trim()) {
                doc.text(`• ${resp}`, 25, yPos);
                yPos += 4;
              }
            });
            yPos += 3;
          }
        });
        yPos += 5;
      }

      // Projects
      if (resumeData.projects.some(proj => proj.name)) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PROJECTS", 20, yPos);
        doc.line(20, yPos + 2, 190, yPos + 2);
        yPos += 8;

        resumeData.projects.forEach(proj => {
          if (proj.name) {
            doc.setFont("helvetica", "bold");
            doc.text(`${proj.name} | ${proj.technologies}`, 20, yPos);
            doc.setFont("helvetica", "normal");
            doc.text(proj.duration, 190, yPos, { align: "right" });
            yPos += 5;

            proj.description.forEach(desc => {
              if (desc.trim()) {
                doc.text(`• ${desc}`, 25, yPos);
                yPos += 4;
              }
            });
            yPos += 3;
          }
        });
        yPos += 5;
      }

      // Technical Skills
      const hasSkills = Object.values(resumeData.technicalSkills).some(skill => skill);
      if (hasSkills) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("TECHNICAL SKILLS", 20, yPos);
        doc.line(20, yPos + 2, 190, yPos + 2);
        yPos += 8;

        doc.setFont("helvetica", "normal");
        if (resumeData.technicalSkills.languages) {
          doc.text(`Languages: ${resumeData.technicalSkills.languages}`, 20, yPos);
          yPos += 5;
        }
        if (resumeData.technicalSkills.frameworks) {
          doc.text(`Frameworks: ${resumeData.technicalSkills.frameworks}`, 20, yPos);
          yPos += 5;
        }
        if (resumeData.technicalSkills.developerTools) {
          doc.text(`Developer Tools: ${resumeData.technicalSkills.developerTools}`, 20, yPos);
          yPos += 5;
        }
        if (resumeData.technicalSkills.libraries) {
          doc.text(`Libraries: ${resumeData.technicalSkills.libraries}`, 20, yPos);
          yPos += 5;
        }
      }

      doc.save(`${resumeData.personalInfo.name || 'resume'}.pdf`);
      toast({
        title: "Success!",
        description: "Resume downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Resume Builder</h1>
            <p className="text-muted-foreground">
              Create a professional resume and download it as PDF
            </p>
          </div>

          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Enter your contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={resumeData.personalInfo.name}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, name: e.target.value }
                      }))}
                      placeholder="Jake Ryan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                      placeholder="123-456-7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value }
                      }))}
                      placeholder="jake@su.edu"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={resumeData.personalInfo.linkedin}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                      }))}
                      placeholder="linkedin.com/in/jake"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={resumeData.personalInfo.github}
                      onChange={(e) => setResumeData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, github: e.target.value }
                      }))}
                      placeholder="github.com/jake"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>Add your educational background</CardDescription>
                  </div>
                  <Button onClick={addEducation} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {resumeData.education.map((edu, index) => (
                  <div key={edu.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Education {index + 1}</h4>
                      {resumeData.education.length > 1 && (
                        <Button
                          onClick={() => removeEducation(edu.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          placeholder="Southwestern University"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={edu.location}
                          onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                          placeholder="Georgetown, TX"
                        />
                      </div>
                      <div>
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="Bachelor of Arts in Computer Science, Minor in Business"
                        />
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={edu.duration}
                          onChange={(e) => updateEducation(edu.id, 'duration', e.target.value)}
                          placeholder="Aug. 2018 – May 2021"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Experience</CardTitle>
                    <CardDescription>Add your work experience</CardDescription>
                  </div>
                  <Button onClick={addExperience} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      {resumeData.experience.length > 1 && (
                        <Button
                          onClick={() => removeExperience(exp.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Position</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          placeholder="Undergraduate Research Assistant"
                        />
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={exp.duration}
                          onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                          placeholder="June 2020 – Present"
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          placeholder="Texas A&M University"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          placeholder="College Station, TX"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Responsibilities (one per line)</Label>
                      <Textarea
                        value={exp.responsibilities.join('\n')}
                        onChange={(e) => updateExperienceResponsibilities(exp.id, e.target.value.split('\n'))}
                        placeholder="Developed a REST API using FastAPI and PostgreSQL to store data from learning management systems&#10;Developed a full-stack web application using Flask, React, PostgreSQL, and Docker to analyze GitHub data"
                        rows={4}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>Showcase your projects</CardDescription>
                  </div>
                  <Button onClick={addProject} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {resumeData.projects.map((proj, index) => (
                  <div key={proj.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Project {index + 1}</h4>
                      {resumeData.projects.length > 1 && (
                        <Button
                          onClick={() => removeProject(proj.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Project Name</Label>
                        <Input
                          value={proj.name}
                          onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                          placeholder="Gitlytics"
                        />
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={proj.duration}
                          onChange={(e) => updateProject(proj.id, 'duration', e.target.value)}
                          placeholder="June 2020 – Present"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Technologies</Label>
                        <Input
                          value={proj.technologies}
                          onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                          placeholder="Python, Flask, React, PostgreSQL, Docker"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description (one point per line)</Label>
                      <Textarea
                        value={proj.description.join('\n')}
                        onChange={(e) => updateProjectDescription(proj.id, e.target.value.split('\n'))}
                        placeholder="Developed a full-stack web application using with Flask serving a REST API with React as the frontend&#10;Implemented GitHub OAuth to get data from user's repositories&#10;Visualized GitHub data to show collaboration"
                        rows={4}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Technical Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Skills</CardTitle>
                <CardDescription>List your technical skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="languages">Languages</Label>
                  <Input
                    id="languages"
                    value={resumeData.technicalSkills.languages}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      technicalSkills: { ...prev.technicalSkills, languages: e.target.value }
                    }))}
                    placeholder="Java, Python, C/C++, SQL (Postgres), JavaScript, HTML/CSS, R"
                  />
                </div>
                <div>
                  <Label htmlFor="frameworks">Frameworks</Label>
                  <Input
                    id="frameworks"
                    value={resumeData.technicalSkills.frameworks}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      technicalSkills: { ...prev.technicalSkills, frameworks: e.target.value }
                    }))}
                    placeholder="React, Node.js, Flask, JUnit, WordPress, Material-UI, FastAPI"
                  />
                </div>
                <div>
                  <Label htmlFor="developerTools">Developer Tools</Label>
                  <Input
                    id="developerTools"
                    value={resumeData.technicalSkills.developerTools}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      technicalSkills: { ...prev.technicalSkills, developerTools: e.target.value }
                    }))}
                    placeholder="Git, Docker, TravisCI, Google Cloud Platform, VS Code, Visual Studio, PyCharm, IntelliJ, Eclipse"
                  />
                </div>
                <div>
                  <Label htmlFor="libraries">Libraries</Label>
                  <Input
                    id="libraries"
                    value={resumeData.technicalSkills.libraries}
                    onChange={(e) => setResumeData(prev => ({
                      ...prev,
                      technicalSkills: { ...prev.technicalSkills, libraries: e.target.value }
                    }))}
                    placeholder="pandas, NumPy, Matplotlib"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Download Button */}
            <div className="flex justify-center pt-6">
              <Button onClick={generatePDF} size="lg" className="px-8">
                <Download className="w-5 h-5 mr-2" />
                Download Resume PDF
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResumeBuilder;