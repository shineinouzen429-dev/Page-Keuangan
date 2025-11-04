import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function KategoriTagihan() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({
    type_bill: "",
    keterangan: "",
    masih: "",
  });

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/kategoritagihan");
      setTagihan(response.data);
    } catch (error) {
      console.error("Gagal ambil data tagihan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/kategoritagihan", formData);
      Swal.fire({
        title: "Berhasil!",
        text: "Data Berhasil Ditambahkan.",
        icon: "success",
      });
      setModal(false);
      setFormData({ type_bill: "", keterangan: "", masih: "" });
      fetchData();
    } catch (error) {
      console.error("Gagal menambah data:", error);
      Swal.fire("Error!", "Gagal menambah data.", "error");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Data akan hilang !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/kategoritagihan/${id}`);
          setTagihan((prev) => prev.filter((item) => item.id !== id));
          Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
        } catch (err) {
          console.error("Gagal menghapus data:", err);
          Swal.fire("Error!", "Gagal menghapus data.", "error");
        }
      }
    });
  };

  const handleToggleStatus = async (item) => {
    const currentStatus = item.masih?.toLowerCase();
    const newStatus = currentStatus === "aktif" ? "tidak aktif" : "aktif";

    const result = await Swal.fire({
      title: "Ubah Status",
      text: `Apakah kamu ingin mengubah status menjadi ${newStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, ubah",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`http://localhost:5000/kategoritagihan/${item.id}`, {
          ...item,
          masih: newStatus,
        });

        setTagihan((prev) =>
          prev.map((data) =>
            data.id === item.id ? { ...data, masih: newStatus } : data
          )
        );

        Swal.fire("Berhasil!", `Status diubah menjadi ${newStatus}.`, "success");
      } catch (error) {
        console.error("Gagal ubah status:", error);
        Swal.fire("Error!", "Gagal mengubah status.", "error");
      }
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
   
      <div className="p-6 ml-3 min-h-screen">
        
        <div className="flex justify-between items-center mb-6 rounded-2xl py-5 px-10 bg-gradient-to-l from-blue-800 to-blue-600 shadow-md relative">
          <h1 className="text-2xl font-bold text-left w-full text-white">Kategori Tagihan</h1>
          <button
            onClick={() => setModal(true)}
            className="absolute right-10 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow"
          >
            + Tambah Data
          </button>
        </div>
        <div className={`transition-all duration-700 overflow-x-auto bg-white shadow-md rounded-2xl ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}>
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-l from-blue-800 to-blue-600 text-white text-sm uppercase tracking-wider">
                <th className="px-4 py-3 text-center w-[8%] rounded-tl-2xl">No</th>
                <th className="px-4 py-3 text-left w-[25%]">Jenis Tagihan</th>
                <th className="px-4 py-3 text-left w-[35%]">Keterangan</th>
                <th className="px-4 py-3 text-center w-[15%]">Status</th>
                <th className="px-4 py-3 text-center w-[17%] rounded-tr-2xl">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {tagihan.length > 0 ? (
                tagihan.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50 transition duration-150 text-sm"
                  >
                    <td className="text-center px-4 py-3">{index + 1}</td>
                    <td className="text-left px-4 py-3">{item.type_bill}</td>
                    <td className="text-left px-4 py-3">{item.keterangan || "-"}</td>
                    <td className="text-center px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-3 py-1 rounded text-white text-xs font-semibold transition ${
                          item.masih?.toLowerCase() === "aktif"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-500 hover:bg-gray-600"
                        }`}
                      >
                        {item.masih?.toUpperCase() || "TIDAK DIKETAHUI"}
                      </button>
                    </td>
                    <td className="text-center px-4 py-3">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                      >
                        <i className="ri-delete-bin-6-line mr-1"></i> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                    Belum ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fadeIn mb-20">
              <h2 className="text-xl font-bold mb-4 text-center">Tambah Data</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="block text-sm font-bold mb-2">
                    Jenis Tagihan
                  </label>
                  <input
                    className="border rounded w-full py-2 px-3"
                    name="type_bill"
                    type="text"
                    placeholder="Masukkan Jenis Tagihan"
                    value={formData.type_bill}
                    onChange={(e) =>
                      setFormData({ ...formData, type_bill: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-bold mb-2">
                    Keterangan
                  </label>
                  <input
                    className="border rounded w-full py-2 px-3"
                    name="keterangan"
                    type="text"
                    placeholder="Masukkan Keterangan"
                    value={formData.keterangan}
                    onChange={(e) =>
                      setFormData({ ...formData, keterangan: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-bold mb-2">Status</label>
                  <select
                    className="border rounded w-full py-2 px-3"
                    name="masih"
                    value={formData.masih}
                    onChange={(e) =>
                      setFormData({ ...formData, masih: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Pilih Status --</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak aktif">Tidak aktif</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setModal(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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

export default KategoriTagihan;
