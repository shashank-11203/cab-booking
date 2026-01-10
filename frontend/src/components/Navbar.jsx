// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Sun,
//   Moon,
//   User,
//   ChevronDown,
//   Menu,
//   X
// } from "lucide-react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { useState, useRef, useEffect } from "react";
// import { useTheme } from "../context/ThemeContext";
// import { useAuth } from "../context/AuthContext";

// const Navbar = () => {
//   const { theme, toggleTheme } = useTheme();
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [hoveredLink, setHoveredLink] = useState(null);
//   const [showProfileDropdown, setShowProfileDropdown] = useState(false);
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const profileRef = useRef(null);
//   const mobileRef = useRef(null);

//   useEffect(() => {
//     const handler = (e) => {
//       if (mobileRef.current && !mobileRef.current.contains(e.target)) {
//         setMobileOpen(false);
//       }
//       if (profileRef.current && !profileRef.current.contains(e.target)) {
//         setShowProfileDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const navLinks = [
//     { name: "Home", path: "/" },
//     { name: "Bookings", path: "/bookings" },
//     { name: "Contact Us", path: "/contact" },
//     { name: "About Us", path: "/about" },
//   ];

//   const getLinkColor = (path) => {
//     const active = location.pathname === path;
//     const hover = hoveredLink === path;
//     return active || hover ? "text-yellow-400" : "text-gray-700 [[data-theme=dark]_&]:text-gray-200";
//   };

//   const handleLogout = () => {
//     logout();
//     setMobileOpen(false);
//     setShowProfileDropdown(false);
//     navigate("/");
//   };

//   return (
//     <nav className="sticky top-0 z-50 
//                     bg-white [[data-theme=dark]_&]:bg-gray-800 
//                     border-b border-gray-200 [[data-theme=dark]_&]:border-gray-700
//                     shadow-sm
//                     transition-colors duration-300">
      
//       <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto
//                       flex items-center justify-between 
//                       px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14
//                       py-3 sm:py-4">
//         <h1
//           className="text-lg sm:text-xl md:text-2xl font-bold cursor-pointer select-none
//                      hover:scale-105 transition-transform duration-200"
//           onClick={() => navigate("/")}
//         >
//           <span className="text-yellow-400">Door Darshan</span>{" "}
//           <span className="text-gray-900 [[data-theme=dark]_&]:text-white">Travels</span>
//         </h1>

//         <ul className="hidden md:flex gap-6 lg:gap-8 font-medium">
//           {navLinks.map(({ name, path }) => (
//             <li
//               key={path}
//               className="relative"
//               onMouseEnter={() => setHoveredLink(path)}
//               onMouseLeave={() => setHoveredLink(null)}
//             >
//               <Link 
//                 to={path}
//                 className={`${getLinkColor(path)} transition-colors duration-200
//                            hover:text-yellow-400
//                            text-sm lg:text-base`}
//               >
//                 {name}
//               </Link>
//               {location.pathname === path && (
//                 <motion.div
//                   layoutId="navbar-indicator"
//                   className="absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-400 rounded-full"
//                   initial={false}
//                   transition={{ type: "spring", stiffness: 380, damping: 30 }}
//                 />
//               )}
//             </li>
//           ))}
//         </ul>

//         <div className="hidden md:flex items-center gap-2 lg:gap-3">
//           {user ? (
//             <div ref={profileRef} className="relative">
//               <button
//                 onClick={() => setShowProfileDropdown(!showProfileDropdown)}
//                 className="border border-gray-300 [[data-theme=dark]_&]:border-gray-600
//                            rounded-full px-3 py-2
//                            flex items-center gap-1.5
//                            text-gray-700 [[data-theme=dark]_&]:text-gray-200
//                            hover:bg-yellow-400 hover:text-black hover:border-yellow-400
//                            transition-all duration-200
//                            text-sm lg:text-base"
//               >
//                 <User size={16} className="lg:w-[18px] lg:h-[18px]" />
//                 <ChevronDown size={14} className={`transition-transform duration-200 
//                                                    ${showProfileDropdown ? 'rotate-180' : ''}`} />
//               </button>

//               <AnimatePresence>
//                 {showProfileDropdown && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     transition={{ duration: 0.2 }}
//                     className="absolute right-0 mt-2 w-48 
//                                rounded-xl overflow-hidden
//                                bg-white [[data-theme=dark]_&]:bg-gray-700 
//                                shadow-lg border border-gray-200 [[data-theme=dark]_&]:border-gray-600"
//                   >
//                     <div className="px-4 py-3 border-b border-gray-200 [[data-theme=dark]_&]:border-gray-600">
//                       <p className="font-semibold text-sm text-gray-800 [[data-theme=dark]_&]:text-white truncate">
//                         {user.name}
//                       </p>
//                       <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 truncate">
//                         {user.email}
//                       </p>
//                     </div>
//                     <Link
//                       to="/profile"
//                       onClick={() => setShowProfileDropdown(false)}
//                       className="block px-4 py-2.5 text-sm
//                                  text-gray-700 [[data-theme=dark]_&]:text-gray-200
//                                  hover:bg-yellow-400 hover:text-black transition-colors"
//                     >
//                       Profile
//                     </Link>
//                     <button
//                       onClick={handleLogout}
//                       className="w-full text-left px-4 py-2.5 text-sm
//                                  text-gray-700 [[data-theme=dark]_&]:text-gray-200
//                                  hover:bg-yellow-400 hover:text-black transition-colors"
//                     >
//                       Logout
//                     </button>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           ) : (
//             <button
//               onClick={() => navigate("/login-selection")}
//               className="border border-gray-300 [[data-theme=dark]_&]:border-gray-600
//                          px-4 py-2 rounded-full
//                          text-sm lg:text-base
//                          text-gray-700 [[data-theme=dark]_&]:text-gray-200
//                          hover:bg-yellow-400 hover:text-black hover:border-yellow-400
//                          transition-all duration-200
//                          font-medium"
//             >
//               Login
//             </button>
//           )}

//           <button
//             onClick={toggleTheme}
//             className="border border-gray-300 [[data-theme=dark]_&]:border-gray-600
//                        p-2 rounded-full
//                        text-gray-700 [[data-theme=dark]_&]:text-gray-200
//                        hover:bg-yellow-400 hover:text-black hover:border-yellow-400
//                        transition-all duration-200"
//             aria-label="Toggle theme"
//           >
//             {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
//           </button>
//         </div>

//         <button
//           className="md:hidden p-2 
//                      text-gray-800 [[data-theme=dark]_&]:text-gray-200
//                      hover:bg-gray-100 [[data-theme=dark]_&]:hover:bg-gray-700
//                      rounded-lg transition-colors"
//           onClick={() => setMobileOpen(true)}
//           aria-label="Open menu"
//         >
//           <Menu size={24} className="sm:w-[26px] sm:h-[26px]" />
//         </button>
//       </div>

//       <AnimatePresence>
//         {mobileOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
//             onClick={() => setMobileOpen(false)}
//           >
//             <motion.div
//               ref={mobileRef}
//               initial={{ x: '100%' }}
//               animate={{ x: 0 }}
//               exit={{ x: '100%' }}
//               transition={{ type: "spring", damping: 30, stiffness: 300 }}
//               onClick={(e) => e.stopPropagation()}
//               className="absolute right-0 top-0 bottom-0 w-[280px] sm:w-[320px]
//                          bg-white [[data-theme=dark]_&]:bg-gray-800 
//                          shadow-2xl overflow-y-auto
//                          flex flex-col"
//             >
//               <div className="flex justify-between items-center 
//                               px-5 sm:px-6 py-4 sm:py-5
//                               border-b border-gray-200 [[data-theme=dark]_&]:border-gray-700">
//                 <h2 className="text-lg sm:text-xl font-bold 
//                                text-gray-900 [[data-theme=dark]_&]:text-white">
//                   Menu
//                 </h2>
//                 <button 
//                   onClick={() => setMobileOpen(false)}
//                   className="p-2 hover:bg-gray-100 [[data-theme=dark]_&]:hover:bg-gray-700 
//                              rounded-lg transition-colors"
//                   aria-label="Close menu"
//                 >
//                   <X size={22} className="text-gray-800 [[data-theme=dark]_&]:text-gray-200" />
//                 </button>
//               </div>
//               {user && (
//                 <div className="px-5 sm:px-6 py-4 
//                                 bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900/50
//                                 border-b border-gray-200 [[data-theme=dark]_&]:border-gray-700">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 sm:w-12 sm:h-12 
//                                     rounded-full bg-yellow-400 
//                                     flex items-center justify-center
//                                     text-black font-bold text-lg sm:text-xl">
//                       {user.name ? user.name[0].toUpperCase() : "U"}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="font-semibold text-sm sm:text-base
//                                     text-gray-900 [[data-theme=dark]_&]:text-white truncate">
//                         {user.name}
//                       </p>
//                       <p className="text-xs sm:text-sm text-gray-500 [[data-theme=dark]_&]:text-gray-400 truncate">
//                         {user.email}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <ul className="flex flex-col px-5 sm:px-6 py-4">
//                 {navLinks.map(({ name, path }) => (
//                   <li key={path}>
//                     <Link
//                       to={path}
//                       onClick={() => setMobileOpen(false)}
//                       className={`block py-3 text-base sm:text-lg
//                                  transition-colors duration-200
//                                  ${location.pathname === path 
//                                    ? 'text-yellow-400 font-semibold' 
//                                    : 'text-gray-700 [[data-theme=dark]_&]:text-gray-200 hover:text-yellow-400'}`}
//                     >
//                       {name}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>

//               <div className="mt-auto px-5 sm:px-6 py-4 
//                               border-t border-gray-200 [[data-theme=dark]_&]:border-gray-700
//                               space-y-2 bg-white [[data-theme=dark]_&]:bg-gray-800">
//                 {user ? (
//                   <>
//                     <Link
//                       to="/profile"
//                       onClick={() => setMobileOpen(false)}
//                       className="block py-2.5 text-base
//                                  text-gray-700 [[data-theme=dark]_&]:text-gray-200 
//                                  hover:text-yellow-400 transition-colors"
//                     >
//                       Profile Settings
//                     </Link>
//                     <button
//                       onClick={handleLogout}
//                       className="w-full text-left py-2.5 text-base
//                                  text-red-600 [[data-theme=dark]_&]:text-red-400
//                                  hover:text-red-700 [[data-theme=dark]_&]:hover:text-red-300
//                                  transition-colors font-medium"
//                     >
//                       Logout
//                     </button>
//                   </>
//                 ) : (
//                   <button
//                     onClick={() => {
//                       navigate("/login-selection");
//                       setMobileOpen(false);
//                     }}
//                     className="w-full py-3 text-base font-semibold
//                                bg-yellow-400 text-black
//                                rounded-lg hover:bg-yellow-500
//                                transition-colors"
//                   >
//                     Login
//                   </button>
//                 )}

//                 <button
//                   onClick={toggleTheme}
//                   className="w-full flex items-center justify-between
//                              py-3 px-4 mt-3
//                              border border-gray-300 [[data-theme=dark]_&]:border-gray-600
//                              rounded-lg
//                              text-gray-700 [[data-theme=dark]_&]:text-gray-200 
//                              hover:bg-gray-100 [[data-theme=dark]_&]:hover:bg-gray-700
//                              transition-colors"
//                 >
//                   <span className="text-base">Change Theme</span>
//                   <span className="p-1 rounded-full bg-gray-200 [[data-theme=dark]_&]:bg-gray-600">
//                     {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
//                   </span>
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </nav>
//   );
// };

// export default Navbar;

import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  User,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [hoveredLink, setHoveredLink] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const profileRef = useRef(null);
  const mobileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Bookings", path: "/bookings" },
    { name: "Contact Us", path: "/contact" },
    { name: "About Us", path: "/about" },
  ];

  const getLinkColor = (path) => {
    const active = location.pathname === path;
    const hover = hoveredLink === path;
    return active || hover ? "text-yellow-400" : "text-gray-700 [[data-theme=dark]_&]:text-gray-200";
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setShowProfileDropdown(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 
                    bg-white [[data-theme=dark]_&]:bg-gray-800 
                    border-b border-gray-200 [[data-theme=dark]_&]:border-gray-700
                    shadow-sm
                    transition-colors duration-300">
      
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto
                      flex items-center justify-between 
                      px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-14
                      py-3 sm:py-4">
        <h1
          className="text-lg sm:text-xl md:text-2xl font-bold cursor-pointer select-none
                     hover:scale-105 transition-transform duration-200"
          onClick={() => navigate("/")}
        >
          <span className="text-yellow-400">Door Darshan</span>{" "}
          <span className="text-gray-900 [[data-theme=dark]_&]:text-white">Travels</span>
        </h1>

        <ul className="hidden md:flex gap-6 lg:gap-8 font-medium">
          {navLinks.map(({ name, path }) => (
            <li
              key={path}
              className="relative"
              onMouseEnter={() => setHoveredLink(path)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <Link 
                to={path}
                className={`${getLinkColor(path)} transition-colors duration-200
                           hover:text-yellow-400
                           text-sm lg:text-base`}
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="border border-gray-300 [[data-theme=dark]_&]:border-gray-600
                           rounded-full px-3 py-2
                           flex items-center gap-1.5
                           text-gray-700 [[data-theme=dark]_&]:text-gray-200
                           hover:bg-yellow-400 hover:text-black hover:border-yellow-400
                           transition-all duration-200
                           text-sm lg:text-base"
              >
                <User size={16} className="lg:w-[18px] lg:h-[18px]" />
                <ChevronDown size={14} className={`transition-transform duration-200 
                                                   ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 
                               rounded-xl overflow-hidden
                               bg-white [[data-theme=dark]_&]:bg-gray-700 
                               shadow-lg border border-gray-200 [[data-theme=dark]_&]:border-gray-600"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 [[data-theme=dark]_&]:border-gray-600">
                      <p className="font-semibold text-sm text-gray-800 [[data-theme=dark]_&]:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 [[data-theme=dark]_&]:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="block px-4 py-2.5 text-sm
                                 text-gray-700 [[data-theme=dark]_&]:text-gray-200
                                 hover:bg-yellow-400 hover:text-black transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm
                                 text-gray-700 [[data-theme=dark]_&]:text-gray-200
                                 hover:bg-yellow-400 hover:text-black transition-colors"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login-selection")}
              className="border border-gray-300 [[data-theme=dark]_&]:border-gray-600
                         px-4 py-2 rounded-full
                         text-sm lg:text-base
                         text-gray-700 [[data-theme=dark]_&]:text-gray-200
                         hover:bg-yellow-400 hover:text-black hover:border-yellow-400
                         transition-all duration-200
                         font-medium"
            >
              Login
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="border border-gray-300 [[data-theme=dark]_&]:border-gray-600
                       p-2 rounded-full
                       text-gray-700 [[data-theme=dark]_&]:text-gray-200
                       hover:bg-yellow-400 hover:text-black hover:border-yellow-400
                       transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <button
          className="md:hidden p-2 
                     text-gray-800 [[data-theme=dark]_&]:text-gray-200
                     hover:bg-gray-100 [[data-theme=dark]_&]:hover:bg-gray-700
                     rounded-lg transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} className="sm:w-[26px] sm:h-[26px]" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              ref={mobileRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-[280px] sm:w-[320px]
                         bg-white [[data-theme=dark]_&]:bg-gray-800 
                         shadow-2xl overflow-y-auto
                         flex flex-col"
            >
              <div className="flex justify-between items-center 
                              px-5 sm:px-6 py-4 sm:py-5
                              border-b border-gray-200 [[data-theme=dark]_&]:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold 
                               text-gray-900 [[data-theme=dark]_&]:text-white">
                  Menu
                </h2>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="p-2 hover:bg-gray-100 [[data-theme=dark]_&]:hover:bg-gray-700 
                             rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X size={22} className="text-gray-800 [[data-theme=dark]_&]:text-gray-200" />
                </button>
              </div>
              {user && (
                <div className="px-5 sm:px-6 py-4 
                                bg-yellow-50 [[data-theme=dark]_&]:bg-gray-900/50
                                border-b border-gray-200 [[data-theme=dark]_&]:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 
                                    rounded-full bg-yellow-400 
                                    flex items-center justify-center
                                    text-black font-bold text-lg sm:text-xl">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base
                                    text-gray-900 [[data-theme=dark]_&]:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 [[data-theme=dark]_&]:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <ul className="flex flex-col px-5 sm:px-6 py-4">
                {navLinks.map(({ name, path }) => (
                  <li key={path}>
                    <Link
                      to={path}
                      onClick={() => setMobileOpen(false)}
                      className={`block py-3 text-base sm:text-lg
                                 transition-colors duration-200
                                 ${location.pathname === path 
                                   ? 'text-yellow-400 font-semibold' 
                                   : 'text-gray-700 [[data-theme=dark]_&]:text-gray-200 hover:text-yellow-400'}`}
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-auto px-5 sm:px-6 py-4 
                              border-t border-gray-200 [[data-theme=dark]_&]:border-gray-700
                              space-y-2 bg-white [[data-theme=dark]_&]:bg-gray-800">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2.5 text-base
                                 text-gray-700 [[data-theme=dark]_&]:text-gray-200 
                                 hover:text-yellow-400 transition-colors"
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left py-2.5 text-base
                                 text-red-600 [[data-theme=dark]_&]:text-red-400
                                 hover:text-red-700 [[data-theme=dark]_&]:hover:text-red-300
                                 transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/login-selection");
                      setMobileOpen(false);
                    }}
                    className="w-full py-3 text-base font-semibold
                               bg-yellow-400 text-black
                               rounded-lg hover:bg-yellow-500
                               transition-colors"
                  >
                    Login
                  </button>
                )}

                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between
                             py-3 px-4 mt-3
                             border border-gray-300 [[data-theme=dark]_&]:border-gray-600
                             rounded-lg
                             text-gray-700 [[data-theme=dark]_&]:text-gray-200 
                             hover:bg-gray-100 [[data-theme=dark]_&]:hover:bg-gray-700
                             transition-colors"
                >
                  <span className="text-base">Change Theme</span>
                  <span className="p-1 rounded-full bg-gray-200 [[data-theme=dark]_&]:bg-gray-600">
                    {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;