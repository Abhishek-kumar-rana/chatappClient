import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { PiUserCircle } from "react-icons/pi";
import { toast } from "sonner";

const CheckEmailPage = () => {
  const [data, setData] = useState({ email: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const URL = `${import.meta.env.VITE_APP_BACKEND_URL}/api/email`;
    //.log(URL);

    try {
      const response = await axios.post(URL, data);
      toast.success(response.data.message);

      if (response.data.success) {
        setData({ email: "" });

        navigate("/password", {
          state: response?.data?.data,
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-12 
                    bg-[#0a0a0c] text-gray-100 overflow-hidden relative">

      {/* Glow Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00000055] to-transparent pointer-events-none"></div>

      <div className="w-full max-w-sm 
                      bg-[#16161a]/90 backdrop-blur-xl 
                      border border-[#2e2e33] 
                      p-6 rounded-2xl shadow-[0_0_25px_#000]
                      relative overflow-hidden">

        {/* Golden Glow Ring */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl"></div>

        {/* ICON */}
        <div className="w-fit mx-auto mb-3">
          <PiUserCircle 
            size={90} 
            className="text-amber-300 drop-shadow-[0_0_10px_#fbbf24aa]" 
          />
        </div>

        {/* TITLE */}
        <h3 className="text-xl font-bold text-center mb-5 
                       text-amber-300 tracking-wide drop-shadow-[0_0_8px_#fbbf24aa]">
          Check Your Email
        </h3>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="grid gap-4">

          {/* EMAIL FIELD */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-300">
              Email
            </label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="bg-[#0f0f12] px-3 py-2 rounded-md border border-[#2f2f34]
                         focus:ring-2 focus:ring-amber-300 focus:border-amber-300
                         focus:outline-none transition text-gray-100"
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>

          {/* BUTTON */}
          <button
            className={`mt-4 w-full py-2 
                        bg-amber-300 text-black font-semibold 
                        rounded-md shadow-md shadow-amber-500/20
                        transition-all duration-200
                       ${
                         loading
                           ? "opacity-50 cursor-not-allowed"
                           : "hover:bg-amber-400 hover:shadow-amber-400/30"
                       }`}
            disabled={loading}
          >
            {loading ? "Please wait..." : "Next"}
          </button>
        </form>

        {/* REGISTER LINK */}
        <p className="text-center mt-4 text-gray-400 text-sm">
          New User?{" "}
          <Link
            to="/register"
            className="text-amber-300 hover:underline hover:text-amber-400 transition"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CheckEmailPage;
