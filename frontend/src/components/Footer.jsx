import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="
        relative pt-16 sm:pt-20 pb-8 sm:pb-10 
        bg-gray-900 text-gray-300
        [[data-theme=light]_&]:bg-yellow-50 [[data-theme=light]_&]:text-gray-700
        overflow-hidden
      "
    >

      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block w-full h-[80px] sm:h-[100px] md:h-[120px] animate-[float_6s_infinite_ease-in-out]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path
            d="M1200 0L0 0 892.25 114.72 1200 0z"
            className="fill-yellow-400 [[data-theme=dark]_&]:fill-gray-700"
          ></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 relative z-10">

        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-400">
            Door Darshan Cabs
          </h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto sm:mx-0">
            Reliable, premium and professional cab service across Kutch & Gujarat.
            Comfort, safety & punctuality every ride, every time.
          </p>

          <div className="mt-4 sm:mt-6 flex gap-3 sm:gap-4 justify-center sm:justify-start">
            {["🌐", "📞", "✉️"].map((icon, i) => (
              <span
                key={i}
                className="
                  w-9 h-9 sm:w-10 sm:h-10 
                  flex items-center justify-center rounded-full 
                  bg-yellow-400 text-black hover:bg-yellow-500
                  transition cursor-pointer text-sm sm:text-base
                "
              >
                {icon}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-semibold text-yellow-400 mb-3 sm:mb-4">Quick Links</h3>
          <ul className="space-y-1.5 sm:space-y-2 text-sm">
            <li><Link to="/" className="hover:text-yellow-400 cursor-pointer transition-colors">Home</Link></li>
            <li><Link to="/#booking-section" className="hover:text-yellow-400 cursor-pointer transition-colors">Book a Ride</Link></li>
            <li><Link to="/bookings" className="hover:text-yellow-400 cursor-pointer transition-colors">My Bookings</Link></li>
            <li><Link to="/#corporate" className="hover:text-yellow-400 cursor-pointer transition-colors">Corporate Booking</Link></li>
          </ul>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-semibold text-yellow-400 mb-3 sm:mb-4">Company</h3>
          <ul className="space-y-1.5 sm:space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-yellow-400 cursor-pointer transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-yellow-400 cursor-pointer transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-semibold text-yellow-400 mb-3 sm:mb-4">Contact</h3>

          <p className="text-xs sm:text-sm leading-relaxed">
            📍 Raja complex, Vathan chowk,  
            M.S.V. High School road, Navavas,  
            Madhapar, Bhuj - Kutch
          </p>

          <p className="mt-2 sm:mt-3 text-xs sm:text-sm">📞 +91 98254 27572</p>

          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm break-words">📧 doordarshancabs@gmail.com</p>
        </div>

      </div>

      <div className="text-center mt-10 sm:mt-12 md:mt-14 text-xs sm:text-sm opacity-80 px-4">
        © {new Date().getFullYear()} 
        <span className="text-yellow-400 font-semibold"> Door Darshan Cabs</span>.  
        All Rights Reserved.
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </footer>
  );
}