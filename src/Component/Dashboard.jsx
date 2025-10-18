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

  const totalData = tagihan.length;

  const totalMasuk = tagihan
    .filter((item) => item.status && item.status.toLowerCase() === "lunas")
    .reduce((sum, item) => {
      const jumlah =
        typeof item.jumlah === "string"
          ? parseInt(item.jumlah.replace(/[^\d]/g, "")) || 0
          : Number(item.jumlah) || 0;
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
          <div className="flex flex-col items-center ">
            <h1 className="text-3xl font-bold mb-8 text-center">DASHBOARD</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 w-full max-w-3xl">
              <div className="bg-gray-700 p-5 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gray-800 cursor-pointer">
                <h2 className="text-white text-lg font-semibold mb-2">
                  Total Data
                </h2>
                <p className="text-white text-2xl font-bold">{totalData}</p>
              </div>

              <div className="bg-gray-700 p-5 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl hover:bg-gray-800 cursor-pointer">
                <h2 className="text-white text-lg font-semibold mb-2">
                  Total Nominal Masuk
                </h2>
                <p className="text-white text-2xl font-bold">
                  Rp {totalMasuk.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="w-full p-10 ">
              <h2 className="text-3xl font-semibold mb-4 text-center text-gray-700">
                Daftar Pembayaran
              </h2>

              <table className="table-auto w-full border-collapse shadow-lg rounded-xl overflow-hidden">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-600">No</th>
                    <th className="py-3 px-4 text-left border-b border-gray-600">
                      Nama
                    </th>
                    <th className="py-3 px-4 text-left border-b border-gray-600">
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
                        <td className="px-4 py-3 text-center border-b border-gray-200">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-left border-b border-gray-200 font-medium">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-left border-b border-gray-200 font-semibold text-gray-700">
                          Rp {Number(item.jumlah).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-6 text-gray-500 italic bg-gray-50"
                      >
                        Tidak ada data
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
