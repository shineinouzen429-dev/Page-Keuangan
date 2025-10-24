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
        className={`fixed top-0 left-0 h-screen w-64 
          bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700
          text-white z-40 shadow-2xl border-r border-slate-700
          flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="text-2xl font-bold text-center bg-blue-800 py-5 shadow-lg text-white">
          💰 Keuangan
        </div>
        <nav className="flex-1 space-y-3 px-3 mt-4">
          <Link
            to="/Dashboard"
            className={`block py-3 px-4 font-bold text-lg rounded-xl transition-all duration-300 text-white ${
              isActive("/Dashboard")
                ? "bg-yellow-400 shadow-inner text-white"
                : "hover:bg-yellow-500 hover:translate-x-1"
            }`}
          >
            <i className="ri-dashboard-fill mr-2"></i> Dashboard
          </Link>

          <Link
            to="/Tagihan"
            className={`block py-3 px-4 font-bold text-lg rounded-xl transition-all duration-300 text-white ${
              isActive("/Tagihan")
                ? "bg-yellow-400 shadow-inner text-white"
                : "hover:bg-yellow-500 hover:translate-x-1"
            }`}
          >
            <i className="ri-bill-line mr-2"></i> Tagihan
          </Link>

          <Link
            to="/Jenistagihan"
            className={`block py-3 px-4 font-bold text-lg rounded-xl transition-all duration-300 text-white ${
              isActive("/Jenistagihan")
                ? "bg-yellow-400 shadow-inner text-white"
                : "hover:bg-yellow-500 hover:translate-x-1"
            }`}
          >
            <i className="ri-wallet-2-line mr-2"></i> Jenis Tagihan
          </Link>
        </nav>

        <div className="p-4">
          <a
            href="/Login"
            className="block w-full text-center py-2 rounded-md font-bold bg-red-600 hover:bg-red-700 transition"
          >
            <i className="ri-logout-box-line mr-2"></i>
            Log out
          </a>
        </div>
      </div>
    </>
  );
}

export default Sidnav;
