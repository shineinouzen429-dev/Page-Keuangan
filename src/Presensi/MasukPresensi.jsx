import React from 'react';

const MasukPresensi = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Mau masuk ke halaman presensi?
        </h1>

        <a
          href="/Presensi"
          className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-all"
        >
          Masuk
        </a>
      </div>
    </div>
  );
};

export default MasukPresensi;
