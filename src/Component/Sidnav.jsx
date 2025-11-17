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
        className={`fixed top-0 left-0 h-screen w-64 bg-blue-950 text-white z-40 shadow-2xl border-r border-slate-700 flex flex-col justify-between transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col items-center bg-blue-950 py-2 shadow-5xl text-white">
          <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center shadow-lg">
            <i className="ri-school-fill text-3xl text-blue-200"></i>
          </div>

          <span className="text-lg font-semibold mt-3">Binusa.S</span>

          <div className="w-24 h-[2px] bg-blue-700 mt-2 rounded-full"></div>
        </div>

        <nav className="flex-1 space-y-2 px-3 mt-4">
          <Link
            to="/Dashboard"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/Dashboard")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            <i class="ri-dashboard-fill"></i>Dashboard
          </Link>

          <p className="text-white font-bold text-lg mt-4 border-b border-white">
            Database
          </p>

          <Link
            to="/KategoriData"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/KategoriData")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            <i class="ri-folder-user-fill"></i>Kategori Data
          </Link>

          <Link
            to="/Kelas"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/Kelas")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            <i class="ri-team-fill"></i>Kelas
          </Link>

          <Link
            to="/MasterData"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/MasterData")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            <i class="ri-database-fill"></i>Master Data
          </Link>

          <p className="text-white font-bold text-lg mt-4 border-b border-white">
            Keuangan
          </p>

          <Link
            to="/KategoriTagihan"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/KategoriTagihan")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            <i class="ri-list-check-3"></i>Kategori Tagihan
          </Link>

          <Link
            to="/Tagihan"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/Tagihan")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            <i class="ri-bill-fill"></i>Tagihan
          </Link>

          <Link
            to="/RekapTagihan"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/RekapTagihan")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            <i class="ri-bar-chart-fill"></i>Rekap Tagihan
          </Link>
        </nav>

        <div className="p-4">
          <a
            href="/Login"
            className="block w-full text-center py-2 rounded-md font-bold bg-red-600 hover:bg-red-700 transition"
          >
            Log out
          </a>
        </div>
      </div>
    </>
  );
}

export default Sidnav;
