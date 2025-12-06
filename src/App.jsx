import { useState } from 'react'
import { Toaster } from 'sonner';
import './App.css'
import { Outlet } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

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
