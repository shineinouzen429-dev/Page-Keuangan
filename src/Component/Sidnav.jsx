import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Sidnav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
    
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden m-4 bg-gray-700 text-white px-3 py-2 rounded z-50 fixed top-4 left-4"
      >
        {open ? "Tutup" : "Buka"}
      </button>

      
      <div
        className={`fixed top-0 left-0 h-full w-60 
    bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700
    text-white z-40 shadow-2xl border-r border-slate-700
    transform transition-transform duration-300 ease-in-out
    ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="text-xl font-bold mb-8 text-center bg-gray-700 py-4 shadow-lg">
          Daftar <br /> keuangan
        </div>

        <nav className="space-y-9 px-4 mt-10">
          <Link
            to="/Dashboard"
            className={`block py-4 px-3 rounded font-bold text-xl text-center ${
              isActive("/Dashboard") ? "bg-blue-600" : "hover:bg-blue-600"
            }`}
          ><i class="ri-dashboard-fill"></i>
            Dashboard
          </Link>
          <Link
            to="/Tagihan"
            className={`block py-4 px-3 rounded font-bold text-center text-xl ${
              isActive("/Tagihan") ? "bg-blue-600" : "hover:bg-blue-600"
            }`}
          >
            <i class="ri-bill-line"></i>
            Tagihan
          </Link>
          <Link
            to="/Jenistagihan"
            className={`block py-4 px-3 rounded font-bold text-xl text-center ${
              isActive("/Jenistagihan") ? "bg-blue-600" : "hover:bg-blue-600"
            }`}
          >
            <i class="ri-wallet-line"></i>
            Jenis Tagihan
          </Link>
          <a href="/Login" className="block py-2 px-3 rounded font-bold text-center bg-red-600 mt-100 mr-2 hover:bg-red-800">
          <i class="ri-logout-box-line mr-3"></i>
            Log out</a>
        </nav>
      </div>
    </>
  );
}

export default Sidnav;
