import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AgencyLayout from '../layouts/AgencyLayout';

import AgencyDashboardPage from '../pages/agency/AgencyDashboardPage';
import BusesPage from '../pages/agency/BusesPage';
import RoutesPage from '../pages/agency/RoutesPage';
import SchedulesPage from '../pages/agency/SchedulesPage';
import DriversPage from '../pages/agency/DriversPage';
import BookingsPage from '../pages/agency/BookingsPage';
import ReportsPage from '../pages/agency/ReportsPage';
import AgencyProfilePage from '../pages/agency/AgencyProfilePage';

function wrap(children: React.ReactNode) {
  return (
    <ProtectedRoute allowedRoles={['AGENCY_ADMIN']}>
      <AgencyLayout>{children}</AgencyLayout>
    </ProtectedRoute>
  );
}

export default function AgencyRoutes() {
  return (
    <>
      <Route path="/agency/dashboard" element={wrap(<AgencyDashboardPage />)} />
      <Route path="/agency/buses" element={wrap(<BusesPage />)} />
      <Route path="/agency/routes" element={wrap(<RoutesPage />)} />
      <Route path="/agency/schedules" element={wrap(<SchedulesPage />)} />
      <Route path="/agency/drivers" element={wrap(<DriversPage />)} />
      <Route path="/agency/bookings" element={wrap(<BookingsPage />)} />
      <Route path="/agency/reports" element={wrap(<ReportsPage />)} />
      <Route path="/agency/profile" element={wrap(<AgencyProfilePage />)} />
    </>
  );
}