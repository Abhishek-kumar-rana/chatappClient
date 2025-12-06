import React from 'react'
import Toplogo from '../assets/toplogo.png'

const AuthLayout = ({children}) => {
  return (
    <>
        <header className=' flex justify-center items-center p-3 h-20 bg-black shadow-md'>
            <div className=' p-20 mt-2'>
              <img src={Toplogo} alt="LOGO" />
            </div>
            
            </header>
        {children}
    </>
  )
}

export default AuthLayout