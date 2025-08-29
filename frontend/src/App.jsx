import { Navigate, Route, Routes } from "react-router-dom";
import AppBar from "./components/Appbar"
import Chat from "./components/Chat"
import { useEffect, useState } from "react";
import Signup from "./Page/Signup";
import Login from "./Page/Login";


function App() {

   const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect( () => {
        const token = localStorage.getItem("token");
        if(token){
            setIsAuthenticated(true);
        }else{
            setIsAuthenticated(false);
        }
    }, [])

  return (
    <>
      <div className="bg-[#212121] min-h-screen text-white p-4">
        <Routes>
           <Route path="/signup" element={<Signup />} />
           <Route path="/" element={
              isAuthenticated ? <Chat /> : <Navigate to="/signup" replace/>
            } />
            <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </>
  )
}

export default App
