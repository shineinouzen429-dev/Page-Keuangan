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

    if (formData.kategori === "siswa" && (!formData.kelas || !formData.jurusan)) {
      return Swal.fire("Perhatian", "Kelas dan jurusan wajib diisi untuk siswa.", "warning");
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
        setData((prev) => prev.map((p) => (p.id === currentId ? { ...p, ...payload } : p)));
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
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/kategoridata/${id}`);
          setData((prev) => prev.filter((d) => d.id !== id));
          Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
          if (onDataChange) onDataChange(data.filter((d) => d.id !== id));
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

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 ml-3 min-h-screen">
      <div className="flex justify-between items-center mb-6 rounded-2xl py-5 px-10 bg-gradient-to-l from-blue-800 to-blue-600 shadow-md relative">
        <h1 className="text-2xl font-bold text-left w-full text-white">Kategori Data</h1>
        <div className="absolute right-10 flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow"
          >
            + Tambah Data
          </button>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Cari nama..."
          className="p-2 pl-4 w-64 border-2 border-gray-300 rounded-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 w-52 border-2 border-gray-300 rounded-md"
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
        className={`transition-all duration-700 overflow-x-auto bg-white shadow-md rounded-2xl ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-l from-blue-800 to-blue-600 text-white text-sm uppercase tracking-wider">
              <th className="px-4 py-3 text-center w-[6%] rounded-tl-2xl">No</th>
              <th className="px-4 py-3 text-left w-[34%]">Nama</th>
              <th className="px-4 py-3 text-left w-[30%]">Jabatan / Kelas / Bagian</th>
              <th className="px-4 py-3 text-center w-[14%]">Kategori</th>
              <th className="px-4 py-3 text-center w-[16%] rounded-tr-2xl">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  className=" hover:bg-gray-50 transition duration-150 text-sm"
                >
                  <td className="text-center px-4 py-3">{idx + 1}</td>
                  <td className="text-left px-4 py-3">{item.nama}</td>
                  <td className="text-left px-4 py-3">
                    {item.kategori === "siswa"
                      ? `${item.kelas || "-"} ${item.jurusan || ""}`
                      : item.kategori === "guru"
                      ? item.jabatan || "-"
                      : item.bagian || "-"}
                  </td>
                  <td className="text-center px-4 py-3 capitalize">{item.kategori}</td>
                  <td className="text-center px-4 py-3">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 italic">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 relative animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-center">
              {isEditing ? "Edit Data" : "Tambah Data"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-2">Nama</label>
                <input
                  className="border rounded w-full py-2 px-3"
                  name="nama"  
                  type="text"
                  placeholder="Masukkan nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold mb-2">Kategori</label>
                <select
                  className="border rounded w-full py-2 px-3"
                  name="kategori"
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
                  <div className="mb-3">
                    <label className="block text-sm font-bold mb-2">Kelas</label>
                    <select
                      className="border rounded w-full py-2 px-3"
                      name="kelas"
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

                  <div className="mb-3">
                    <label className="block text-sm font-bold mb-2">Jurusan</label>
                    <select
                      className="border rounded w-full py-2 px-3"
                      name="jurusan"
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
                <div className="mb-3">
                  <label className="block text-sm font-bold mb-2">Jabatan</label>
                  <input
                    className="border rounded w-full py-2 px-3"
                    name="jabatan"
                    type="text"
                    placeholder="Masukkan Data Guru"
                    value={formData.jabatan}
                    onChange={(e) =>
                      setFormData({ ...formData, jabatan: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              {formData.kategori === "karyawan" && (
                <div className="mb-3">
                  <label className="block text-sm font-bold mb-2">Bagian</label>
                  <input
                    className="border rounded w-full py-2 px-3"
                    name="bagian"
                    type="text"
                    placeholder="Masukkan Data Bagian"
                    value={formData.bagian}
                    onChange={(e) =>
                      setFormData({ ...formData, bagian: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
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

export default KategoriData;
