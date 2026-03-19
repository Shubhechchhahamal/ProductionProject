import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4]">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <h2 className="text-xl font-semibold text-purple-600">
          ✅ Email verified! Redirecting...
        </h2>
      </div>
    </div>
  );
}