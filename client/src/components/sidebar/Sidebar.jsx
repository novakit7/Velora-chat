import React from "react";
import api from "../../api/axois";
import AuthContext from "../../context/AuthContext";
import { useContext } from "react";
import {
  FiHome,
  FiMessageCircle,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { Link } from "react-router-dom";

export default function Sidebar() {

    const { user, setUser } = useContext(AuthContext);
    
  const handleLogout = async(e)=>{
    e.preventDefault();
    try {
      const res = await api.post("/user/logout");
      console.log(res?.message);
      setUser(null);
      
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <aside className="w-20 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col py-4">
      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-3">
        <button className="w-14 h-14 rounded-xl flex items-center justify-center text-gray-400 hover:bg-slate-800 hover:text-cyan-400 transition">
          <FiHome size={24} />
        </button>

        <button className="w-14 h-14 rounded-xl flex items-center justify-center bg-cyan-500 text-white shadow-lg">
          <FiMessageCircle size={24} />
        </button>

        <button className="w-14 h-14 rounded-xl flex items-center justify-center text-gray-400 hover:bg-slate-800 hover:text-cyan-400 transition">
          <FiSettings size={24} />
        </button>
      </nav>

      {/* Logout */}
      <div className="flex justify-center pt-4 border-t border-slate-800">
        <button onClick ={handleLogout} className="w-14 h-14 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/10 transition">
          <FiLogOut size={24} />
        </button>
      </div>
    </aside>
  );
}