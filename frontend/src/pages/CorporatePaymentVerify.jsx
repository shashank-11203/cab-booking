import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CorporatePaymentVerify() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/bookings");
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-semibold">
        Verifying payment… Redirecting to bookings
      </p>
    </div>
  );
}