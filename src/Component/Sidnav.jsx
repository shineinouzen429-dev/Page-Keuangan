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

        <div className="text-2xl font-bold text-center bg-blue-900 py-4 shadow-5xl text-white">
          <i class="ri-bar-chart-fill"></i> Statistik Data
        </div>

        <nav className="flex-1 space-y-2 px-3 mt-4">

         

          <p className="text-yellow-300 font-bold text-sm mt-4">Database</p>

          <Link
            to="/KategoriData"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/KategoriData")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            Kategori Data
          </Link>

          <Link
            to="/Kelas"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/Kelas")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            Kelas
          </Link>

          <Link
            to="/MasterData"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/MasterData")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            Master Data
          </Link>

          <p className="text-orange-300 font-bold text-sm mt-4">Keuangan</p>

          <Link
            to="/KategoriTagihan"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/KategoriTagihan")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            Kategori Tagihan
          </Link>

          <Link
            to="/Tagihan"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/Tagihan")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            Tagihan
          </Link>

          <Link
            to="/Rekap"
            className={`block py-3 px-4 rounded-xl transition-all duration-300 ${
              isActive("/Rekap")
                ? "bg-blue-900 shadow-inner"
                : "hover:bg-blue-900 hover:translate-x-1"
            }`}
          >
            Rekap Tagihan
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
