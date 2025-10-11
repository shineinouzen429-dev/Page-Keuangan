import React, { useState } from "react";
import { Link } from "react-router-dom";

function Sidnav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Tombol hanya muncul di layar kecil */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden m-4 bg-gray-700 text-white px-3 py-2 rounded z-50 fixed top-4 left-4"
      >
        {open ? "Tutup" : "Buka"}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-60 bg-gray-800 text-white z-40
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="text-xl font-bold mb-8 text-center bg-gray-700 py-4 shadow-lg">
          Binus
        </div>

        <nav className="space-y-6 px-4">
          <Link to="/D" className="block py-2 px-3 rounded hover:bg-blue-600 font-bold text-center">
            Dashboard
          </Link>
          <Link to="/T" className="block py-2 px-3 rounded hover:bg-blue-600 font-bold text-center">
            Tagihan
          </Link>
          <Link to="/J" className="block py-2 px-3 rounded hover:bg-blue-600 font-bold text-center">
            Jenis Tagihan
          </Link>
        </nav>
      </div>
    </>
  );
}

export default Sidnav;
