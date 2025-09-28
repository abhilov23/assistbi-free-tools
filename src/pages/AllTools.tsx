import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ToolsGrid from "@/components/ToolsGrid";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const AllTools = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        {/* Header Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              All <span className="text-primary">Tools</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover our complete collection of free productivity tools designed to streamline your workflow and boost efficiency.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section className="py-16">
          <ToolsGrid searchFilter={searchQuery} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AllTools;