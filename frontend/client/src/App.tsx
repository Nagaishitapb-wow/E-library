import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import BookDetails from "./pages/BookDetails";
import BorrowedBooks from "./pages/BorrowedBooks";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import About from "./pages/About";
import Mission from "./pages/Mission";
import Authors from "./pages/Authors";
import Help from "./pages/Help";
import Support from "./pages/Support";
import ReportBug from "./pages/ReportBug";
import RequestBook from "./pages/RequestBook";
import Categories from "./pages/Categories";
import VerifyEmail from "./pages/VerifyEmail";


import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MyFines from "./pages/MyFines";
import { ThemeProvider } from "./context/ThemeContext";

import ScrollToTop from "./components/ScrollToTop";
import BackToTopBtn from "./components/BackToTopBtn";

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <BackToTopBtn />
        <Navbar />
        <div className="main-content fade-in" style={{ flex: 1 }}>
          <Routes>

            {/* Public Landing Page (like OpenLibrary Home) */}
            <Route path="/" element={<Home />} />

            {/* Public book browsing allowed */}
            <Route path="/books" element={<Books />} />

            {/* Auth pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/book/:id" element={<BookDetails />} />

            {/* Static Pages from Footer */}
            <Route path="/about" element={<About />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/help" element={<Help />} />
            <Route path="/support" element={<Support />} />
            <Route path="/report-bug" element={<ReportBug />} />
            <Route path="/request-book" element={<RequestBook />} />
            <Route path="/categories" element={<Categories />} />

            {/* Only logged-in users can access */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/borrowed" element={<ProtectedRoute><BorrowedBooks /></ProtectedRoute>} />
            <Route path="/fines" element={<ProtectedRoute><MyFines /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </div>

        <Footer />
        <ToastContainer position="top-center" autoClose={2500} />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
