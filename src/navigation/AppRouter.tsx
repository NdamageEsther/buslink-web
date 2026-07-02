import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LandingPage from "../pages/PublicPages/LandingPage";
import NotFoundPage from "../pages/PublicPages/NotFoundPage";
import PublicLayout from "../layouts/PublicLayout";
import PassengerRoutes from "./PassengerRoutes";
import AgencyRoutes from "./AgencyRoutes";
import AdminRoutes from "./AdminRoutes";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public - with shared Navbar */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />

      {/* Role-based route groups */}
      {PassengerRoutes()}
      {AgencyRoutes()}
      {AdminRoutes()}

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
