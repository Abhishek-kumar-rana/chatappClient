import  { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Avatar from "../components/Avatar";
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/userSlice';

const CheckPasswordPage = () => {
  const [data, setData] = useState({
    password: "",
    userId: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location?.state?.name) {
      // navigate("/email");
    }
  }, []);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    const URL = `${import.meta.env.VITE_APP_BACKEND_URL}/api/password`;

    try {
      const response = await axios({
        method: "post",
        url: URL,
        data: {
          userId: location?.state?._id,
          password: data.password,
        },
        withCredentials: true,
      });

      toast.success(response.data.message);

      if (response.data.success) {
        dispatch(setToken(response?.data?.token));
        localStorage.setItem("token", response?.data?.token);

        setData({ password: "" });

        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-12 bg-[#0a0a0c] text-gray-100 relative overflow-hidden">

      {/* Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00000055] to-transparent pointer-events-none"></div>

      <div className="w-full max-w-sm 
                      bg-[#16161a]/90 backdrop-blur-xl 
                      border border-[#2e2e33] 
                      p-6 rounded-2xl shadow-[0_0_25px_#000]
                      relative overflow-hidden">

        {/* Magic Glow Orbs */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl"></div>

        {/* NAME OR AVATAR */}
        <div className="w-fit mx-auto mb-4 text-center">
          {/* Avatar component if you want later */}
           <Avatar
                  width={70}
                  height={70}
                  name={location?.state?.name}
                  imageUrl={location?.state?.profile_pic}
                />
          <h2 className="text-lg font-semibold text-amber-300 tracking-wide drop-shadow-[0_0_6px_#fbbf24aa]">
            {location?.state?.name}
          </h2>
        </div>

        {/* FORM */}
        <form className="grid gap-4 mt-3" onSubmit={handleSubmit}>
          
          {/* PASSWORD */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-300">
              Password
            </label>

            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="bg-[#0f0f12] px-3 py-2 rounded-md border border-[#2f2f34]
                         focus:ring-2 focus:ring-amber-300 focus:border-amber-300
                         focus:outline-none transition text-gray-100"
              value={data.password}
              onChange={handleOnChange}
              required
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            disabled={loading}
            className={`mt-4 w-full py-2 bg-amber-300 text-black font-semibold 
                        rounded-md shadow-md shadow-amber-500/20
                        transition-all duration-200
                        ${
                          loading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-amber-400 hover:shadow-amber-400/30"
                        }`}
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        {/* FORGOT PASSWORD */}
        <p className="text-center mt-4 text-gray-400 text-sm">
          <Link
            to={"/forgot-password"}
            className="text-amber-300 hover:underline hover:text-amber-400 transition"
          >
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CheckPasswordPage;
