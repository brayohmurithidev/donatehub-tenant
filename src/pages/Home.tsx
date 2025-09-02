import {useEffect, useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import Overview from "@/layout/tabs/Overview.tsx";
import Campaigns from "@/layout/tabs/Campaigns.tsx";
import Donations from "@/layout/tabs/Donations.tsx";
import SettingsTab from "@/layout/tabs/Settings.tsx";
import { BarChart3, Target, Heart, Settings } from "lucide-react";

const Home = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAnimating, setIsAnimating] = useState(false);

  // Load saved tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Update localStorage whenever activeTab changes
  const handleTabChange = (value: string) => {
    if (value === activeTab || isAnimating) return;
    
    setIsAnimating(true);
    setActiveTab(value);
    localStorage.setItem("activeTab", value);
    
    // Reset animation state after transition
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Tab configuration with icons and labels
  const tabConfig = [
    { value: "overview", label: "Overview", icon: BarChart3, color: "primary" },
    { value: "campaigns", label: "Campaigns", icon: Target, color: "success" },
    { value: "donations", label: "Donations", icon: Heart, color: "info" },
    { value: "settings", label: "Settings", icon: Settings, color: "secondary" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Your Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Manage your campaigns, track donations, and monitor your impact
        </p>
      </div>

      {/* Enhanced Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full bg-white rounded-2xl p-2 gap-2 h-16 shadow-lg border border-gray-200">
          {tabConfig.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.value;
            
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`
                  flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ease-out
                  text-sm font-medium cursor-pointer border-2 border-transparent transform
                  ${isActive 
                    ? `bg-${tab.color}-50 border-${tab.color}-200 text-${tab.color}-700 shadow-sm scale-105` 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:scale-102'
                  }
                  ${isAnimating ? 'pointer-events-none' : ''}
                `}
              >
                <IconComponent 
                  className={`h-5 w-5 transition-all duration-300 ${
                    isActive ? `text-${tab.color}-600 scale-110` : 'text-gray-500 scale-100'
                  }`} 
                />
                <span className="hidden sm:inline transition-all duration-300">{tab.label}</span>
                <span className="sm:hidden transition-all duration-300">{tab.label.charAt(0)}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content with Enhanced Styling and Animations */}
        <div className="mt-8 relative">
          <TabsContent 
            value="overview" 
            className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:shadow-xl">
              <Overview />
            </div>
          </TabsContent>
          
          <TabsContent 
            value="campaigns" 
            className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:shadow-xl">
              <Campaigns />
            </div>
          </TabsContent>
          
          <TabsContent 
            value="donations" 
            className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:shadow-xl">
              <Donations />
            </div>
          </TabsContent>
          
          <TabsContent 
            value="settings" 
            className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-300 hover:shadow-xl">
              <SettingsTab />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Home;