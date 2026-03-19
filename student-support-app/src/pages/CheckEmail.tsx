import { useNavigate } from "react-router-dom";

export default function CheckEmail() {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf4]">

      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">

        <h2 className="text-2xl font-bold text-purple-600 mb-4">
          📩 Check your email
        </h2>

        <p className="text-gray-600 mb-6">
          We’ve sent you a verification link.  
          Please check your university email and verify your account before logging in.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition"
        >
          Go to Login
        </button>

      </div>

    </div>
  );
}