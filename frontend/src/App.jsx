import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Form from "./pages/Form.jsx";
import FeedData from "./component/FeedData.jsx";
import AdminLayout from "./component/AdminLayout.jsx";
import { useAuth } from "./context/AuthContext.jsx";

// ProtectedRoute for pages only accessible if logged in
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />; // redirect to login if not logged in
  return children;
};

// PublicRoute for login/register page, redirects if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/admin" />; // redirect to admin if already logged in
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Login/Register Page */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Form />
            </PublicRoute>
          }
        />

        {/* Admin Routes with Layout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Default open page = FeedData */}
          <Route index element={<FeedData />} />

          {/* FeedData Route */}
          <Route path="feeddata" element={<FeedData />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
