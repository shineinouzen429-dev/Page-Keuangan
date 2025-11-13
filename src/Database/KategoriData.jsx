import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function KategoriData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ kategori: "", keterangan: "" });
  const API_URL = "http://localhost:5000/kategoridata";

  const getData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setData(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      Swal.fire("Error", "Gagal mengambil data dari server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const toggleStatus = async (id, status) => {
    try {
      const newStatus = !status;
      await axios.patch(`${API_URL}/${id}`, { status: newStatus });
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error("Gagal ubah status:", err);
      Swal.fire("Gagal", "Tidak bisa ubah status", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus data ini?",
      text: "Data yang dihapus tidak bisa dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setData((prev) => prev.filter((d) => d.id !== id));
        Swal.fire("Berhasil", "Data dihapus", "success");
      } catch (err) {
        console.error("Gagal menghapus data:", err);
        Swal.fire("Gagal", "Tidak bisa menghapus data", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { ...formData, status: true });
      Swal.fire("Berhasil", "Kategori berhasil ditambahkan", "success");
      setFormData({ kategori: "", keterangan: "" });
      setShowModal(false);
      getData();
    } catch (err) {
      console.error("Gagal menambah data:", err);
      Swal.fire("Gagal", "Tidak bisa menambah data", "error");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-blue-700 text-white px-8 py-4 rounded-2xl shadow">
          <h1 className="text-2xl font-semibold">Kategori Data</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg shadow transition"
          >
            + Tambah Data
          </button>
        </div>

        {/* TABEL */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
          {loading ? (
            <p className="text-center py-10 text-gray-500">Memuat data...</p>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-blue-100 text-gray-700">
                  <th className="p-3 text-center">NO</th>
                  <th className="p-3">JENIS KATEGORI</th>
                  <th className="p-3">KETERANGAN</th>
                  <th className="p-3 text-center">STATUS</th>
                  <th className="p-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } border-t`}
                    >
                      <td className="p-3 text-center">{index + 1}</td>
                      <td className="p-3 font-medium">{item.kategori}</td>
                      <td className="p-3 text-gray-600">
                        {item.keterangan || "-"}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          onClick={() => toggleStatus(item.id, item.status)}
                          className={`cursor-pointer px-3 py-1 rounded-full font-semibold text-xs ${
                            item.status
                              ? "bg-green-500 text-white"
                              : "bg-gray-500 text-white"
                          }`}
                        >
                          {item.status ? "AKTIF" : "TIDAK AKTIF"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-medium shadow-sm transition"
                        >
                          <i className="ri-delete-bin-6-line"></i> Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-6 text-gray-500 italic"
                    >
                      Belum ada kategori data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL TAMBAH DATA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Tambah Kategori</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, kategori: e.target.value })
                  }
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Contoh: Guru / Siswa / Karyawan"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Keterangan
                </label>
                <textarea
                  rows="3"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Tulis keterangan tambahan..."
                ></textarea>
              </div>

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

export default KategoriData;
