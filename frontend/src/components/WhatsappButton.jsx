import { useLocation } from "react-router-dom";
import { ImWhatsapp } from "react-icons/im";

export default function WhatsAppButton() {
    const { pathname } = useLocation();

    const hiddenRoutes = [
        "/admin",
    ];

    const shouldHide = hiddenRoutes.some((route) => pathname.startsWith(route));
    if (shouldHide) return null;

    const sendMessage = () => {
        const message = encodeURIComponent("Hello, I need help regarding cab booking.");
        const url = `https://wa.me/${import.meta.env.VITE_ADMIN_WHATSAPP}?text=${message}`;
        window.open(url, "_blank");
    };

    return (
        <button
            onClick={sendMessage}
            className="
        fixed bottom-6 right-6 z-[200]
        bg-green-500 hover:bg-green-600 
        text-white shadow-xl rounded-full
        w-14 h-14 flex items-center justify-center 
        cursor-pointer transition-all duration-300
        backdrop-blur-md 
      "
        >
            <ImWhatsapp size={30} />
        </button>
    );
}