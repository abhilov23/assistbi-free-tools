import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Heart, Shield, Zap, Users, Globe, Award, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "User-Centric",
      description: "Everything we build is designed with the user in mind, prioritizing simplicity and effectiveness."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data belongs to you. We implement the highest privacy standards and process data locally whenever possible."
    },
    {
      icon: Zap,
      title: "Always Free",
      description: "We believe powerful productivity tools should be accessible to everyone, regardless of budget."
    },
    {
      icon: Globe,
      title: "Open & Transparent",
      description: "We operate with complete transparency about our tools, processes, and data handling."
    }
  ];

  const stats = [
    { number: "15+", label: "Free Tools", icon: Target },
    { number: "100K+", label: "Monthly Users", icon: Users },
    { number: "99.9%", label: "Uptime", icon: TrendingUp },
    { number: "24/7", label: "Available", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2">
              About AssistBi Tools
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Empowering <span className="text-primary">Productivity</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              We're on a mission to democratize productivity by providing free, powerful tools that help individuals and teams accomplish more with less effort.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/tools">
                <Button size="lg" className="btn-hero">
                  Explore Tools
                </Button>
              </Link>
              <Link to="/support">
                <Button size="lg" variant="outline">
                  Get Support
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  In a world where productivity tools often come with hefty price tags and complex interfaces, we saw an opportunity to do things differently. AssistBi Tools was born from the belief that powerful, professional-grade tools should be accessible to everyone.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  Whether you're a student working on assignments, a professional managing projects, or an entrepreneur building your business, our tools are designed to remove barriers and amplify your capabilities.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Free Forever</Badge>
                  <Badge variant="secondary">No Registration Required</Badge>
                  <Badge variant="secondary">Privacy Focused</Badge>
                  <Badge variant="secondary">Open Source Friendly</Badge>
                </div>
              </div>
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-0">
                  <Target className="h-16 w-16 text-primary mb-6" />
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Democratizing Productivity
                  </h3>
                  <p className="text-muted-foreground">
                    Every tool we create follows our core principle: if it's useful for productivity, it should be free, fast, and accessible to everyone, everywhere.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stat.number}
                    </div>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Values
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                These principles guide every decision we make and every tool we build.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <value.icon className="h-12 w-12 text-primary mb-4" />
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Built by Developers, for Everyone
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Our team consists of passionate developers, designers, and productivity enthusiasts who understand the daily challenges of getting things done efficiently.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Diverse Expertise</h3>
                  <p className="text-muted-foreground text-sm">
                    From AI specialists to UX designers, our team brings diverse skills to create better tools.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User Focused</h3>
                  <p className="text-muted-foreground text-sm">
                    We actively listen to user feedback and continuously improve our tools based on real needs.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Global Impact</h3>
                  <p className="text-muted-foreground text-sm">
                    Our tools are used by people from over 150 countries, making productivity truly global.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Boost Your Productivity?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already discovered the power of free, professional-grade productivity tools.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/tools">
                <Button size="lg" className="btn-hero">
                  Try Our Tools
                </Button>
              </Link>
              <Link to="/support">
                <Button size="lg" variant="outline">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;