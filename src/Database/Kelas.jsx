import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function Kelas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [editId, setEditId] = useState(null);

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
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        Swal.fire("Berhasil", "Data kelas berhasil diperbarui", "success");
      } else {
        await axios.post(API_URL, formData);
        Swal.fire("Berhasil", "Data kelas berhasil ditambahkan", "success");
      }

      setFormData({ kelas: "", jurusan: "" });
      setEditId(null);
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire("Gagal", "Tidak bisa menyimpan data kelas", "error");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      kelas: item.kelas,
      jurusan: item.jurusan,
    });
    setEditId(item.id);
    setShowModal(true);
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
    <div className="min-h-screen p-8 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
        <div
          className="flex justify-between items-center 
    bg-white shadow-md rounded-2xl px-8 py-5 border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <i className="ri-team-line text-white text-2xl"></i>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800 leading-tight">
                Data Kelas
              </h1>
              <p className="text-gray-500 text-sm -mt-1">
                Kelola daftar kelas dan jurusan
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setFormData({ kelas: "", jurusan: "" });
              setEditId(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
    text-white px-5 py-2.5 rounded-xl font-semibold shadow 
    transition-all duration-300 hover:scale-[1.03]"
          >
            <i className="ri-add-circle-line text-xl"></i>
            Tambah Data
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

                      <td className="p-3 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg font-medium shadow-sm transition"
                        >
                          <i className="ri-edit-line"></i> Edit
                        </button>

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
            <h2 className="text-xl font-semibold mb-4">
              {editId ? "Edit Data Kelas" : "Tambah Data Kelas"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Kelas
                </label>
                <input
                  type="text"
                  required
                  value={formData.kelas}
                  onChange={(e) =>
                    setFormData({ ...formData, kelas: e.target.value })
                  }
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Jurusan
                </label>
                <input
                  type="text"
                  required
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
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editId ? "Update" : "Simpan"}
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
