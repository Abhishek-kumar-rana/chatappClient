import React, { useEffect, useState } from 'react'
import { IoSearchOutline } from "react-icons/io5";
import Loading from './Loading';
import UserSearchCard from './UserSearchCard';
// import toast from 'sonner'
import axios from 'axios';
import { IoClose } from "react-icons/io5";

const SearchUser = ({onClose}) => {
    const [searchUser,setSearchUser] = useState([])
    const [loading,setLoading] = useState(false)
    const [search,setSearch] = useState("")


    const handleSearchUser = async()=>{
        const URL = `${import.meta.env.VITE_APP_BACKEND_URL}/api/search-user`
        try {
            setLoading(true)
            const response = await axios.post(URL,{
                search : search
            })
            setLoading(false)

            setSearchUser(response.data.data)

        } catch (error) {
            // toast.error(error?.response?.data?.message)
        }
    }

    useEffect(()=>{
        handleSearchUser()
    },[search])

    //.log("searchUser",searchUser)
  return (
  <div className="fixed top-0 bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 z-10 flex justify-center">
    <div className="w-full max-w-lg mx-auto mt-20">

      {/* SEARCH INPUT */}
      <div className="bg-[#4a372c] border border-[#b9925e] rounded-xl h-14 overflow-hidden flex shadow-lg">
        <input
          type="text"
          placeholder="Search user by name, email..."
          className="w-full bg-[#2b2424] text-[#ffe5b4] placeholder-[#d9b67c] outline-none px-4"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        <div className="h-14 w-14 flex justify-center items-center text-[#f1d7a8]">
          <IoSearchOutline size={25} />
        </div>
      </div>

      {/* RESULTS */}
      <div className="bg-[#4a372c] border border-[#b9925e] mt-3 w-full p-4 rounded-xl shadow-lg text-[#ffe5b4]">
        {/* no user found */}
        {searchUser.length === 0 && !loading && (
          <p className="text-center text-[#bfa27a]">No user found!</p>
        )}

        {loading && (
          <div className="flex justify-center">
            <Loading />
          </div>
        )}

        {/* users */}
        {searchUser.length !== 0 && !loading && (
          searchUser.map((user) => (
            <UserSearchCard key={user._id} user={user} onClose={onClose} />
          ))
        )}
      </div>
    </div>

    {/* CLOSE BUTTON */}
    <div
  onClick={onClose}
  className="absolute  md:top-20 lg:top-20 right-4   text-[#ffe5b4] hover:text-red-400 transition text-3xl lg:text-4xl cursor-pointer rounded-full p-1"
>
  <IoClose />
</div>

  </div>
);

}

export default SearchUser 