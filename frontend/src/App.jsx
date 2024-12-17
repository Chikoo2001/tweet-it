import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import HomePage from "./pages/home/HomePage.jsx";
import Sidebar from "./components/common/Sidebar.jsx";
import RightPanel from "./components/common/RightPanel.jsx";
import NotificationPage from "./pages/notification/NotificationPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import { Toaster } from "react-hot-toast";
import { useQuery } from "react-query";
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";

export default function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if(data.error) return null;
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error.message)
      }
    },
    retry: false
  });
  
  if(isLoading) return <div className="h-screen flex justify-center items-center"><LoadingSpinner size="lg" /></div>

  return (
    <div className="flex max-w-6xl mx-auto">
      {/* <Sidebar /> */}
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />}  />
        <Route path="/profile/:id" element={authUser ? <ProfilePage /> : <Navigate to="/login" />}  />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {/* <RightPanel /> */}
      <Toaster />
    </div>
  );
}
