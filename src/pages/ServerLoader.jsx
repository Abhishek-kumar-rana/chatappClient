import React from "react";

const ServerLoader = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#d4af37] mt-4 text-sm">
        Server is starting, please wait...
      </p>
      <p className="text-gray-400 text-xs mt-1">
        This may take up to 30 seconds (Render free tier)
      </p>
    </div>
  );
};

export default ServerLoader;
