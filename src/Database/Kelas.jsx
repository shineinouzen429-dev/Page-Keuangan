import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function Kelas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    kelas: "",
    jurusan: "",
  });

  const API_URL = "http://localhost:5000/kelasdata";

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setData(res.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      Swal.fire("Gagal", "Tidak bisa mengambil data kelas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);

      Swal.fire("Berhasil", "Data kelas berhasil ditambahkan", "success");

      setFormData({ kelas: "", jurusan: "" });
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire("Gagal", "Tidak bisa menambah data kelas", "error");
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

        Swal.fire("Berhasil", "Data berhasil dihapus", "success");
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Gagal", "Tidak bisa menghapus data", "error");
      }
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">

        <div className="flex justify-between items-center bg-blue-700 text-white px-8 py-4 rounded-2xl shadow">
          <h1 className="text-2xl font-semibold">Data Kelas</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg shadow transition"
          >
            + Tambah Data
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
          {loading ? (
            <p className="text-center py-10 text-gray-500">Memuat data...</p>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-blue-100 text-gray-700">
                  <th className="p-3 text-center">KELAS</th>
                  <th className="p-3 text-center">JURUSAN</th>
                  <th className="p-3 text-center">AKSI</th>
                </tr>
              </thead>

              <tbody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item.id} className="border-t even:bg-gray-50">
                      <td className="p-3 text-center font-semibold text-blue-700">
                        {item.kelas}
                      </td>

                      <td className="p-3 text-center font-semibold text-indigo-700">
                        {item.jurusan}
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
                      colSpan="3"
                      className="text-center py-6 text-gray-500 italic"
                    >
                      Belum ada data kelas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Tambah Data Kelas</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: X, XI, XII"
                  value={formData.kelas}
                  onChange={(e) =>
                    setFormData({ ...formData, kelas: e.target.value })
                  }
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Jurusan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TKJ, TSM, AKT"
                  value={formData.jurusan}
                  onChange={(e) =>
                    setFormData({ ...formData, jurusan: e.target.value })
                  }
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
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

export default Kelas;
