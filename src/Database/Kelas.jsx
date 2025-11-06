import React, { useEffect, useState } from "react";
import axios from "axios";

function Kelas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedJurusan, setSelectedJurusan] = useState("");
  const [search, setSearch] = useState("");

  const groupKelas = ["X", "XI", "XII"];
  const jurusanList = ["TSM", "AKT", "TKJ", "TB"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/kategoridata");
      setData(res.data || []);
    } catch (err) {
      console.error("Gagal ambil data kelas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setSelectedKelas("");
    setSelectedJurusan("");
    setSearch("");
  };

  const filteredData = data.filter(
    (d) =>
      d.kategori === "siswa" &&
      (!selectedKelas || d.kelas === selectedKelas) &&
      (!selectedJurusan || d.jurusan === selectedJurusan) &&
      d.nama.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 ml-3 bg-gradient-to-br from-slate-100 to-blue-100 min-h-screen rounded-3xl transition-all duration-300">

      <div className="flex justify-between items-center mb-8 bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-2xl py-6 px-10 shadow-lg">
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
           Menu Kelas
        </h1>
        <span className="text-sm opacity-80 italic">
          Manajemen Data Siswa
        </span>
      </div>

      <div className="bg-white/80 backdrop-blur-lg shadow-lg rounded-2xl p-6 mb-8 border border-gray-200 hover:shadow-xl transition-all">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-5">
          <input
            type="text"
            placeholder="🔍 Cari nama siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
          <button
            onClick={handleResetFilter}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition-all shadow-sm"
          >
            Reset Filter
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
  
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-gray-700">
              Pilih Kelas:
            </label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            >
              <option value="">Semua Kelas</option>
              {groupKelas.map((kelas) => (
                <option key={kelas} value={kelas}>
                  Kelas {kelas}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-gray-700">
              Pilih Jurusan:
            </label>
            <select
              value={selectedJurusan}
              onChange={(e) => setSelectedJurusan(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
            >
              <option value="">Semua Jurusan</option>
              {jurusanList.map((jurusan) => (
                <option key={jurusan} value={jurusan}>
                  {jurusan}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden border border-gray-200 transition-all hover:shadow-2xl">
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6">
          Daftar Siswa{" "}
          {selectedKelas || selectedJurusan
            ? `(${selectedKelas || ""} ${selectedJurusan || ""})`
            : ""}
        </h2>

        {filteredData.length > 0 ? (
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Kelas</th>
                <th className="px-4 py-2">Jurusan</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((siswa, index) => (
                <tr
                  key={siswa.id || index}
                  className="odd:bg-white even:bg-blue-50 transition-all duration-200"
                >
                  <td className="px-4 py-2 text-center font-semibold text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 text-gray-800">{siswa.nama}</td>
                  <td className="px-4 py-2 text-center font-medium text-blue-700">
                    {siswa.kelas}
                  </td>
                  <td className="px-4 py-2 text-center font-medium text-indigo-700">
                    {siswa.jurusan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-6">
            Tidak ada data siswa yang cocok.
          </p>
        )}
      </div>
    </div>
  );
}

export default Kelas;
