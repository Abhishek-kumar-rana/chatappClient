import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft, FaPlus, FaImage, FaVideo } from "react-icons/fa6";
import { IoClose, IoHappyOutline } from "react-icons/io5";
import Loading from "./Loading";
import backgroundImage from "../assets/wallapaper.jpeg";
import { IoMdSend } from "react-icons/io";
import moment from "moment";
import uploadFile from "../helper/UploadFile";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";

const MessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const user = useSelector((state) => state?.user);

  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: "",
  });

  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // New state for reactions
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [showReactionDetails, setShowReactionDetails] = useState(null);

  const currentMessage = useRef(null);

  const [isTyping, setIsTyping] = useState(false);
const typingTimeoutRef = useRef(null);


  // Common reaction emojis (WhatsApp style)
  const quickReactions = ["❤️", "😂", "😮", "😢", "🙏", "👍"];

  // Scroll to bottom ONLY when number of messages changes
  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "instant",
        block: "end",
      });
    }
  }, [allMessage.length]);

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload((p) => !p);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const uploadPhoto = await uploadFile(file);
      setMessage((p) => ({ ...p, imageUrl: uploadPhoto.url }));
    } catch (err) {
      //.error(err);
    } finally {
      setLoading(false);
      setOpenImageVideoUpload(false);
    }
  };

  const handleClearUploadImage = () =>
    setMessage((p) => ({ ...p, imageUrl: "" }));

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const uploadPhoto = await uploadFile(file);
      setMessage((p) => ({ ...p, videoUrl: uploadPhoto.url }));
    } catch (err) {
      //.error(err);
    } finally {
      setLoading(false);
      setOpenImageVideoUpload(false);
    }
  };

  const handleClearUploadVideo = () =>
    setMessage((p) => ({ ...p, videoUrl: "" }));

  // Socket listeners
  useEffect(() => {
    if (!socketConnection || !params?.userId) return;

    //.log("🔌 Socket ready in MessagePage, setting up listeners");

    const handleMessageUser = (data) => {
      //.log("message-user data:", data);
      setDataUser(data);
    };

    const handleMessage = (data) => {
      setAllMessage(data);
    };

    const handleMessageDeleted = (msgId) => {
      setAllMessage((prev) => prev.filter((m) => m._id !== msgId));
      toast.success("Message deleted");
    };

    // listener for reaction updates
    const handleReactionUpdate = (data) => {
      setAllMessage((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, reactions: data.reactions }
            : msg
        )
      );
    };

       const handleTyping = (data) => {
  // Show typing ONLY if typing user is the one you are chatting with
  if (data.sender === params.userId) {
    setIsTyping(true);
  }
};

const handleStopTyping = (data) => {
  if (data.sender === params.userId) {
    setIsTyping(false);
  }
};


    socketConnection.on("typing", handleTyping);
    socketConnection.on("stop-typing", handleStopTyping);


    // emit after listeners set
    socketConnection.emit("message-page", params.userId);
    socketConnection.emit("seen", params.userId);

    socketConnection.on("message-user", handleMessageUser);
    socketConnection.on("message", handleMessage);
    socketConnection.on("message-deleted", handleMessageDeleted);
    socketConnection.on("reaction-update", handleReactionUpdate);

    return () => {
      socketConnection.off("message-user", handleMessageUser);
      socketConnection.off("message", handleMessage);
      socketConnection.off("message-deleted", handleMessageDeleted);
      socketConnection.off("reaction-update", handleReactionUpdate);
      socketConnection.off("typing", handleTyping);
      socketConnection.off("stop-typing", handleStopTyping);

    };
  }, [socketConnection, params?.userId]);

  const handleOnChange = (e) => {
  const { value } = e.target;
  setMessage((p) => ({ ...p, text: value }));

  if (!socketConnection) return;

  socketConnection.emit("typing", {
    sender: user?._id,
    receiver: params.userId,
  });

  // Clear old timeout
  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

  // Stop typing after 1.2 sec of no typing
  typingTimeoutRef.current = setTimeout(() => {
    socketConnection.emit("stop-typing", {
      sender: user?._id,
      receiver: params.userId,
    });
  }, 2000);
};


  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => ({
      ...prev,
      text: prev.text + (emojiData?.emoji || ""),
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        socketConnection.emit("new message", {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id,
        });
        setMessage({ text: "", imageUrl: "", videoUrl: "" });
      }
    }
  };

  const handleDeleteMessage = (msgId) => {
    if (socketConnection) {
      socketConnection.emit("delete-message", {
        messageId: msgId,
        userId: user?._id,
      });
    }
    setAllMessage((prev) => prev.filter((m) => m._id !== msgId));
    setOpenMenuId(null);
  };

  // Reaction handlers
  const handleReaction = (msgId, emoji) => {
    if (socketConnection) {
      socketConnection.emit("add-reaction", {
        messageId: msgId,
        userId: user?._id,
        emoji: emoji,
      });
    }

    // Optimistic UI update
    setAllMessage((prev) =>
      prev.map((msg) => {
        if (msg._id === msgId) {
          const reactions = msg.reactions || {};
          const userReactions = reactions[user?._id] || [];

          // Toggle reaction
          let newUserReactions;
          if (userReactions.includes(emoji)) {
            newUserReactions = userReactions.filter((e) => e !== emoji);
          } else {
            newUserReactions = [...userReactions, emoji];
          }

          return {
            ...msg,
            reactions: {
              ...reactions,
              [user?._id]: newUserReactions,
            },
          };
        }
        return msg;
      })
    );

    setShowReactionPicker(null);
  };

  // Get reaction summary for display
  const getReactionSummary = (reactions) => {
    if (!reactions) return [];

    const emojiCount = {};
    Object.values(reactions).forEach((userReactions) => {
      userReactions.forEach((emoji) => {
        emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
      });
    });

    return Object.entries(emojiCount)
      .sort((a, b) => b[1] - a[1])
      .map(([emoji, count]) => ({ emoji, count }));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".msg-menu")) {
        setOpenMenuId(null);
      }
      if (
        !e.target.closest(".emoji-picker-container") &&
        !e.target.closest(".emoji-toggle-btn")
      ) {
        setShowEmojiPicker(false);
      }
      if (
        !e.target.closest(".reaction-picker") &&
        !e.target.closest(".reaction-btn")
      ) {
        setShowReactionPicker(null);
      }
      if (!e.target.closest(".reaction-details")) {
        setShowReactionDetails(null);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!socketConnection) {
    return (
      <div>
        <header
          className="sticky top-0 z-30 h-16 px-4 flex items-center justify-between"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,8,8,0.95), rgba(12,12,12,0.98))",
            borderBottom: "2px solid rgba(219,185,90,0.4)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.8)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="flex items-center gap-4">
            <Link
              to={"/"}
              className="lg:hidden text-[#f1d7a8] transform hover:scale-105 transition"
            >
              <FaAngleLeft
                size={24}
                className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]"
              />
            </Link>

            <div className="p-[2px] rounded-full bg-gradient-to-br from-[#f1d7a8] via-[#d4af37] to-black">
              <div className="p-1 rounded-full bg-black">
                <Avatar
                  width={45}
                  height={45}
                  imageUrl={dataUser?.profile_pic}
                  name={dataUser?.name
                    }
                  userId={dataUser?._id}
                />
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-[#fce8a9] tracking-widest drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] uppercase">
                {user?._id === dataUser?._id
                        ? `${dataUser?.name} (You)`
                        : dataUser?.name || "—"}
              </h3>
              <p className="text-xs mt-0.5">
                {dataUser?.online ? (
                  <span className="text-green-400">● online</span>
                ) : (
                  <span className="text-slate-400">offline</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              title="More"
              className="p-2 rounded-full hover:bg-white/5 transition shadow-sm border border-[#d4af37]/40"
            >
              <HiDotsVertical size={20} className="text-[#f1d7a8]" />
            </button>
          </div>
        </header>

        <div className="h-screen w-full flex items-center justify-center bg-black text-[#f5e6c8]">
          <div className="text-center">
            <p className="text-lg font-semibold">Connecting to chat...</p>
            <p className="text-sm opacity-70 mt-2">Please wait a moment</p>
            <div className="mt-4">
              <Loading />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundBlendMode: "overlay",
      }}
      className="min-h-screen h-screen w-full bg-cover bg-center text-[#f5e6c8] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/70 to-black/90 pointer-events-none"></div>

      {/* Header */}
      <header
        className="sticky top-0 z-30 h-16 px-4 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,8,8,0.95), rgba(12,12,12,0.98))",
          borderBottom: "2px solid rgba(219,185,90,0.4)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.8)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            to={"/"}
            className="lg:hidden text-[#f1d7a8] transform hover:scale-105 transition"
          >
            <FaAngleLeft
              size={24}
              className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]"
            />
          </Link>

          <div className="p-[2px] rounded-full bg-gradient-to-br from-[#f1d7a8] via-[#d4af37] to-black">
            <div className="p-1 rounded-full bg-black">
              <Avatar
                width={45}
                height={45}
                imageUrl={dataUser?.profile_pic}
                name={dataUser?.name}
                userId={dataUser?._id}
              />
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-lg text-[#fce8a9] tracking-widest drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] uppercase">
              {(user?._id === dataUser?._id
                        ? `${dataUser?.name} (You)`
                        : dataUser?.name )|| "—"}
            </h3>
            <p className="text-xs mt-0.5">
              {dataUser?.online ? (
                <span className="text-green-400">● online</span>
              ) : (
                <span className="text-slate-400">offline</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            title="More"
            className="p-2 rounded-full hover:bg-white/5 transition shadow-sm border border-[#d4af37]/40"
          >
            <HiDotsVertical size={20} className="text-[#f1d7a8]" />
          </button>
        </div>
      </header>

      {/* Chat area */}
      <section className="relative h-[calc(100vh-160px)] overflow-y-auto py-4 px-1 mb-2 scrollbar no-scrollbar scrollbar-thin scrollbar-thumb-[#4d3d2b] scrollbar-track-transparent">
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          {allMessage?.length === 0 && (
            <div className="mt-24 text-center text-[#d6b985] opacity-80">
              <div className="">
                <Loading  />
              </div>
              <div className="inline-block px-6 py-4 rounded-lg bg-black/60 border border-[#d4af37]/60 shadow-lg">
                <p className="text-lg font-semibold">No messages yet</p>
                <p className="text-sm mt-1">
                  Send the first message to start a legend.
                </p>
              </div>
            </div>
          )}

          {allMessage.map((msg, index) => {
            const mine = user?._id === msg?.msgByUserId;
            const reactionSummary = getReactionSummary(msg.reactions);
            const hasReactions = reactionSummary.length > 0;
            const isLast = index === allMessage.length - 1;

            return (
              <div
                key={msg._id || Math.random()}
                ref={isLast ? currentMessage : null}
                className={`flex ${
                  mine ? "justify-end" : "justify-start"
                } schibsted-grotesk-font`}
              >
                <div className="relative group max-w-[80%] sm:max-w-[70%] md:max-w-[60%]">
                  <div
                    className={`rounded-2xl px-4 py-1 shadow-lg transition-transform transform ${
                      mine
                        ? "bg-gradient-to-br from-[#f1d7a8] via-[#d4af37] to-[#b8860b] text-black"
                        : "bg-gradient-to-br from-[#141414] via-[#1f1f1f] to-[#050505] text-[#ffecc7]"
                    }`}
                    style={{
                      border: mine
                        ? "1px solid rgba(212,175,55,0.18)"
                        : "1px solid rgba(220,220,220,0.18)",
                    }}
                  >
                    {/* media */}
                    {msg?.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="img"
                        className="rounded-md mb-2 object-contain max-h-64 w-full"
                      />
                    )}

                    {msg?.videoUrl && (
                      <video
                        src={msg.videoUrl}
                        controls
                        className="rounded-md mb-2 object-contain max-h-64 w-full"
                      />
                    )}

                    {/* text + menu */}
                    <div className="flex gap-2 justify-between items-start">
                      {msg.text && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words flex-1 overflow-wrap-anywhere">
                          {msg.text}
                        </p>
                      )}

                      {mine && (
                        <div className="relative msg-menu ml-2 flex-shrink-0">
                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === msg._id ? null : msg._id
                              )
                            }
                            className="p-1 rounded-full hover:bg-black/10 focus:outline-none"
                          >
                            <HiDotsVertical
                              size={18}
                              className={mine ? "text-black" : "text-[#ffecc7]"}
                            />
                          </button>

                          {openMenuId === msg._id && (
                            <div className="absolute right-0 mt-1 w-32 bg-[#0b0b0b] border border-[#ff4d4f]/40 rounded-lg shadow-2xl overflow-hidden z-50">
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-600/30"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* time */}
                    <div
                      className={`text-[11px] opacity-70 mt-2 ${
                        mine ? "text-right text-black/70" : "text-right"
                      }`}
                    >
                      {moment(msg.createdAt).format("hh:mm A")}
                    </div>
                  </div>

                  {/* Reaction button (shows on hover) */}
                  <button
                    className={`reaction-btn absolute ${
                      mine ? "-left-10" : "-right-10"
                    } top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity bg-black/80 border border-[#d4af37]/60 rounded-full p-1.5 shadow-lg hover:scale-110`}
                    onClick={() =>
                      setShowReactionPicker(
                        showReactionPicker === msg._id ? null : msg._id
                      )
                    }
                    title="React"
                  >
                    <IoHappyOutline className="text-[#f1d7a8]" size={18} />
                  </button>

                  {/* Reaction picker */}
                  {showReactionPicker === msg._id && (
                    <div
                      className={`reaction-picker absolute ${
                        mine ? "right-0" : "left-0"
                      } -top-16 bg-black/95 border border-[#d4af37]/70 rounded-full px-3 py-2 shadow-2xl flex gap-2 z-50`}
                    >
                      {quickReactions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg._id, emoji)}
                          className="hover:scale-125 transition-transform text-xl p-1 hover:bg-white/10 rounded-full"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reaction display */}
                  {hasReactions && (
                    <div
                      className={`absolute ${
                        mine ? "left-2" : "right-2"
                      } -bottom-3 flex gap-1 cursor-pointer`}
                      onClick={() =>
                        setShowReactionDetails(
                          showReactionDetails === msg._id ? null : msg._id
                        )
                      }
                    >
                      <div className="bg-black/90 border border-[#d4af37]/50 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-lg">
                        {reactionSummary.slice(0, 3).map((r, i) => (
                          <span key={i} className="text-sm">
                            {r.emoji}
                          </span>
                        ))}
                        {reactionSummary.length > 0 && (
                          <span className="text-[10px] text-[#f1d7a8] ml-0.5">
                            {reactionSummary.reduce(
                              (sum, r) => sum + r.count,
                              0
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reaction details popup */}
                  {showReactionDetails === msg._id && hasReactions && (
                    <div
                      className={`reaction-details absolute ${
                        mine ? "left-2" : "right-2"
                      } -bottom-20 bg-[#0a0a0a] border border-[#d4af37]/70 rounded-lg shadow-2xl p-3 z-50 min-w-[200px]`}
                    >
                      <div className="text-xs text-[#f1d7a8] space-y-2">
                        {reactionSummary.map((r, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <span className="text-lg">{r.emoji}</span>
                            <span className="text-[#d6b985]">{r.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
       
        </div>

        {/* Image preview */}
        {message.imageUrl && (
          <div className="sticky bottom-28 mx-auto max-w-4xl px-4">
            <div className="relative rounded-lg p-3 bg-black/80 border border-[#d4af37]">
              <button
                onClick={handleClearUploadImage}
                className="absolute -top-3 -right-3 bg-black/80 rounded-full p-1 hover:bg-red-600"
              >
                <IoClose size={20} className="text-white" />
              </button>
              <img
                src={message.imageUrl}
                alt="preview"
                className="w-full rounded-md object-contain max-h-64"
              />
            </div>
          </div>
        )}

        {/* Video preview */}
        {message.videoUrl && (
          <div className="sticky bottom-28 mx-auto max-w-4xl px-4">
            <div className="relative rounded-lg p-3 bg-black/80 border border-[#d4af37] shadow-2xl">
              <button
                onClick={handleClearUploadVideo}
                className="absolute -top-3 -right-3 bg-black/80 rounded-full p-1 hover:bg-red-600"
              >
                <IoClose size={20} className="text-white" />
              </button>
              <video
                src={message.videoUrl}
                controls
                className="w-full rounded-md object-contain max-h-64"
              />
            </div>
          </div>
        )}

        {loading && (
          <div className="sticky bottom-28 flex justify-center py-4">
            <Loading />
          </div>
        )}
      </section>



        {/* ///////////// */}
          {/* typing indicator */}

          


      {/* Composer */}
      <section className="sticky bottom-0 z-40 px-4 pb-4 bg-transparent">
        <div className="max-w-5xl mx-auto relative">
        {isTyping && (
  <div className="absolute bottom-[30px] sm:bottom-[40px] left-0 w-full flex items-center justify-start gap-2 px-4 py-2 pointer-events-none z-40">
    <div className="flex items-center gap-2  bg-transparent    px-3 py-1 animate-pulse">
      <div className="w-2 h-2 bg-[#d4af37] rounded-full"></div>
      <div className="w-2 h-2 bg-[#d4af37] rounded-full"></div>
      <div className="w-2 h-2 bg-[#d4af37] rounded-full"></div>
      <span className="text-xs text-[#f1d7a8] opacity-80">typing...</span>
    </div>
  </div>
)}


          {/* Emoji picker dropdown */}
          {showEmojiPicker && (
            <div className="emoji-picker-container absolute bottom-20 right-20 bg-[#050505] border border-[#d4af37]/60 rounded-2xl shadow-2xl p-1 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                previewConfig={{ showPreview: false }}
                searchDisabled={false}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            
            {/* left controls */}
            <div className="relative">
              
              <button
                onClick={handleUploadImageVideoOpen}
                className="w-10 h-10 rounded-full bg-black border border-[#d4af37] flex items-center justify-center shadow-inner hover:scale-105 transition"
                title="Attach"
              >
                <FaPlus className="text-[#f1d7a8]" size={18} />
              </button>

              {openImageVideoUpload && (
                <div className="absolute bottom-14 left-0 w-44 bg-[#050505] border border-[#d4af37]/70 rounded-lg shadow-2xl p-2 text-[#f1d7a8]">
                  <label
                    htmlFor="uploadImage"
                    className="flex items-center gap-3 px-2 py-2 rounded hover:bg-white/5 cursor-pointer"
                  >
                    <FaImage /> <span>Image</span>
                  </label>
                  <label
                    htmlFor="uploadVideo"
                    className="flex items-center gap-3 px-2 py-2 rounded hover:bg-white/5 cursor-pointer"
                  >
                    <FaVideo /> <span>Video</span>
                  </label>

                  <input
                    id="uploadImage"
                    type="file"
                    className="hidden"
                    onChange={handleUploadImage}
                  />
                  <input
                    id="uploadVideo"
                    type="file"
                    className="hidden"
                    onChange={handleUploadVideo}
                  />
                </div>
              )}
            </div>

            {/* input + emoji & send */}
            <form
              onSubmit={handleSendMessage}
              className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3"
            >
              <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 rounded-full bg-black/80 border border-[#4a4a4a] px-2.5 sm:px-3 py-1 shadow-inner focus-within:border-[#d4af37]">
              
                <input
                  type="text"
                  placeholder="Type your legend..."
                  value={message.text}
                  onChange={handleOnChange}
                  className="w-full py-1.5 sm:py-2 px-0.5 bg-transparent text-xs sm:text-sm text-[#f6e7c2] outline-none placeholder:text-[#a88b4b]"
                />

                <button
                  type="button"
                  className="emoji-toggle-btn w-8 h-8 hidden md:flex items-center justify-center rounded-full hover:bg-white/5 transition flex-shrink-0"
                  title="Emoji"
                  onClick={() => setShowEmojiPicker((p) => !p)}
                >
                  <IoHappyOutline className="text-[#f1d7a8]" size={20} />
                </button>
              </div>

              <button
                type="submit"
                title="Send"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#f1d7a8] via-[#d4af37] to-[#b8860b] flex items-center justify-center text-black shadow-[0_6px_14px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 active:translate-y-0.5 transition flex-shrink-0"
              >
                <IoMdSend size={22} className="-rotate-30" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MessagePage;
