import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StudyMaterials() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Engineering", "Computer Science", "Business", "Medicine"];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("materials" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setMaterials(data);
    } catch (error: any) {
      console.error("Error fetching materials:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredMaterials = materials.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#12121A] text-white p-6 md:p-12 font-['Inter'] relative overflow-hidden">
      
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* NEW: QoL Navigation Bar */}
        <div className="flex justify-between items-center mb-8 bg-[#1A1A1F]/60 backdrop-blur-md p-3 px-5 rounded-2xl border border-white/5 shadow-lg">
          <Button 
           onClick={() => navigate("/app")}
            variant="ghost" 
            className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
            Go Back
          </Button>
          
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            Sign Out
          </Button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Marketplace</h1>
            <p className="text-gray-400">Discover premium study materials, notes, and past papers.</p>
          </div>
          
          <Button 
            onClick={() => navigate("/app/upload-notes")}
            className="bg-neon-teal hover:bg-teal-400 text-black font-bold px-6 py-6 rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all hover:scale-105"
          >
            + Upload Notes
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <Input 
            placeholder="Search notes, subjects, or keywords..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#1A1A1F]/80 border-white/10 text-white h-12 md:w-96 rounded-xl backdrop-blur-md focus-visible:ring-1 focus-visible:ring-indigo-500"
          />
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
                    : "bg-[#1A1A1F]/80 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-[#1A1A1F]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-3">No materials found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Either the vault is empty, or no materials match your current search filters.</p>
            <Button onClick={() => navigate("/app/upload-notes")} variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Be the first to upload
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((item) => (
              <div 
                key={item.id} 
                className="bg-[#1A1A1F]/80 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl hover:border-teal-500/50 hover:shadow-[0_0_30px_rgba(45,212,191,0.15)] transition-all duration-300 relative group flex flex-col h-full"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-teal-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-white/5 border border-white/10 text-xs font-medium px-3 py-1.5 rounded-lg text-gray-300">
                    {item.category}
                  </span>
                  <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold px-3 py-1.5 rounded-lg">
                    {item.price === 0 ? "Free" : `৳${item.price}`}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">{item.description}</p>
                
                <Button 
  onClick={() => navigate(`/app/material/${item.id}`)}
  className="w-full bg-white/5 hover:bg-indigo-500 text-white border border-white/10 hover:border-transparent transition-all h-11"
>
  View Details
</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}