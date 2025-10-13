import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [tagihan, setTagihan] = useState([]);

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
    .filter((item) => item.status.toLowerCase() === "lunas")
    .reduce((sum, item) => {
      const jumlah = parseInt(item.jumlah.replace(/[^\d]/g, "")) || 0;
      return sum + jumlah;
    }, 0);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-6xl p-6">
        <div className="flex flex-col items-center ">
          <h1 className="text-3xl font-bold mb-8 text-center">DASHBOARD</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 w-full max-w-3xl">
            <div className="bg-gray-700 p-5 rounded shadow text-center">
              <h2 className="text-white text-lg font-semibold mb-2">
                Total Data
              </h2>
              <p className="text-white text-2xl font-bold">{totalData}</p>
            </div>
            <div className="bg-gray-700 p-5 rounded shadow text-center">
              <h2 className="text-white text-lg font-semibold mb-2">
                Total Nominal Masuk
              </h2>
              <p className="text-white text-2xl font-bold">
                Rp {totalMasuk.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-md w-full max-w-4xl">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
              Daftar Pembayaran
            </h2>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="px-4 text-center py-2">No</th>
                  <th className="px-4 text-left py-2">Nama</th>
                  <th className="px-4 text-left py-2">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {tagihan.length > 0 ? (
                  tagihan.map((item, index) => (
                    <tr
                      key={item.id}
                      className="text-center bg-gray-100  transition"
                    >
                      <td className="px-4 text-center py-2">{index + 1}</td>
                      <td className="px-4 text-left py-2">{item.name}</td>
                      <td className="px-4 text-left py-2">{item.jumlah}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-4 text-gray-500 italic"
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
  );
};

export default Dashboard;
