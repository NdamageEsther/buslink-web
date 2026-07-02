import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import StationsPage from '../pages/admin/StationsPage';
import AgenciesPage from '../pages/admin/AgenciesPage';
import AgencyStationLinkPage from '../pages/admin/AgencyStationLinkPage';
import UsersPage from '../pages/admin/UsersPage';
import ReportsPage from '../pages/admin/ReportsPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';

function wrap(children: React.ReactNode) {
  return (
    <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

export default function AdminRoutes() {
  return (
    <>
      <Route path="/admin/dashboard" element={wrap(<AdminDashboardPage />)} />
      <Route path="/admin/stations" element={wrap(<StationsPage />)} />
      <Route path="/admin/agencies" element={wrap(<AgenciesPage />)} />
      <Route path="/admin/agency-stations" element={wrap(<AgencyStationLinkPage />)} />
      <Route path="/admin/users" element={wrap(<UsersPage />)} />
      <Route path="/admin/reports" element={wrap(<ReportsPage />)} />
      <Route path="/admin/profile" element={wrap(<AdminProfilePage />)} />
    </>
  );
}