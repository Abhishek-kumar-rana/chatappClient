import React, { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import Divider from "./Divider";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import uploadFile from "../helper/UploadFile";
import { toast } from "sonner";

const EditUserDetails = ({ onClose, user }) => {
  const [data, setData] = useState({
    name: user?.name,
    profile_pic: user?.profile_pic,
  });

  const uploadPhotoRef = useRef();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      ...user,
    }));
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenUploadPhoto = (e) => {
    e.preventDefault();
    uploadPhotoRef.current.click();
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const uploadPhoto = await uploadFile(file);

    setData((prev) => ({
      ...prev,
      profile_pic: uploadPhoto?.url,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;
  setLoading(true);

  try {
    const URL = `${import.meta.env.VITE_APP_BACKEND_URL}/api/update-user`;

    // 👇 Only include simple fields
    const payload = {
      name: data.name,
      profile_pic: data.profile_pic,
      // add more primitive fields here if needed
    };

    const response = await axios({
      method: "post",
      url: URL,
      data: payload,
      withCredentials: true,
    });

    toast.success(response?.data?.message);

    if (response.data.success) {
      dispatch(setUser(response.data.data));
      onClose();
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || "Error");
    console.error("Error in updating user details:", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 flex justify-center items-center z-20 
                    bg-black/60 backdrop-blur-sm">

      <div className="w-full max-w-sm bg-[#16161a] text-gray-200 relative 
                      border border-[#303036] rounded-2xl shadow-2xl p-6">

        {/* Glow Orbs */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-amber-400/20 rounded-full blur-xl"></div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold text-amber-300 tracking-wide drop-shadow-[0_0_6px_#fbbf24aa]">
          Profile Details
        </h2>
        <p className="text-sm text-gray-400">Edit user details</p>

        {/* FORM */}
        <form className="grid gap-4 mt-4" onSubmit={handleSubmit}>

          {/* NAME */}
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm text-gray-300">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={data.name}
              onChange={handleOnChange}
              className="bg-[#0f0f12] px-3 py-2 rounded-md border border-[#2f2f34]
                         focus:outline-none focus:ring-2 focus:ring-amber-300 text-gray-100"
            />
          </div>

          {/* PHOTO */}
          <div>
            <label className="text-sm text-gray-300">Photo</label>
            <div className="flex items-center gap-4 mt-2">
              <Avatar
                width={45}
                height={45}
                imageUrl={data?.profile_pic}
                name={data?.name}
              />

              <button
                onClick={handleOpenUploadPhoto}
                className="px-3 py-1 rounded-md border border-amber-300 text-amber-300 
                           hover:bg-amber-300 hover:text-black transition shadow-sm"
              >
                Change Photo
              </button>

              <input
                type="file"
                className="hidden"
                id="profile_pic"
                onChange={handleUploadPhoto}
                ref={uploadPhotoRef}
              />
            </div>
          </div>

          <Divider />

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-1 rounded-md border border-gray-500 text-gray-300 
                         hover:bg-gray-700 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-1 rounded-md bg-amber-300 text-black font-semibold
                transition shadow-md shadow-amber-500/20
                ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-amber-400 hover:shadow-amber-400/30"
                }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditUserDetails);
