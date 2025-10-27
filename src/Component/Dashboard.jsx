import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [tagihan, setTagihan] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/tagihan");
        setTagihan(response.data);
      } catch (error) {
        console.error("Gagal ambil data tagihan:", error);
      }
    };

    fetchData();
  }, []);

  const formatRupiah = (angka) => {
    const number = Number(angka);
    if (isNaN(number)) return "Rp 0";
    return number.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
  };

  const totalData = tagihan.length;
  const totalLunas = tagihan.filter((t) => t.status === "Lunas").length;
  const totalBelumLunas = tagihan.filter((t) => t.status === "Belum lunas").length;
  const totalNominalLunas = tagihan
    .filter((t) => t.status === "Lunas")
    .reduce((sum, t) => {
      const jumlah =
        typeof t.jumlah === "string"
          ? parseInt(t.jumlah.replace(/[^\d]/g, "")) || 0
          : Number(t.jumlah) || 0;
      return sum + jumlah;
    }, 0);

  return (
    <div
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <div className="flex justify-center">
        <div className="w-full max-w-6xl p-6">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8 text-center">
              <i className="ri-dashboard-line text-blue-600"></i> DASHBOARD
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 w-full max-w-5xl">
              <div className="bg-yellow-400 p-5 rounded-lg shadow-lg text-center hover:scale-105 transition-transform">
                <h2 className="text-white text-lg font-semibold mb-2">Total Data</h2>
                <p className="text-white text-2xl font-bold">{totalData}</p>
              </div>

              <div className="bg-green-500 p-5 rounded-lg shadow-lg text-center hover:scale-105 transition-transform">
                <h2 className="text-white text-lg font-semibold mb-2">Data Lunas</h2>
                <p className="text-white text-2xl font-bold">{totalLunas}</p>
              </div>

              <div className="bg-red-500 p-5 rounded-lg shadow-lg text-center hover:scale-105 transition-transform">
                <h2 className="text-white text-lg font-semibold mb-2">Data Belum Lunas</h2>
                <p className="text-white text-2xl font-bold">{totalBelumLunas}</p>
              </div>

              <div className="bg-blue-500 p-5 rounded-lg shadow-lg text-center hover:scale-105 transition-transform">
                <h2 className="text-white text-lg font-semibold mb-2">Total Nominal Lunas</h2>
                <p className="text-white text-2xl font-bold">
                  {formatRupiah(totalNominalLunas)}
                </p>
              </div>
            </div>
            <div className="w-full p-10">
              <h2 className="text-3xl font-semibold mb-4 text-center text-gray-700">
                Daftar Pembayaran
              </h2>

              <table className="table-auto w-full border-collapse shadow-lg rounded-xl overflow-hidden">
                <thead className="bg-gradient-to-l from-blue-800 to-blue-600 text-white">
                  <tr>
                    <th className="border-b border-gray-600 py-3 px-3">No</th>
                    <th className="border-b border-gray-600 py-3 px-3 text-center">
                      Nama
                    </th>
                    <th className="border-b border-gray-600 py-3 px-3 text-center">
                      Jenis Tagihan
                    </th>
                    <th className="border-b border-gray-600 py-3 px-3 text-center">
                      Jumlah
                    </th>
                   
                  </tr>
                </thead>
                <tbody>
                  {tagihan.length > 0 ? (
                    tagihan.map((item, index) => (
                      <tr
                        key={item.id}
                        className="text-gray-800 even:bg-gray-50 odd:bg-white transition-all duration-200"
                      >
                        <td className="text-center border-b border-gray-200">
                          {index + 1}
                        </td>
                        <td className="px-3 py-3 border-b border-gray-200">{item.name}</td>
                        <td className="px-3 py-3 border-b border-gray-200">
                          {item.jenis_tagihan || "-"}
                        </td>
                        <td className="px-3 py-3 text-right border-b border-gray-200 font-semibold">
                          {formatRupiah(item.jumlah)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-6 text-gray-500 italic bg-gray-50"
                      >
                        Tidak ada data tagihan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
