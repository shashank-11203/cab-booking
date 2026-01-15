import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Bookings from "./pages/Bookings";
import BookingForm from "./components/BookingForm";
import Cabs from "./pages/Cabs";
import ModifyRide from "./pages/ModifyRide";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import Footer from "./components/Footer";
import LoginSelect from "./components/LoginSelect";
import TravelPartnerLogin from "./pages/TravelPartnerLogin";
import CorporateLogin from "./pages/CorporateLogin";
import SendCorporateRequest from "./pages/SendCorporateRequest";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WhatsAppButton from "./components/WhatsappButton";
import AdminCars from "./pages/admin/AdminCars";
import AdminRides from "./pages/admin/AdminRides";
import AdminCancelRequests from "./pages/admin/AdminCancelRequests";
import AdminCorporate from "./pages/admin/AdminCorporate";
import CorporateNegotiation from "./pages/CorporateNegotiation";
import CorporatePaymentVerify from "./pages/CorporatePaymentVerify";
import AdminModifiedRides from "./pages/admin/AdminModifiedRides";
import AdminCoupnGenerate from "./pages/admin/AdminCouponGenerate";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import CarLoader from "./components/CarLoader";

function App() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen font-sans bg-white dark:bg-[#1E1E1E] transition-colors duration-500">

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 [[data-theme=dark]_&]:bg-gray-900/80 backdrop-blur-md">
          <CarLoader />
        </div>
      )
      }

      <Router>
        <ToastContainer position="top-right" autoClose={2500} />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login-selection" element={<LoginSelect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/partner/login" element={<TravelPartnerLogin />} />
          <Route path="/corporate/login" element={<CorporateLogin />} />

          <Route element={<ProtectedRoutes allowedRoles={["user", "admin", "corporate"]} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/book" element={<BookingForm />} />
            <Route path="/modify/:rideId" element={<ModifyRide />} />
            <Route path="/cabs" element={<Cabs />} />
          </Route>

          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/corporate/verify" element={<CorporatePaymentVerify />} />

          <Route element={<ProtectedRoutes allowedRoles={["admin"]} />}>
            <Route
              path="/admin"
              element={
                <AdminDashboard />
              }
            >
              <Route index element={<AdminCars />} />
              <Route path="cars" element={<AdminCars />} />
              <Route path="rides" element={<AdminRides />} />
              <Route path="cancel" element={<AdminCancelRequests />} />
              <Route path="corporate" element={<AdminCorporate />} />
              <Route path="modified" element={<AdminModifiedRides />} />
              <Route path="coupons" element={<AdminCoupnGenerate />} />
            </Route>
          </Route>


          <Route path="/corporate-request" element={<SendCorporateRequest />} />

          <Route element={<ProtectedRoutes allowedRoles={["corporate"]} />}>
            <Route path="/corporate-negotiation" element={<CorporateNegotiation />} />
          </Route>

        </Routes>
        <Footer />
        <WhatsAppButton />
      </Router>
    </div >
  );
}

export default App;