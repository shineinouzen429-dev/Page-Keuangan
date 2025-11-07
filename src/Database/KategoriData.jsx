import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function KategoriData({ onDataChange }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    kategori: "",
    kelas: "",
    jurusan: "",
    jabatan: "",
    bagian: "",
  });

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/kategoridata");
      setData(res.data || []);
      if (onDataChange) onDataChange(res.data || []);
    } catch (err) {
      console.error("Gagal ambil data:", err);
      Swal.fire("Error", "Gagal memuat data dari server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      nama: "",
      kategori: "",
      kelas: "",
      jurusan: "",
      jabatan: "",
      bagian: "",
    });
    setIsEditing(false);
    setCurrentId(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setFormData({
      nama: item.nama || "",
      kategori: item.kategori || "",
      kelas: item.kelas || "",
      jurusan: item.jurusan || "",
      jabatan: item.jabatan || "",
      bagian: item.bagian || "",
    });
    setIsEditing(true);
    setCurrentId(item.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      nama: "",
      kategori: "",
      kelas: "",
      jurusan: "",
      jabatan: "",
      bagian: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama.trim() || !formData.kategori) {
      return Swal.fire("Perhatian", "Nama dan kategori harus diisi.", "warning");
    }

    const payload = {
      nama: formData.nama.trim(),
      kategori: formData.kategori,
      kelas: formData.kategori === "siswa" ? formData.kelas.trim() : "",
      jurusan: formData.kategori === "siswa" ? formData.jurusan.trim() : "",
      jabatan: formData.kategori === "guru" ? formData.jabatan.trim() : "",
      bagian: formData.kategori === "karyawan" ? formData.bagian.trim() : "",
    };

    try {
      if (isEditing && currentId) {
        await axios.put(`http://localhost:5000/kategoridata/${currentId}`, payload);
        setData((prev) =>
          prev.map((p) => (p.id === currentId ? { ...p, ...payload } : p))
        );
        Swal.fire("Berhasil!", "Data berhasil diperbarui.", "success");
      } else {
        const res = await axios.post("http://localhost:5000/kategoridata", payload);
        const created = res.data || { id: Date.now(), ...payload };
        setData((prev) => [...prev, created]);
        Swal.fire("Berhasil!", "Data berhasil ditambahkan.", "success");
      }
      closeModal();
      if (onDataChange) onDataChange(data);
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      Swal.fire("Error!", "Gagal menyimpan data.", "error");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Data akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/kategoridata/${id}`);
          setData((prev) => prev.filter((d) => d.id !== id));
          Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
        } catch (err) {
          console.error("Gagal menghapus:", err);
          Swal.fire("Error", "Gagal menghapus data.", "error");
        }
      }
    });
  };

  const filtered = data.filter(
    (d) =>
      d.nama?.toLowerCase().includes(search.toLowerCase()) &&
      (filterKategori === "" || d.kategori === filterKategori)
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-700 to-blue-500 text-white py-5 px-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold tracking-wide drop-shadow">
          Kategori Data
        </h1>
        <button
          onClick={openAddModal}
          className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/30 transition flex items-center gap-2"
        >
          <i className="ri-add-line"></i> Tambah Data
        </button>
      </div>
      <div className="flex flex-wrap gap-4 bg-white shadow-sm border border-blue-100 rounded-xl p-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Cari nama..."
          className="p-2 pl-4 w-64 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400 outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 w-52 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          <option value="siswa">Siswa</option>
          <option value="guru">Guru</option>
          <option value="karyawan">Karyawan</option>
        </select>
      </div>
      <div
        className={`transition-all duration-700 bg-white shadow-lg rounded-2xl overflow-hidden ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-700 to-blue-500 text-white uppercase text-xs tracking-wider">
              <th className="px-4 py-3 text-center w-[6%]">No</th>
              <th className="px-4 py-3 text-left w-[34%]">Nama</th>
              <th className="px-4 py-3 text-left w-[30%]">
                Mapel / Kelas / Bagian
              </th>
              <th className="px-4 py-3 text-center w-[14%]">Kategori</th>
              <th className="px-4 py-3 text-center w-[16%]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`transition-all duration-300  ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-100"
                  }`}
                >
                  <td className="text-center px-4 py-3 border-b">{idx + 1}</td>
                  <td className="text-left px-4 py-3 border-b font-medium text-gray-800">
                    {item.nama}
                  </td>
                  <td className="text-left px-4 py-3 border-b">
                    {item.kategori === "siswa"
                      ? `${item.kelas || "-"} ${item.jurusan || ""}`
                      : item.kategori === "guru"
                      ? item.jabatan || "-"
                      : item.bagian || "-"}
                  </td>
                  <td className="text-center px-4 py-3 border-b">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        item.kategori === "guru"
                          ? "bg-blue-100 text-blue-700"
                          : item.kategori === "siswa"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.kategori.charAt(0).toUpperCase() +
                        item.kategori.slice(1)}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3 border-b">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition text-xs shadow-sm"
                      >
                        <i className="ri-pencil-fill"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs shadow-sm"
                      >
                        <i className="ri-delete-bin-6-fill"></i> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-gray-500 italic bg-gray-50"
                >
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-md p-6 relative animate-slideUp">
            <h2 className="text-xl font-bold mb-4 text-center text-blue-600">
              {isEditing ? "Edit Data" : "Tambah Data"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nama</label>
                  <input
                    className="border rounded w-full py-2 px-3 focus:ring-2 focus:ring-blue-400 outline-none"
                    type="text"
                    placeholder="Masukkan nama"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Kategori
                  </label>
                  <select
                    className="border rounded w-full py-2 px-3 focus:ring-2 focus:ring-blue-400"
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
                    required
                  >
                    <option value="">-- Pilih Kategori --</option>
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                    <option value="karyawan">Karyawan</option>
                  </select>
                </div>

                {formData.kategori === "siswa" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Kelas
                      </label>
                      <select
                        className="border rounded w-full py-2 px-3"
                        value={formData.kelas}
                        onChange={(e) =>
                          setFormData({ ...formData, kelas: e.target.value })
                        }
                        required
                      >
                        <option value="">-- Pilih Kelas --</option>
                        <option value="X">X</option>
                        <option value="XI">XI</option>
                        <option value="XII">XII</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Jurusan
                      </label>
                      <select
                        className="border rounded w-full py-2 px-3"
                        value={formData.jurusan}
                        onChange={(e) =>
                          setFormData({ ...formData, jurusan: e.target.value })
                        }
                        required
                      >
                        <option value="">-- Pilih Jurusan --</option>
                        <option value="TSM">TSM</option>
                        <option value="AKT">AKT</option>
                        <option value="TKJ">TKJ</option>
                        <option value="TB">TB</option>
                      </select>
                    </div>
                  </>
                )}

                {formData.kategori === "guru" && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Jabatan
                    </label>
                    <input
                      className="border rounded w-full py-2 px-3"
                      type="text"
                      placeholder="Masukkan jabatan guru"
                      value={formData.jabatan}
                      onChange={(e) =>
                        setFormData({ ...formData, jabatan: e.target.value })
                      }
                      required
                    />
                  </div>
                )}

                {formData.kategori === "karyawan" && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Bagian
                    </label>
                    <input
                      className="border rounded w-full py-2 px-3"
                      type="text"
                      placeholder="Masukkan bagian karyawan"
                      value={formData.bagian}
                      onChange={(e) =>
                        setFormData({ ...formData, bagian: e.target.value })
                      }
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md"
                >
                  {isEditing ? "Update" : "Simpan"}
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

export default KategoriData;
