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
    setTimeout(() => setVisible(true), 150);
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

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600 font-medium text-lg">
        Loading...
      </p>
    );

  return (
    <div className="p-6 ml-3 min-h-screen">
      <div className="flex justify-between items-center mb-6 rounded-2xl py-5 px-6 bg-gradient-to-l from-blue-800 to-blue-600">
        <h1 className="text-2xl text-white font-bold">Kategori Tagihan</h1>
        <button
          onClick={() => setModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow"
        >
          + Tambah Data
        </button>
      </div>
      <div
        className={`transition-all duration-700 overflow-x-auto bg-white/80 backdrop-blur-md shadow-lg rounded-3xl border border-blue-200 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <table className="min-w-full border-collapse text-gray-800">
          <thead>
            <tr className="bg-gradient-to-r from-blue-700 to-blue-900 text-white text-sm uppercase tracking-wider select-none rounded-t-3xl">
              <th className="px-5 py-4 text-center w-[8%] rounded-tl-3xl">No</th>
              <th className="px-5 py-4 text-left w-[25%]">Jenis Tagihan</th>
              <th className="px-5 py-4 text-left w-[35%]">Keterangan</th>
              <th className="px-5 py-4 text-center w-[15%]">Status</th>
              <th className="px-5 py-4 text-center w-[17%] rounded-tr-3xl">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {tagihan.length > 0 ? (
              tagihan.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-blue-50 transition duration-200 text-sm cursor-default"
                >
                  <td className="text-center px-5 py-4 font-semibold">{index + 1}</td>
                  <td className="text-left px-5 py-4 font-medium">{item.type_bill}</td>
                  <td className="text-left px-5 py-4 italic text-gray-600">
                    {item.keterangan || "-"}
                  </td>
                  <td className="text-center px-5 py-4">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`px-4 py-1 rounded-full text-white text-xs font-semibold transition shadow-sm select-none ${
                        item.masih?.toLowerCase() === "aktif"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-500 hover:bg-gray-600"
                      }`}
                      aria-label={`Ubah status menjadi ${
                        item.masih?.toLowerCase() === "aktif"
                          ? "tidak aktif"
                          : "aktif"
                      }`}
                    >
                      {item.masih?.toUpperCase() || "TIDAK DIKETAHUI"}
                    </button>
                  </td>
                  <td className="text-center px-5 py-4">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-2 px-4 py-1 bg-red-600 hover:bg-red-700 active:scale-95 rounded-lg text-white text-sm shadow-md transition select-none"
                      aria-label="Hapus data tagihan"
                    >
                     <i class="ri-delete-bin-6-fill"></i>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-400 italic select-none"
                >
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-8 relative">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">
              Tambah Data Tagihan
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Jenis Tagihan
                </label>
                <input
                  type="text"
                  name="type_bill"
                  placeholder="Masukkan Jenis Tagihan"
                  value={formData.type_bill}
                  onChange={(e) =>
                    setFormData({ ...formData, type_bill: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Keterangan
                </label>
                <input
                  type="text"
                  name="keterangan"
                  placeholder="Masukkan Keterangan"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Status
                </label>
                <select
                  name="masih"
                  value={formData.masih}
                  onChange={(e) =>
                    setFormData({ ...formData, masih: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">-- Pilih Status --</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak aktif">Tidak aktif</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="px-5 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white font-semibold transition active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition active:scale-95"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease forwards;
        }
      `}</style>
    </div>
  );
}

export default KategoriTagihan;
