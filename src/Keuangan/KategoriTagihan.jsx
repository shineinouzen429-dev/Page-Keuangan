import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function KategoriTagihan() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [modal, setModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    jenisTagihan: "",
    keterangan: "",
    masih: true,
  });

  useEffect(() => {
    setTimeout(() => setVisible(true), 150);
    fetchData();
  }, []);

const fetchData = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8080/api/level-tagihan",
    );

    const normalized = response.data.map((item) => ({
      ...item,
      masih: item.masih === true || item.masih === "true",
    }));

    setTagihan(normalized);
  } catch (error) {
    console.error("Gagal ambil data tagihan:", error);
  } finally {
    setLoading(false);
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  if (isEdit) return handleUpdate();

  if (!formData.jenisTagihan || formData.jenisTagihan.trim() === "") {
    return Swal.fire("Error!", "Jenis Tagihan wajib diisi.", "error");
  }
  if (formData.jenisTagihan.length > 50) {
    return Swal.fire("Error!", "Jenis Tagihan maksimal 50 karakter.", "error");
  }
  if (typeof formData.masih !== "boolean") {
    return Swal.fire("Error!", "Status harus dipilih.", "error");
  }

  try {
    await axios.post("http://localhost:8080/api/level-tagihan", formData);
    Swal.fire("Berhasil!", "Data berhasil ditambahkan.", "success");

    setModal(false);
    resetForm();
    fetchData();
  } catch (error) {
    console.error("Gagal menambah data:", error.response?.data || error.message);
    Swal.fire("Error!", error.response?.data?.message || "Gagal menambah data.", "error");
  }
};


  const handleEditClick = (item) => {
    setIsEdit(true);
    setEditingId(item.id);

    setFormData({
      jenisTagihan: item.jenisTagihan,
      keterangan: item.keterangan,
      masih: item.masih,
    });

    setModal(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/level-tagihan/${editingId}`,
        formData,
      );

      Swal.fire("Berhasil!", "Data berhasil diperbarui.", "success");

      setModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Gagal update:", error);
      Swal.fire("Error!", "Gagal memperbarui data.", "error");
    }
  };

  const resetForm = () => {
    setIsEdit(false);
    setEditingId(null);
    setFormData({ jenisTagihan: "", keterangan: "", masih: true });
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
          await axios.delete(`http://localhost:8080/api/level-tagihan/${id}`);
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
  const newStatus = !item.masih;

  const result = await Swal.fire({
    title: "Ubah Status",
    text: `Ubah status menjadi ${newStatus ? "Aktif" : "Tidak Aktif"}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, ubah",
    cancelButtonText: "Batal",
  });

  if (!result.isConfirmed) return;

  try {
    await axios.put(
      `http://localhost:8080/api/level-tagihan/${item.id}`,
      {
        jenisTagihan: item.jenisTagihan,
        keterangan: item.keterangan,
        masih: newStatus,
      }
    );

    setTagihan((prev) =>
      prev.map((data) =>
        data.id === item.id ? { ...data, masih: newStatus } : data
      )
    );

    Swal.fire("Berhasil!", "Status berhasil diubah.", "success");
  } catch (error) {
    console.error(error);
    Swal.fire("Error!", "Gagal mengubah status.", "error");
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
      <div className="flex justify-between items-center bg-white shadow-md rounded-2xl px-8 mb-5 py-5 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <i className="ri-list-check-3 text-white text-2xl"></i>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">
              Kategori Tagihan
            </h1>
            <p className="text-gray-500 text-sm -mt-1">
              Mengatur jenis tagihan & informasi terkait
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
               text-white px-5 py-2.5 rounded-xl font-semibold shadow 
               transition-all duration-300 hover:scale-[1.03]"
        >
          <i className="ri-add-circle-line text-xl"></i>
          Tambah Data
        </button>
      </div>

      <div
        className={`transition-all duration-700 overflow-x-auto backdrop-blur-md shadow-lg rounded-3xl ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <table className="min-w-full border-collapse text-gray-800 text-sm">
          <thead>
            <tr className="bg-blue-100 text-gray-700 uppercase tracking-wide select-none">
              <th className="px-5 py-4 text-center w-[8%] rounded-tl-3xl">
                No
              </th>
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
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } border-t transition cursor-default`}
                >
                  <td className="text-center px-5 py-4 font-semibold">
                    {index + 1}
                  </td>

                  <td className="text-left px-5 py-4 font-medium text-gray-800">
                    {item.jenisTagihan}
                  </td>

                  <td className="text-left px-5 py-4 italic text-gray-600">
                    {item.keterangan || "-"}
                  </td>

                  <td className="text-center px-5 py-4">
                    <span
                      onClick={() => handleToggleStatus(item)}
                      className={`cursor-pointer px-4 py-1 rounded-full text-white text-xs font-semibold transition shadow-sm inline-flex items-center gap-1 select-none
      ${item.masih ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}`}
                    >
                      <i
                        className={
                          item.masih ? "ri-check-line" : "ri-close-line"
                        }
                      ></i>
                      {item.masih ? "AKTIF" : "TIDAK AKTIF"}
                    </span>
                  </td>

                  <td className="text-center px-5 py-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="inline-flex items-center gap-1 px-4 py-1 bg-yellow-500 hover:bg-yellow-600 active:scale-95 rounded-lg text-white text-sm shadow-sm transition select-none"
                    >
                      <i className="ri-edit-2-fill text-md"></i> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-1 px-4 py-1 bg-red-600 hover:bg-red-700 active:scale-95 rounded-lg text-white text-sm shadow-sm transition select-none"
                    >
                      <i className="ri-delete-bin-6-fill text-md"></i> Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
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
              {isEdit ? "Edit Data Tagihan" : "Tambah Data Tagihan"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Jenis Tagihan
                </label>
                <input
                  type="text"
                  placeholder="Masukkan Jenis Tagihan"
                  value={formData.jenisTagihan}
                  onChange={(e) =>
                    setFormData({ ...formData, jenisTagihan: e.target.value })
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
                  value={String(formData.masih)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      masih: e.target.value === "true",
                    })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">-- Pilih Status --</option>
                  <option value="true">Aktif</option>
                  <option value="false">Tidak Aktif</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setModal(false);
                    resetForm();
                  }}
                  className="px-5 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white font-semibold transition active:scale-95"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition active:scale-95"
                >
                  {isEdit ? "Perbarui" : "Simpan"}
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
