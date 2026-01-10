import { useState, useEffect } from "react";
import { sendEmailOtp, verifyEmailOtp } from "../utils/authApiClient";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = ({ role = "user" }) => {
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);


  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 3000);
  };

  const isValidEmail = (email) => {
    const regex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
  };

  const handleSendOtp = async () => {
    if (!email) return toast.error("Email is required!");

    if (!isValidEmail(email)) {
      return toast.error("Enter a valid email address!");
    }

    try {
      setSending(true);

      const { data } = await sendEmailOtp({ email, otp, role });

      if (data.success) {
        toast.success("OTP sent!");
        setTimer(60);
        setStep(2);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setSending(false);
    }
  };


  const handleResendOtp = async () => {
    if (timer > 0) return;

    try {
      setResending(true);

      const { data } = await sendEmailOtp({ email });

      if (data.success) {
        toast.success("OTP resent!");
        setTimer(60);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setVerifying(true);

      const { data } = await verifyEmailOtp({ email, otp });

      if (data.success) {

        /* ================= ADMIN LOGIN ================= */
        if (role === "admin") {
          if (data.user.role !== "admin") {
            toast.error("You are not authorized as a Travel Partner.");
            return;
          }
        }

        /* ================= CORPORATE LOGIN ================= */
        if (role === "corporate") {
          if (data.user.role === "admin") {
            toast.error("Admins cannot log in as Corporate users.");
            return;
          }

          if (data.user.role !== "corporate") {
            toast.info("Request corporate access to continue.");
            return navigate("/profile?redirectTo=corporate-request");
          }
        }

        /* ================= USER LOGIN ================= */
        if (role === "user") {
          if (data.user.role !== "user") {
            toast.error("Invalid login method.");
            return;
          }
        }

        /* ================= SUCCESS ================= */
        login(data.user);
        toast.success("Logged in!");
        navigate("/profile");
      }

      else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };


  return (
    <div
      className="
        flex items-center justify-center min-h-screen 
        bg-yellow-50 text-gray-900
        [[data-theme=dark]_&]:bg-gray-900 
        [[data-theme=dark]_&]:text-gray-100 
        transition-colors duration-500
        px-4 sm:px-6 md:px-8
        py-8 sm:py-12
      "
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="w-full max-w-md 
                   p-6 sm:p-8 md:p-10
                   rounded-2xl shadow-lg border
                   bg-white/70 dark:bg-gray-800/70 backdrop-blur-md"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center 
                       mb-4 sm:mb-6 text-yellow-400">
          Login with Email
        </h2>

        {errorMsg && (
          <p className="mb-3 sm:mb-4 text-center text-red-400 font-medium text-sm sm:text-base">
            {errorMsg}
          </p>
        )}

        {step === 1 && (
          <>
            <label className="text-white block mb-2 font-medium text-sm sm:text-base">
              Email Address
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-white w-full 
                         p-2.5 sm:p-3 
                         text-sm sm:text-base
                         rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-transparent focus:ring-2 focus:ring-yellow-400 outline-none 
                         mb-3 sm:mb-4"
            />

            <button
              onClick={handleSendOtp}
              disabled={sending}
              className="cursor-pointer w-full 
                         py-2.5 sm:py-3 
                         text-sm sm:text-base
                         bg-yellow-400 text-black font-semibold rounded-lg 
                         hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] 
                         transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label className="text-white block mb-2 font-medium text-sm sm:text-base">
              Enter OTP
            </label>
            <input
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="text-white w-full 
                         p-2.5 sm:p-3 
                         text-sm sm:text-base
                         rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-transparent focus:ring-2 focus:ring-yellow-400 outline-none 
                         mb-3 sm:mb-4"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={verifying || resending}
              className="cursor-pointer w-full 
                         py-2.5 sm:py-3 
                         text-sm sm:text-base
                         bg-yellow-400 text-black font-semibold rounded-lg 
                         hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] 
                         transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="flex flex-col sm:flex-row justify-between 
                            gap-2 sm:gap-0
                            mt-3 sm:mt-4 text-xs sm:text-sm">
              <button
                onClick={() => {
                  setStep(1);
                  setOtp("");
                }}
                className="cursor-pointer text-gray-600 dark:text-gray-300 
                           hover:text-yellow-400 transition-colors
                           text-center sm:text-left"
              >
                Change Email
              </button>

              <button
                disabled={timer > 0 || verifying}
                onClick={handleResendOtp}
                className="cursor-pointer text-gray-600 dark:text-gray-300 
                           hover:text-yellow-400 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors
                           text-center sm:text-right"
              >
                {resending
                  ? "Resending..."
                  : timer > 0
                    ? `Resend OTP in ${timer}s`
                    : "Resend OTP"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Login;