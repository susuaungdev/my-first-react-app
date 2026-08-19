import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";

import Resumes from "./pages/Resumes";
import CreateResume from "./pages/CreateResume";
import ResumeDetails from "./pages/ResumeDetails";
import EditResume from "./pages/EditResume";
import ResumeDesignStudio from "./pages/ResumeDesignStudio";

import Interviews from "./pages/Interviews";
import SavedJobs from "./pages/SavedJobs";
import Analytics from "./pages/Analytics";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* APPLICATIONS */}

        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          }
        />

        {/* INTERVIEWS */}

        <Route
          path="/interviews"
          element={
            <ProtectedRoute>
              <Interviews />
            </ProtectedRoute>
          }
        />

        {/* SAVED JOBS */}

        <Route
          path="/saved-jobs"
          element={
            <ProtectedRoute>
              <SavedJobs />
            </ProtectedRoute>
          }
        />

        {/* ANALYTICS */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* RESUMES */}

        <Route
          path="/resumes"
          element={
            <ProtectedRoute>
              <Resumes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resumes/new"
          element={
            <ProtectedRoute>
              <CreateResume />
            </ProtectedRoute>
          }
        />

        {/* Create a new free-layout Studio resume */}

        <Route
          path="/resumes/studio"
          element={
            <ProtectedRoute>
              <ResumeDesignStudio />
            </ProtectedRoute>
          }
        />

        {/* Continue editing an existing Studio resume */}

        <Route
          path="/resumes/:id/studio"
          element={
            <ProtectedRoute>
              <ResumeDesignStudio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resumes/:id/edit"
          element={
            <ProtectedRoute>
              <EditResume />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resumes/:id"
          element={
            <ProtectedRoute>
              <ResumeDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;