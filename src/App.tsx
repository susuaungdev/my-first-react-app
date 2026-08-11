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

import ProtectedRoute from "./components/ProtectedRoute";
import ResumeDetails from "./pages/ResumeDetails";
import EditResume from "./pages/EditResume";
import Interviews from "./pages/Interviews";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}
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

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

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

      <Route
        path="/resumes/:id"
        element={
          <ProtectedRoute>
            <ResumeDetails />
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
        path="/interviews"
        element={<Interviews />}
      />

      </Routes>
    </BrowserRouter>
  );
}

export default App;