import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function MasterData() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("Semua");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({
    nama: "",
    kategori: "Guru",
    jabatan: "",
  });

  const API_URL = "http://localhost:5000/daftar";

  const getData = async () => {
    try {
      const res = await axios.get(API_URL);
      setData(res.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const openAddModal = () => {
    setForm({ nama: "", kategori: "Guru", jabatan: "" });
    setIsEditing(false);
    setCurrentId(null);
    setShowModal(true);
  };


  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentId(null);
    setForm({ nama: "", kategori: "Guru", jabatan: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama.trim()) return Swal.fire("Nama wajib diisi", "", "warning");
    if (!form.jabatan.trim()) return Swal.fire("Jabatan/Kelas/Bagian wajib diisi", "", "warning");

    const payload = {
      nama: form.nama.trim(),
      kategori: form.kategori,
      jabatan: form.jabatan.trim(),
    };

    try {
      if (isEditing && currentId !== null) {
        await axios.put(`${API_URL}/${currentId}`, payload);

        setData((prev) => prev.map((d) => (d.id === currentId ? { ...d, ...payload } : d)));
        Swal.fire("Berhasil", "Data berhasil diperbarui.", "success");
      } else {
        const res = await axios.post(API_URL, payload);
        const created = res.data ?? { ...payload, id: Date.now() };
        setData((prev) => [...prev, created]);
        Swal.fire("Berhasil", "Data berhasil ditambahkan.", "success");
      }
      closeModal();
    } catch (err) {
      console.error("Gagal simpan:", err.response?.data || err.message);
      Swal.fire("Gagal!", "Terjadi kesalahan saat menyimpan data.", "error");
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const filteredData = filter === "Semua" ? data : data.filter((d) => d.kategori === filter);

  return (
    <div className="min-h-screen p-8 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
        <h1 className="text-xl font-semibold">Data Gabungan (Guru / Siswa / Karyawan)</h1>

        <div className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl border border-gray-300 shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h2 className="text-2xl font-bold">Daftar</h2>
              <p className="text-sm text-gray-500">Tampilkan semua data dalam 1 tabel — filter atau tambah data.</p>
            </div>

            <div className="flex gap-3 mt-3 sm:mt-0">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border py-2 px-3 rounded-lg text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition duration-200"
              >
                <option value="Semua">Semua</option>
                <option value="Guru">Guru</option>
                <option value="Siswa">Siswa</option>
                <option value="Karyawan">Karyawan</option>
              </select>

              <button
                onClick={openAddModal}
                className="bg-green-600 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg transition duration-200 shadow"
              >
                + Tambah Data
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-sm text-left bg-gray-100">
                  <th className="p-3">No</th>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Jabatan / Kelas / Bagian</th>
                  <th className="p-3">Kategori</th>
               
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition duration-200`}
                    >
                      <td className="p-3 align-middle">{index + 1}</td>
                      <td className="p-3 align-middle">{item.nama}</td>
                      <td className="p-3 align-middle">{item.jabatan}</td>
                      <td className="p-3 align-middle">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item.kategori === "Guru"
                              ? "bg-blue-100 text-blue-700"
                              : item.kategori === "Siswa"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.kategori}
                        </span>
                      </td>
                      
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500 italic">
                      Tidak ada data untuk kategori ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 z-10">
            <h3 className="text-xl font-bold mb-3 text-center">
              {isEditing ? "Edit Data" : "Tambah Data"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input
                  type="text"
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select
                  name="kategori"
                  value={form.kategori}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="Guru">Guru</option>
                  <option value="Siswa">Siswa</option>
                  <option value="Karyawan">Karyawan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Mapel / Kelas / Bagian
                </label>
                <input
                  type="text"
                  name="jabatan"
                  value={form.jabatan}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder=""
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                  Batal
                </button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                  {isEditing ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterData;
