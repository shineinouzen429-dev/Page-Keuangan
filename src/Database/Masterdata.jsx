import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function MasterData() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [kelasAktif, setKelasAktif] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    kategori: "",
    kelas: "",
    jurusan: "",
    jabatan: "",
    bagian: "",
  });

  const API_URL = "http://localhost:5000/masterdata";
  const KELAS_API = "http://localhost:5000/kelasdata";

  // GET semua data master
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

  // GET data kelas aktif
 const getKelasAktif = async () => {
  try {
    const res = await axios.get(KELAS_API);
    // Ambil hanya kelas yang aktif dan batasi jadi 4 saja
    const aktif = res.data
      .filter((d) => d.status === true)
      .slice(0, 3); // <-- Batas 4 kelas aktif saja
    setKelasAktif(aktif);
  } catch (err) {
    console.error("Gagal ambil kelas aktif:", err);
  }
};
  ``

  useEffect(() => {
    getData();
    getKelasAktif();
  }, []);

  // Hitung total
  const totalGuru = data.filter((d) => d.kategori?.toLowerCase() === "guru").length;
  const totalSiswa = data.filter((d) => d.kategori?.toLowerCase() === "siswa").length;
  const totalKaryawan = data.filter((d) => d.kategori?.toLowerCase() === "karyawan").length;
  const totalDatabase = data.length;

  // Filter tampilan
  const filteredData =
    filter === "Semua"
      ? data
      : data.filter((d) => d.kategori?.toLowerCase() === filter.toLowerCase());

  // --- Submit Data Baru ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let newData = {
        nama: formData.nama,
        kategori: formData.kategori.toLowerCase(),
      };

      if (formData.kategori === "Guru") newData.jabatan = formData.jabatan;
      if (formData.kategori === "Siswa") {
        newData.kelas = formData.kelas;
        newData.jurusan = formData.jurusan;
      }
      if (formData.kategori === "Karyawan") newData.bagian = formData.bagian;

      await axios.post(API_URL, newData);
      Swal.fire("Berhasil", "Data berhasil ditambahkan", "success");
      setFormData({
        nama: "",
        kategori: "",
        kelas: "",
        jurusan: "",
        jabatan: "",
        bagian: "",
      });
      setShowModal(false);
      getData();
    } catch (err) {
      console.error("Gagal tambah data:", err);
      Swal.fire("Gagal", "Tidak bisa menambah data", "error");
    }
  };

  return (
    <div className="min-h-screen p-8 flex justify-center bg-gray-50">
      <div className="w-full max-w-6xl space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex justify-between items-center mb-6 rounded-2xl py-5 px-10 bg-gradient-to-l from-blue-800 to-blue-600 shadow-md">
            Data Master (Gabungan)
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
          >
            + Tambah Data
          </button>
        </div>

        {/* CARD TOTAL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card title="Total Guru" count={totalGuru} color="blue" icon="ri-user-star-fill" />
          <Card title="Total Siswa" count={totalSiswa} color="green" icon="ri-team-fill" />
          <Card title="Total Karyawan" count={totalKaryawan} color="amber" icon="ri-user-2-fill" />
          <Card title="Total Database" count={totalDatabase} color="purple" icon="ri-database-2-fill" />
        </div>

        {/* FILTER & TABLE */}
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h2 className="text-xl font-semibold">Daftar Data</h2>
              <p className="text-sm text-gray-500">
                Menampilkan semua data kategori: Guru, Siswa, dan Karyawan.
              </p>
            </div>

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
                        } transition`}
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

      {/* MODAL TAMBAH DATA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Tambah Data Master</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama */}
              <div>
                <label className="text-sm font-medium text-gray-700">Nama</label>
                <input
                  required
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="text-sm font-medium text-gray-700">Kategori</label>
                <select
                  required
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kategori: e.target.value,
                      kelas: "",
                      jurusan: "",
                      jabatan: "",
                      bagian: "",
                    })
                  }
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Guru">Guru</option>
                  <option value="Siswa">Siswa</option>
                  <option value="Karyawan">Karyawan</option>
                </select>
              </div>

              {/* Field dinamis */}
              {formData.kategori === "Guru" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Jabatan</label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) =>
                      setFormData({ ...formData, jabatan: e.target.value })
                    }
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Contoh: Wali Kelas, Guru BK"
                  />
                </div>
              )}

              {formData.kategori === "Siswa" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Kelas</label>
                    <select
                      required
                      value={formData.kelas}
                      onChange={(e) =>
                        setFormData({ ...formData, kelas: e.target.value })
                      }
                      className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      <option value="">Pilih Kelas</option>
                      {kelasAktif.map((k) => (
                        <option key={k.id} value={k.kelas}>
                          {k.kelas}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Jurusan</label>
                    <select
                      required
                      value={formData.jurusan}
                      onChange={(e) =>
                        setFormData({ ...formData, jurusan: e.target.value })
                      }
                      className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      <option value="">Pilih Jurusan</option>
                      {[...new Set(kelasAktif.map((k) => k.jurusan))].map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {formData.kategori === "Karyawan" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Bagian</label>
                  <input
                    type="text"
                    value={formData.bagian}
                    onChange={(e) =>
                      setFormData({ ...formData, bagian: e.target.value })
                    }
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Contoh: Administrasi, Keamanan"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Card component
function Card({ title, count, color, icon }) {
  const colors = {
    blue: "from-blue-600 to-blue-500 text-blue-200",
    green: "from-green-600 to-green-500 text-green-200",
    amber: "from-yellow-600 to-amber-500 text-yellow-200",
    purple: "from-purple-600 to-violet-500 text-purple-200",
  };

  return (
    <div
      className={`flex-1 min-w-[220px] relative overflow-hidden bg-gradient-to-l ${colors[color]} text-white rounded-lg shadow-lg p-4 text-center`}
    >
      <i className={`${icon} ${colors[color]} absolute right-2 bottom-2 text-[70px] opacity-40`}></i>
      <p className="text-sm font-semibold relative z-10">{title}</p>
      <h2 className="text-2xl font-bold mt-1 relative z-10">{count}</h2>
    </div>
  );
}

export default MasterData;
