import React, { useEffect, useState } from "react";
import axios from "axios";

function Kelas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [selectedJurusan, setSelectedJurusan] = useState(null);
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

  const filteredData = data.filter(
    (d) =>
      d.kategori === "siswa" &&
      (!selectedKelas || d.kelas === selectedKelas) &&
      (!selectedJurusan || d.jurusan === selectedJurusan) &&
      d.nama.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 ml-3">

      <div className="flex justify-between items-center mb-6 rounded-2xl py-5 px-10 bg-gradient-to-l from-blue-800 to-blue-600 shadow-md relative">
        <h1 className="text-2xl font-bold text-left w-full text-white">
          Menu Kelas
        </h1>
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          
        </div>
        <div className="flex flex-wrap gap-3 mb-3">
          {groupKelas.map((kelas) => (
            <button
              key={kelas}
              onClick={() => {
                setSelectedKelas(kelas === selectedKelas ? null : kelas);
                setSelectedJurusan(null);
              }}
              className={`px-4 py-2 rounded-lg font-semibold ${
                selectedKelas === kelas
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Kelas {kelas}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {jurusanList.map((jurusan) => (
            <button
              key={jurusan}
              onClick={() =>
                setSelectedJurusan(
                  jurusan === selectedJurusan ? null : jurusan
                )
              }
              className={`px-4 py-2 rounded-lg font-semibold ${
                selectedJurusan === jurusan
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {jurusan}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">
          Daftar Siswa{" "}
          {selectedKelas || selectedJurusan
            ? `(${selectedKelas || ""} ${selectedJurusan || ""})`
            : ""}
        </h2>

        {filteredData.length > 0 ? (
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow">
            <thead className="bg-gradient-to-l from-blue-800 to-blue-600 text-white">
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
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2  text-center">{index + 1}</td>
                  <td className="px-4 py-2 ">{siswa.nama}</td>
                  <td className="px-4 py-2  text-center">{siswa.kelas}</td>
                  <td className="px-4 py-2  text-center">
                    {siswa.jurusan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-4">
            Tidak ada data siswa yang cocok.
          </p>
        )}
      </div>
    </div>
  );
}

export default Kelas;
