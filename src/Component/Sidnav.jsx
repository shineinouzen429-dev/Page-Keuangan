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
        className={`fixed top-0 left-0 h-full w-65 
    bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700
    text-white z-40 shadow-2xl border-r border-slate-700
    transform transition-transform duration-300 ease-in-out
    ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="text-xl font-bold mb-8 text-center bg-gray-700 py-4 shadow-lg">
          <i class="ri-wallet-line"></i> Daftar <br /> Keuangan
        </div>

        <nav className="mt-10 space-y-9 p-5">
          <Link
            to="/Dashboard"
            className={`block py-3 px-4 font-bold text-lg rounded-xl text-white transition-all duration-300 ${
              isActive("/Dashboard")
                ? "bg-blue-500 shadow-inner"
                : "hover:bg-blue-600 hover:translate-x-1"
            }`}
          >
            <i className="ri-dashboard-fill mr-2"></i> Dashboard
          </Link>

          <Link
            to="/Tagihan"
            className={`block py-3 px-4 font-bold text-lg rounded-xl text-white transition-all duration-300 ${
              isActive("/Tagihan")
                ? "bg-blue-500 shadow-inner"
                : "hover:bg-blue-600 hover:translate-x-1"
            }`}
          >
            <i className="ri-bill-line mr-2"></i> Tagihan
          </Link>

          <Link
            to="/Jenistagihan"
            className={`block py-3 px-4 font-bold text-lg rounded-xl text-white transition-all duration-300 ${
              isActive("/Jenistagihan")
                ? "bg-blue-500 shadow-inner"
                : "hover:bg-blue-600 hover:translate-x-1"
            }`}
          >
            <i className="ri-wallet-2-line mr-2"></i> Jenis Tagihan
          </Link>

          <a
            href="/Login"
            className="block py-2 px-3 rounded-md font-bold text-center bg-red-600 mt-100 mr-2 hover:bg-red-800 "
          >
            <i class="ri-logout-box-line mr-3"></i>
            Log out
          </a>
        </nav>
      </div>
    </>
  );
}

export default Sidnav;
