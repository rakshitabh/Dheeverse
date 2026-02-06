import { Routes, Route, useParams, useLocation } from "react-router-dom";
import { ThemeProvider } from "./lib/theme-context";
import { UserProvider, useUser } from "./lib/user-context";
import { JournalProvider } from "./lib/journal-context";
import { Toaster } from "./components/ui/sonner";
import { getActivityById } from "./lib/wellness-activities";

// Public routes
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Protected routes
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import JournalPage from "./pages/JournalPage";
import JournalNewPage from "./pages/JournalNewPage";
import WellnessPage from "./pages/WellnessPage";
import { ActivityDetail } from "./components/wellness/activity-detail";
import GamesPage from "./pages/GamesPage";
import SoundsPage from "./pages/SoundsPage";
import InsightsPage from "./pages/InsightsPage";
import ArchivePage from "./pages/ArchivePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import { Navigate } from "react-router-dom";

function ActivityDetailWrapper() {
  const { activityId } = useParams();
  const location = useLocation();
  const activity = location.state?.activity || getActivityById(activityId);

  return <ActivityDetail activity={activity} />;
}

function ProtectedRoute({ children }) {
  const { isLoading, isAuthenticated } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated (for login/signup pages)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <JournalProvider>
          <Routes>
            {/* Public routes - Landing page accessible to all */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth routes - redirect to dashboard if already logged in */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
            </Route>

            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<JournalPage />} />
              <Route path="new" element={<JournalNewPage />} />
            </Route>

            <Route
              path="/wellness"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<WellnessPage />} />
              <Route
                path="activity/:activityId"
                element={<ActivityDetailWrapper />}
              />
            </Route>

            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<GamesPage />} />
            </Route>

            <Route
              path="/sounds"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SoundsPage />} />
            </Route>

            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<InsightsPage />} />
            </Route>

            <Route
              path="/archive"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ArchivePage />} />
            </Route>

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ProfilePage />} />
            </Route>

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SettingsPage />} />
            </Route>
          </Routes>
          <Toaster />
        </JournalProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
