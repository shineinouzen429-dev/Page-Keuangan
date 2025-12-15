import React from "react";

const MasukPresensi = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4
      relative overflow-hidden">

     
      <div className="relative w-full max-w-md p-8 rounded-3xl
        bg-white/10 backdrop-blur-xl border border-white/20
        shadow-[0_0_40px_rgba(0,0,0,0.5)] text-center">

        <h1 className="text-3xl font-extrabold text-black mb-3">
          Selamat Datang 👋
        </h1>

        <p className="text-black/70 mb-8">
          Silakan pilih halaman yang ingin kamu akses
        </p>

        <div className="flex flex-col gap-5">

          <a
            href="/Presensi"
            className="group flex items-center justify-center gap-3
              bg-blue-600 hover:bg-blue-700 text-black
              px-6 py-4 rounded-xl font-semibold text-lg
              shadow-lg hover:shadow-blue-500/50
              transition-all duration-300 active:scale-95"
          >
            <i className="ri-fingerprint-line text-2xl"></i>
            Presensi
            <i className="ri-arrow-right-line ml-auto opacity-0 group-hover:opacity-100 transition"></i>
          </a>

          <a
            href="/PresensiIzin"
            className="group flex items-center justify-center gap-3
              bg-yellow-400 hover:bg-yellow-500 text-black
              px-6 py-4 rounded-xl font-semibold text-lg
              shadow-lg hover:shadow-yellow-400/50
              transition-all duration-300 active:scale-95"
          >
            <i className="ri-file-edit-line text-2xl"></i>
            Izin
            <i className="ri-arrow-right-line ml-auto opacity-0 group-hover:opacity-100 transition"></i>
          </a>

        </div>

        <p className="mt-8 text-xs text-black/50">
          Sistem Presensi Digital
        </p>
      </div>
    </div>
  );
};

export default MasukPresensi;
