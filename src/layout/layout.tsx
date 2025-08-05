import Header from "@/layout/Header.tsx";
import {Outlet} from "react-router";

const MainLayout = () => {
  return (
    <div className="mx-auto px-6 py-8">
      <Header />
      <Outlet />
    </div>
  );
};

export default MainLayout;
