import React, { useState } from 'react'
import { IoClose } from "react-icons/io5"
import { Link } from 'react-router-dom';
import uploadFile from '../helper/UploadFile';
import {  toast } from 'sonner';
import axios from 'axios'


function RegisterPage() {
  const [data, setdata] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: ""
  });

  const [uploadphoto, setuploadphoto] = useState("");
  const [uploading, setUploading] = useState(false); // 🌟 loader state
  const [buttonDissable,setbuttonDissable]=useState(false);

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setUploading(true); // show loader

    const uploaded = await uploadFile(file);

    setUploading(false); // hide loader

    setuploadphoto(file);
    setdata(prev => ({ ...prev, profile_pic: uploaded?.url }));
  };

  const removeUploadPhoto = () => setuploadphoto(null);

  const handleOnChange = (e) => {
    setbuttonDissable(false)
    const { name, value } = e.target;
    setdata(prev => ({ ...prev, [name]: value }));

  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const URL= `${import.meta.env.VITE_APP_BACKEND_URL}/api/register`
    try{
      setbuttonDissable(false);
      const response = await axios .post(URL,data);
      //.log(response);
      const tt=response.data.message;
      //.log(tt);
      toast.success(tt);
      setbuttonDissable(true);
    }catch(error){
      //.log(error);
      toast.error(error?.response?.data?.message);
      setbuttonDissable(false);
      // toast('My first toast')
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-10 bg-[#0d0d0f] text-gray-100">
      <div className="w-full max-w-sm bg-[#151518] border border-[#2b2b30] p-6 rounded-xl shadow-xl">

        <h3 className="text-xl font-semibold text-center mb-2 text-amber-300 tracking-wide">
          Welcome to Chat App!
        </h3>

        <form onSubmit={handleSubmit}>

          {/* NAME */}
          <div className="flex flex-col gap-1 mt-4">
            <label htmlFor="name" className="text-sm text-gray-300">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              className="bg-[#111114] px-3 py-2 rounded-md border border-[#2b2b30] focus:ring-2 focus:ring-amber-300 focus:outline-none"
              value={data.name}
              onChange={handleOnChange}
            />
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1 mt-4">
            <label htmlFor="email" className="text-sm text-gray-300">Email</label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="bg-[#111114] px-3 py-2 rounded-md border border-[#2b2b30] focus:ring-2 focus:ring-amber-300 focus:outline-none"
              value={data.email}
              onChange={handleOnChange}
            />
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-1 mt-4">
            <label htmlFor="password" className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="bg-[#111114] px-3 py-2 rounded-md border border-[#2b2b30] focus:ring-2 focus:ring-amber-300 focus:outline-none"
              value={data.password}
              onChange={handleOnChange}
            />
          </div>

          {/* PROFILE UPLOAD */}
          <div className="flex flex-col gap-1 mt-4">
            <label className="text-sm text-gray-300">Profile Picture</label>

            <div
              className="p-4 bg-[#1b1b20] rounded-md border border-[#2b2b30] hover:border-amber-300 transition cursor-pointer flex justify-between items-center"
              onClick={() => document.getElementById("profile_pic").click()}
            >
              {/* TEXT / LOADER / FILENAME */}
              <p className="text-sm text-gray-400 max-w-[200px] truncate flex items-center gap-2">

                {/* ⏳ LOADING SPINNER */}
                {uploading && (
                  <span className="animate-spin h-4 w-4 border-2 border-amber-300 border-t-transparent rounded-full"></span>
                )}

                {/* NAME / DEFAULT */}
                {!uploading && (
                  uploadphoto?.name ? (
                    <span className="text-amber-300 underline">{uploadphoto.name}</span>
                  ) : (
                    "Upload your picture"
                  )
                )}
              </p>

              {/* REMOVE BUTTON */}
              {!uploading && uploadphoto && (
                <button
                  className="hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUploadPhoto();
                  }}
                >
                  <IoClose size={22} />
                </button>
              )}
            </div>

            <input
              id="profile_pic"
              name="profile_pic"
              type="file"
              className="hidden"
              onChange={handleUploadPhoto}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            className="mt-6 w-full py-2 bg-amber-300 text-black font-semibold rounded-md shadow-md hover:bg-amber-400 transition"
            disabled={buttonDissable}
          >
            Register
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400 text-sm">
          Already have an account?{" "}
          <Link to="/email" className="text-amber-300 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default RegisterPage;
