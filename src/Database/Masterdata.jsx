import { useState, useEffect } from "react";
import axios from "axios";

function MasterData() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/kategoridata";

  const getData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setData(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const filteredData =
    filter === "Semua"
      ? data
      : data.filter(
          (d) =>
            d.kategori?.toLowerCase() === filter.toLowerCase()
        );

  return (
    <div className="min-h-screen p-8 flex justify-center bg-gray-50">
      
      <div className="w-full max-w-6xl space-y-8">
        <h1 className="text-2xl font-bold text-white flex justify-between items-center mb-6 rounded-2xl py-5 px-10 bg-gradient-to-l from-blue-800 to-blue-600 shadow-md relative">
          Data Master (Gabungan)
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h2 className="text-xl font-semibold">Daftar Data</h2>
              <p className="text-sm text-gray-500">
                Menampilkan semua data kategori: Guru, Siswa, dan Karyawan.
              </p>
            </div>

            <div className="flex gap-3 mt-3 sm:mt-0">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border py-2 px-3 rounded-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                <option value="Semua">Semua</option>
                <option value="Guru">Guru</option>
                <option value="Siswa">Siswa</option>
                <option value="Karyawan">Karyawan</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-center py-10 text-gray-500">Memuat data...</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow-sm">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-100 text-sm text-left">
                    <th className="p-3">No</th>
                    <th className="p-3">Nama</th>
                    <th className="p-3">Mapel / Kelas / Bagian</th>
                    <th className="p-3">Kategori</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        }  transition`}
                      >
                        <td className="p-3 text-center">{index + 1}</td>
                        <td className="p-3">{item.nama}</td>
                        <td className="p-3">
                          {item.kategori === "siswa"
                            ? `${item.kelas || "-"} ${item.jurusan || ""}`
                            : item.kategori === "guru"
                            ? item.jabatan || "-"
                            : item.bagian || "-"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              item.kategori === "guru"
                                ? "bg-blue-100 text-blue-700"
                                : item.kategori === "siswa"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {item.kategori
                              ? item.kategori.charAt(0).toUpperCase() +
                                item.kategori.slice(1)
                              : "-"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-6 text-gray-500 italic"
                      >
                        Tidak ada data untuk kategori ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MasterData;
