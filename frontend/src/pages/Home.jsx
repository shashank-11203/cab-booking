import { useState, useRef, useEffect } from "react";
import Hero from "../components/Hero";
import BookingForm from "../components/BookingForm";
import CarsSection from "../components/CarSection";
import CheckoutSection from "../components/CheckoutSection";
import { useTheme } from "../context/ThemeContext";
import WhyChooseWavy from "../components/WhyChooseWavy";
import CorporateBanner from "../components/CorporateBooking";
import CorporateFormPopup from "../components/CorporatePopupForm";
import ServiceCategories from "../components/ServiceCategories";

const Home = () => {
  const { theme } = useTheme();

  const [carsVisible, setCarsVisible] = useState(false);
  const [tripData, setTripData] = useState(null);

  const [selectedCar, setSelectedCar] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const carSectionRef = useRef();
  const checkoutRef = useRef(null);
  const bookingRef = useRef(null);
  const corporateRef = useRef();

  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;

      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    };

    handleHashScroll();

    window.addEventListener("hashchange", handleHashScroll);

    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;
      
      const href = target.getAttribute('href');
      if (href && href.startsWith('/#')) {
        e.preventDefault();
        const hash = href.substring(2);
        const el = document.getElementById(hash);
        if (el) {
          window.history.pushState(null, '', href);
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShowCabs = (data) => {
    setTripData(data);
    setCarsVisible(true);
    setSelectedCar(null);

    setTimeout(() => {
      carSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const handleBookCar = (car) => {
    setSelectedCar(car);

    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  return (
    <div
      className="
        min-h-screen
        bg-yellow-50 
        [[data-theme=dark]_&]:bg-gray-900 
        transition-colors duration-500
      "
    >
      <Hero onBookNow={scrollToBooking} />

      <div ref={bookingRef} id="booking-section">
        <BookingForm onShowCabs={handleShowCabs} />
      </div>

      {carsVisible && tripData && (
        <div ref={carSectionRef}>
          <CarsSection tripData={tripData} onBookCar={handleBookCar} />
        </div>
      )}

      {selectedCar && (
        <div ref={checkoutRef}>
          <CheckoutSection tripData={tripData} car={selectedCar} />
        </div>
      )}

      <WhyChooseWavy />

      <div ref={corporateRef} id="corporate">
        <CorporateBanner onOpenForm={() => setShowForm(true)} />
        <CorporateFormPopup open={showForm} onClose={() => setShowForm(false)} />
      </div>

      <ServiceCategories />
    </div>
  );
};

export default Home;