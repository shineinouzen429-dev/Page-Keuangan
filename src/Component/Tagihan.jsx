import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function Tagihan() {
  const [tagihan, setTagihan] = useState([]);
  const [jenisTagihan, setJenisTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    jenis_tagihan: "",
    jumlah: "",
    status: "Belum lunas",
  });

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const formatRupiah = (angka) =>
    angka ? "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";

  const unformatRupiah = (val) => parseInt(val.replace(/[^0-9]/g, "")) || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/tagihan");
        setTagihan(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchJenisTagihan = async () => {
      try {
        const res = await axios.get("http://localhost:5000/jenistagihan");
        setJenisTagihan(res.data.filter((j) => j.masih === "aktif"));
      } catch (err) {
        console.error(err);
      }
    };
    fetchJenisTagihan();
  }, []);

  const openAddModal = () => {
    setFormData({ name: "", jenis_tagihan: "", jumlah: "", status: "Belum lunas" });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setFormData({
      name: item.name,
      jenis_tagihan: item.jenis_tagihan,
      jumlah: formatRupiah(item.jumlah),
      status: item.status,
    });
    setIsEditing(true);
    setCurrentId(item.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setFormData({ name: "", jenis_tagihan: "", jumlah: "", status: "Belum lunas" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "jumlah") {
      const angka = value.replace(/[^0-9]/g, "");
      setFormData({ ...formData, jumlah: formatRupiah(angka) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, jumlah: unformatRupiah(formData.jumlah) };

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/tagihan/${currentId}`, payload);
        setTagihan((prev) =>
          prev.map((t) => (t.id === currentId ? { ...t, ...payload } : t))
        );
        Swal.fire("Berhasil!", "Data berhasil diperbarui.", "success");
      } else {
        const res = await axios.post("http://localhost:5000/tagihan", payload);
        setTagihan((prev) => [...prev, res.data]);
        Swal.fire("Berhasil!", "Data berhasil ditambahkan.", "success");
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
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
    }).then(async (r) => {
      if (r.isConfirmed) {
        await axios.delete(`http://localhost:5000/tagihan/${id}`);
        setTagihan((prev) => prev.filter((t) => t.id !== id));
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
      }
    });
  };

const handleBayar = async (id) => {
  const selected = tagihan.find((t) => t.id === id);

  if (selected.status === "Lunas") {
    return Swal.fire("Sudah lunas!", "Tagihan sudah dibayar.", "info");
  }

  // Tambahkan konfirmasi sebelum ubah status
  Swal.fire({
    title: "Yakin ingin membayar?",
    text: "Status tagihan akan diubah menjadi Lunas.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, bayar!",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.put(`http://localhost:5000/tagihan/${id}`, {
          ...selected,
          status: "Lunas",
        });
        setTagihan((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: "Lunas" } : t))
        );
        Swal.fire("Berhasil!", "Status diperbarui menjadi Lunas.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal!", "Terjadi kesalahan saat mengubah status.", "error");
      }
    }
  });
};


  const handleReset = async (id) => {
    const selected = tagihan.find((t) => t.id === id);
    await axios.put(`http://localhost:5000/tagihan/${id}`, {
      ...selected,
      status: "Belum lunas",
    });
    setTagihan((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Belum lunas" } : t))
    );
    Swal.fire("Berhasil!", "Status direset ke Belum lunas.", "success");
  };

  const filtered = tagihan.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedJenis === "" || t.jenis_tagihan === selectedJenis) &&
      (selectedStatus === "" || t.status === selectedStatus)
  );

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
   
      <div className="p-6 ml-3">
        <div className="flex justify-between items-center mb-6 rounded-2xl py-5 px-6 bg-gradient-to-l from-blue-800 to-blue-600">
          <h1 className="text-2xl font-bold">Halaman Tagihan</h1>
          <button
            onClick={openAddModal}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow"
          >
            + Tambah Data
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Cari nama siswa..."
              className="p-2 pl-4 w-64 border-2 border-gray-300 rounded-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="p-2 w-52 border-2 border-gray-300 rounded-md"
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
            >
              <option value="">Semua Jenis Tagihan</option>
              {jenisTagihan.map((j) => (
                <option key={j.id} value={j.type_bill}>
                  {j.type_bill}
                </option>
              ))}
            </select>
            <select
              className="p-2 w-44 border-2 border-gray-300 rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum lunas">Belum Lunas</option>
            </select>
          </div>
        </div>

        <div className={`transition-all duration-700 overflow-x-auto bg-white shadow-md rounded-2xl ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}>
          <table className="table-auto w-full border-gray-300">
            <thead className="bg-gradient-to-l from-blue-800 to-blue-600 text-white">
              <tr>
                <th className="px-3 py-2">No</th>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2">Jenis Tagihan</th>
                <th className="px-3 py-2">Jumlah</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((t, i) => (
                  <tr key={t.id} className="">
                    <td className="text-center">{i + 1}</td>
                    <td className="text-left px-3 py-2">{t.name}</td>
                    <td className="text-left px-3 py-2">{t.jenis_tagihan}</td>
                    <td className="text-right px-3 py-2">{formatRupiah(t.jumlah)}</td>
                   <td className="text-center px-3 py-2">
                      <span
                        className={`${
                          t.status === "Lunas"
                            ? "text-green-600 bg-green-100 px-3 py-1 rounded"
                            : "text-red-600 bg-red-100 px-3 py-1 rounded"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          <i class="ri-pencil-line"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          <i class="ri-delete-bin-6-fill"></i> Hapus
                        </button>
                        {t.status === "Belum lunas" ? (
                          <button
                            onClick={() => handleBayar(t.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                          >
                            💲 Bayar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReset(t.id)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                          >
                            🔁 Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500 italic">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] relative mb-35">
              <h2 className="text-xl font-bold mb-4 text-center">
                {isEditing ? "Edit Tagihan" : "Tambah Tagihan"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block font-semibold">Nama</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="border w-full rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold">Jenis Tagihan</label>
                  <select
                    name="jenis_tagihan"
                    value={formData.jenis_tagihan}
                    onChange={handleChange}
                    required
                    className="border w-full rounded p-2"
                  >
                    <option value="">-- Pilih Jenis Tagihan --</option>
                    {jenisTagihan.map((j) => (
                      <option key={j.id} value={j.type_bill}>
                        {j.type_bill}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold">Jumlah</label>
                  <input
                    type="text"
                    name="jumlah"
                    value={formData.jumlah}
                    onChange={handleChange}
                    required
                    className="border w-full rounded p-2"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
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

export default Tagihan;
