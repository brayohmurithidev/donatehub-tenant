import Header from "@/layout/Header.tsx";
import {Outlet} from "react-router";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="pt-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
