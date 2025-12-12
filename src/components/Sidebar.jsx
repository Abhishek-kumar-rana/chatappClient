import React, { useEffect, useState } from "react";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import Avatar from "./Avatar";
import { useDispatch, useSelector } from "react-redux";
import EditUserDetails from "./EditUserDetails";
import Divider from "./Divider";
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from "./SearchUser";
import { FaImage, FaVideo } from "react-icons/fa6";
import { logout } from "../redux/userSlice";

const Sidebar = () => {
  const user = useSelector((state) => state?.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [allUser, setAllUser] = useState([]);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("sidebar", user._id);

      socketConnection.on("conversation", (data) => {
        const conversationUserData = data.map((c) => {
          if (c?.sender?._id === c?.receiver?._id) {
            return { ...c, userDetails: c?.sender };
          } else if (c?.receiver?._id !== user?._id) {
            return { ...c, userDetails: c.receiver };
          } else {
            return { ...c, userDetails: c.sender };
          }
        });

        setAllUser(conversationUserData);
      });
    }
  }, [socketConnection, user]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/email");
  };

  return (
    <div className="w-full h-full flex bg-[#111114] text-gray-200">

      {/* LEFT TOOLBAR */}
      <div className="bg-[#151518] w-14 h-full border-r border-[#2b2b30] py-5 flex flex-col justify-between shadow-xl">

        <div>
          {/* CHAT ICON */}
          <NavLink
            title="Chats"
            className={({ isActive }) =>
              `w-12 h-12 flex justify-center items-center mx-auto rounded-xl cursor-pointer 
              transition hover:bg-[#1f1f22] ${
                isActive ? "bg-[#1f1f22]" : ""
              }`
            }
          >
            <IoChatbubbleEllipses size={22} className="text-amber-300" />
          </NavLink>

          {/* ADD FRIEND */}
          <div
            title="Add friend"
            onClick={() => setOpenSearchUser(true)}
            className="w-12 h-12 mx-auto mt-3 flex justify-center items-center rounded-xl cursor-pointer 
                       hover:bg-[#1f1f22] transition"
          >
            <FaUserPlus size={18} className="text-amber-300" />
          </div>
        </div>

        {/* BOTTOM — PROFILE & LOGOUT */}
        <div className="flex flex-col items-center">
          <button
            className="mx-auto rounded-full"
            title={user?.name}
            onClick={() => setEditUserOpen(true)}
          >
            <Avatar
              width={42}
              height={42}
              name={user?.name}
              imageUrl={user?.profile_pic}
              userId={user?._id}
            />
          </button>

          <button
            title="Logout"
            onClick={handleLogout}
            className="w-12 h-12 mt-3 flex justify-center items-center cursor-pointer rounded-xl 
                       hover:bg-[#1f1f22] transition"
          >
            <BiLogOut size={22} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* RIGHT SIDE — USER LIST */}
      <div className="w-full lg:w-[300px] bg-[#0d0d0f] flex flex-col">

        <div className="h-16 flex items-center px-4 border-b border-[#2b2b30]">
          <h2 className="text-lg font-semibold text-amber-300 tracking-wide">
            Messages
          </h2>
        </div>

        {/* USER LIST */}
        <div className="h-[calc(100vh-65px)] overflow-y-auto px-2 py-2">

          {allUser.length === 0 && (
            <div className="mt-16">
              <div className="flex justify-center text-gray-500 mb-2">
                <FiArrowUpLeft size={50} />
              </div>
              <p className="text-center text-gray-500">
                Start chatting by selecting a user
              </p>
            </div>
          )}

          {allUser.map((conv) => (
            <NavLink
              to={"/" + conv?.userDetails?._id}
              key={conv?._id}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg my-1 cursor-pointer transition 
                 border border-transparent 
                 ${isActive ? "bg-[#27272a] border-amber-300" : "hover:bg-[#1a1a1d]"}`
              }
            >
              <Avatar
                imageUrl={conv?.userDetails?.profile_pic}
                name={
                    conv?.userDetails?.name
                    }
                width={45}
                height={45}
              />

              <div className="flex-1">
                <h3 className="font-semibold text-gray-200 line-clamp-1">
                  {user?._id === conv?.userDetails?._id
                        ? `${conv?.userDetails?.name} (You)`
                        : conv?.userDetails?.name}
                </h3>

                <div className="text-xs text-gray-400 flex items-center gap-2">
                  {conv?.lastMsg?.imageUrl && (
                    <span className="flex items-center gap-1">
                      <FaImage size={12} /> Image
                    </span>
                  )}
                  {conv?.lastMsg?.videoUrl && (
                    <span className="flex items-center gap-1">
                      <FaVideo size={12} /> Video
                    </span>
                  )}
                  <span className="line-clamp-1">{conv?.lastMsg?.text}</span>
                </div>
              </div>

              {Boolean(conv?.unseenMsg) && (
                <span className="text-xs min-w-6 min-h-6 px-2 py-1 flex justify-center items-center bg-amber-300 text-black font-bold rounded-full">
                  {conv?.unseenMsg}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* EDIT PROFILE */}
      {editUserOpen && <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />}

      {/* SEARCH USER */}
      {openSearchUser && <SearchUser onClose={() => setOpenSearchUser(false)} />}
    </div>
  );
};

export default Sidebar;
