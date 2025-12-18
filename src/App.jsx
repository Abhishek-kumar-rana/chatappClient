import { useState } from 'react'
import { Toaster } from 'sonner';
import './App.css'
import { Outlet } from 'react-router-dom'
import ServerLoader from './pages/ServerLoader';
import { useEffect } from 'react';
import axios from 'axios';

function App() {
  const [serverReady, setServerReady] = useState(false);
    useEffect(() => {
    const wakeServer = async () => {
    
      try {
        console.log("Server is trying to awake:");
       const res= await axios.get(
          `${import.meta.env.VITE_APP_BACKEND_URL}/health`,
          { timeout: 5000 }
        );
        setServerReady(res.data.status === "ok");

        console.log("Server is awake:", res.data.status);
      } catch (error) {
        setTimeout(wakeServer, 3000); // retry every 3s
      }
    };

    wakeServer();
  }, []);

  if (!serverReady) return <ServerLoader />;
  return (
    <>
     <main>
      <Toaster position='top-center' />
      <Outlet/> 
     </main>
    </>
  )
}

export default App
