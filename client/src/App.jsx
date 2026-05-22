import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import JobListPage from "./pages/JobListPage";
import JobDetailPage from "./pages/JobDetailPage";
import RecommendedJobsPage from "./pages/RecommendedJobsPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CreateJobPage from "./pages/CreateJobPage";
import EditJobPage from "./pages/EditJobPage";
import ApplicantsPage from "./pages/ApplicantsPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import AdminDashboard from "./pages/AdminDashboard";
import PendingRecruitersPage from "./pages/PendingRecruitersPage";
import AdminJobsPage from "./pages/AdminJobsPage";
import AdminUsersPage from "./pages/AdminUsersPage";

export default function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOtpPage />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPasswordPage />}
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <PrivateRoute>
              <EditProfilePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile/change-password"
          element={
            <PrivateRoute>
              <ChangePasswordPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/jobs"
          element={<JobListPage />}
        />

        <Route
          path="/jobs/:id"
          element={<JobDetailPage />}
        />

        <Route
          path="/jobs/recommended"
          element={
            <PrivateRoute>
              <RecommendedJobsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/jobs/saved"
          element={
            <PrivateRoute>
              <SavedJobsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/recruiter/dashboard"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/recruiter/jobs/create"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={["recruiter"]}>
                <CreateJobPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/recruiter/jobs/:id/edit"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={["recruiter"]}>
                <EditJobPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/recruiter/applicants/:jobId"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={["recruiter"]}>
                <ApplicantsPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/applications/my"
          element={
            <PrivateRoute>
              <MyApplicationsPage />
            </PrivateRoute>
          }
        />
       <Route
path="/jobs/recommended"
element={<RecommendedJobsPage />}
/>

        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/recruiters"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <PendingRecruitersPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/jobs"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <AdminJobsPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <AdminUsersPage />
              </RoleRoute>
            </PrivateRoute>
          }
        />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}