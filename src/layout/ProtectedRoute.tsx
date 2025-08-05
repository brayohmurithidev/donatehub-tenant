import {Navigate, Outlet} from "react-router";

import {useAuth} from "@/context/AuthContext";
import {LoadingSpinner} from "@/components/loadingSpinner";

export default function ProtectedRoute() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  console.log({ isAuthenticated });

  if (isAuthLoading)
    return (
      <div className="flex w-[100vw] h-[100vh] items-center justify-center space-x-4">
        <LoadingSpinner />
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
