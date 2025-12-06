import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  logout,
  setOnlineUser,
  setSocketConnection,
  setUser,
} from "../redux/userSlice";
import Sidebar from "../components/Sidebar";
import logo from "../assets/Middlelogo.png";
import io from 'socket.io-client'


const Home = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const fetchUserDetails = async () => {
    if (isLoadingUser) return;
    setIsLoadingUser(true);

    try {
      const URL = `${import.meta.env.VITE_APP_BACKEND_URL}/api/user-details`;
      const response = await axios({
        url: URL,
        withCredentials: true,
      });

      dispatch(setUser(response.data.data));

      if (response.data.data.logout) {
        dispatch(logout());
        navigate("/email");
      }
    } catch (error) {
      //.log("error", error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  /***socket connection */
  useEffect(()=>{
    const token = localStorage.getItem('token')
    //.log("🔑 Token from localStorage:", token)  // ADD THIS
    
    const socketConnection = io(import.meta.env.VITE_APP_BACKEND_URL,{
      auth : {
        token : token  // Change from localStorage.getItem('token') to just token
      },
    })
    
    socketConnection.on('onlineUser',(data)=>{
      //.log(data)
      dispatch(setOnlineUser(data))
    })
    
    dispatch(setSocketConnection(socketConnection))
    
    return ()=>{
      socketConnection.disconnect()
    }
},[])


  const basePath = location.pathname === "/";

  return (
    <div className="flex lg:flex-row h-screen max-h-screen">

      {/** ---------------------------------------------------
           MOBILE (<1024px)
           Show only <Outlet/> except on /
      ----------------------------------------------------- */}
      <div className="lg:hidden w-full h-full">
        {basePath ? (
          <Sidebar />
        ) : (
          <Outlet />
        )}
      </div>

      {/** ---------------------------------------------------
            DESKTOP (>=1024px)
      ----------------------------------------------------- */}
      <div className="hidden lg:flex flex-row gap-1 w-full h-full">

        {/* Sidebar visible only on desktop */}
        <section className={`bg-amber-500 ${!basePath && "hidden"} lg:block`}>
          <Sidebar />
        </section>

        {/* Chat messages */}
        <section className={`${basePath && "hidden"} w-full`}>
          <Outlet />
        </section>

        {/* Logo right section */}
        <div
          className={`justify-center w-full items-center bg-black flex-col gap-2 
            ${!basePath ? "hidden" : "lg:flex"}
        `}
        >
          <img src={logo} width={450} alt="logo" className=" "/>
          
        </div>
      </div>
    </div>
  );
};

export default Home;
