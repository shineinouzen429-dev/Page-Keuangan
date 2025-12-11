import React from "react";

const MasukPresensi = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Mau masuk ke halaman?
        </h1>

        <div className="flex flex-col gap-4">
          <a
            href="/Presensi"
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-all"
          >
            Presensi
          </a>

          <a
            href="/PresensiIzin"
            className="inline-block bg-yellow-500 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-yellow-600 transition-all"
          >
            Izin
          </a>
        </div>
      </div>
    </div>
  );
};

export default MasukPresensi;
