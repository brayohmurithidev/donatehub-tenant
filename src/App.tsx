import "./App.css";
import {Route, Routes} from "react-router";
import MainLayout from "@/layout/layout";
import Home from "@/pages/Home.tsx";
import UserProfile from "@/pages/Profile.tsx";
import Login from "@/pages/Login.tsx";
import ProtectedRoute from "@/layout/ProtectedRoute";
import Register from "@/pages/Register";

function App() {
    console.log("API Base URL:", import.meta.env.VITE_API_URL);
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
