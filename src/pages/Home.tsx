import React from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger,} from "@/components/ui/tabs.tsx";
import Overview from "@/layout/tabs/Overview.tsx";
import Campaigns from "@/layout/tabs/Campaigns.tsx";
import Donations from "@/layout/tabs/Donations.tsx";
import SettingsTab from "@/layout/tabs/Settings.tsx";
import Topbar from "@/layout/Topbar.tsx";

const Home = () => {
  return (
    <>
      <Topbar />
      <Tabs
        defaultValue="overview"
        className="w-full max-w-7xl mx-auto px-4 py-6"
      >
        <TabsList className="w-full bg-gray-100 rounded-xl p-1  gap-1 h-10">
          {["overview", "campaigns", "donations", "settings"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="w-full text-center text-sm text-gray-600 px-4 py-2 rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-black hover:bg-white/60 cursor-pointer"
              // className="data-[state=active]:bg-white data-[state=active]:text-black px-4 py-4 rounded-lg transition-all"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="overview">
            <Overview />
            {/*<div className="bg-white p-6 rounded-xl shadow-sm">Overview Content</div>*/}
          </TabsContent>
          <TabsContent value="campaigns" className="space-y-6">
            <Campaigns />
          </TabsContent>
          <TabsContent value="donations" className="space-y-6">
            <Donations />
          </TabsContent>
          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
};

export default Home;
