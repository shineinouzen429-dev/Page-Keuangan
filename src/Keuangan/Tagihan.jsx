import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function Tagihan() {
  const [tagihan, setTagihan] = useState([]);
  const [jenisTagihan, setJenisTagihan] = useState([]);
  const [masterData, setMasterData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [animateModal, setAnimateModal] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    jenis_tagihan: "",
    jumlah: "",
    status: "Belum lunas",
    kategori: "",
    kelas: "",
    jurusan: "",
    jabatan: "",
    bagian: "",
  });

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const formatRupiah = (angka) =>
    angka ? "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";

  const unformatRupiah = (val) => parseInt(val.replace(/[^0-9]/g, "")) || 0;

  // Fetch Tagihan
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

  // Fetch Jenis Tagihan
  useEffect(() => {
    const fetchJenisTagihan = async () => {
      try {
        const res = await axios.get("http://localhost:5000/kategoritagihan");
        setJenisTagihan(
          res.data.filter((j) => j.masih?.toLowerCase() === "aktif")
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchJenisTagihan();
  }, []);

  // Fetch Master Data
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await axios.get("http://localhost:5000/masterdata");
        setMasterData(res.data);
      } catch (err) {
        console.error("Gagal ambil masterdata:", err);
      }
    };
    fetchMaster();
  }, []);

  const openAddModal = () => {
    setFormData({
      name: "",
      jenis_tagihan: "",
      jumlah: "",
      status: "Belum lunas",
      kategori: "",
      kelas: "",
      jurusan: "",
      jabatan: "",
      bagian: "",
    });

    setIsEditing(false);
    setShowModal(true);
    setAnimateModal("animate-slideUp");
  };

  const openEditModal = (item) => {
    setFormData({
      name: item.name,
      jenis_tagihan: item.jenis_tagihan,
      jumlah: formatRupiah(item.jumlah),
      status: item.status,
      kategori: item.kategori || "",
      kelas: item.kelas || "",
      jurusan: item.jurusan || "",
      jabatan: item.jabatan || "",
      bagian: item.bagian || "",
    });

    setIsEditing(true);
    setCurrentId(item.id);
    setShowModal(true);
    setAnimateModal("animate-slideUp");
  };

  const handleCloseModal = () => {
    setAnimateModal("animate-slideDown");
    setTimeout(() => {
      setShowModal(false);
      setIsEditing(false);
      setFormData({
        name: "",
        jenis_tagihan: "",
        jumlah: "",
        status: "Belum lunas",
        kategori: "",
        kelas: "",
        jurusan: "",
        jabatan: "",
        bagian: "",
      });
      setSuggestions([]);
    }, 350);
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

  const handleNameInput = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, name: val });

    if (val.length >= 1) {
      const filtered = masterData
        .filter((m) => m.kategori?.toLowerCase() === "siswa")
        .filter((m) => m.nama.toLowerCase().includes(val.toLowerCase()));

      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (item) => {
    setFormData({
      ...formData,
      name: item.nama,
      kategori: item.kategori?.toLowerCase() || "",
      kelas: item.kelas || "",
      jurusan: item.jurusan || "",
      jabatan: "",
      bagian: "",
    });

    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      jumlah: unformatRupiah(formData.jumlah),
      status: "Belum lunas",
      created_at: new Date().toISOString(),
    };

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
      return Swal.fire("Sudah Lunas!", "Tagihan ini sudah dibayar.", "info");
    }

    Swal.fire({
      title: "Bayar Tagihan?",
      text: "Status akan menjadi Lunas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, bayar!",
    }).then(async (res) => {
      if (res.isConfirmed) {
        await axios.put(`http://localhost:5000/tagihan/${id}`, {
          ...selected,
          status: "Lunas",
        });

        setTagihan((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: "Lunas" } : t))
        );

        Swal.fire("Berhasil!", "Tagihan sudah dibayar.", "success");
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

    Swal.fire(
      "Status Reset!",
      "Status kembali menjadi Belum Lunas.",
      "success"
    );
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
        <h1 className="text-2xl text-white font-bold">Halaman Tagihan</h1>

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
            placeholder="Cari nama..."
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

      <div
        className={`transition-all duration-700 overflow-x-auto bg-white shadow-md rounded-2xl ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <table className="table-auto w-full border-gray-300">
          <thead className="bg-gradient-to-l from-blue-800 to-blue-600 text-white">
            <tr>
              <th className="px-3 py-2">No</th>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Kelas</th>
              <th className="px-3 py-2">Jurusan</th>
              <th className="px-3 py-2">Jenis Tagihan</th>
              <th className="px-3 py-2">Jumlah</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((t, i) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="text-center">{i + 1}</td>
                  <td className="px-3 py-2">{t.name}</td>
                  <td className="px-3 py-2">{t.kelas || "-"}</td>
                  <td className="px-3 py-2">{t.jurusan || "-"}</td>
                  <td className="px-3 py-2">{t.jenis_tagihan}</td>
                  <td className="text-right px-3 py-2">
                    {formatRupiah(t.jumlah)}
                  </td>
                  <td className="text-center px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded-full font-semibold ${
                        t.status === "Lunas"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="text-center px-3 py-2 flex gap-2 justify-center">
                    <button
                      onClick={() => openEditModal(t)}
                      className="bg-yellow-400 hover:bg-yellow-500 px-2 py-1 rounded text-white text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(t.id)}
                      className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-white text-sm"
                    >
                      Hapus
                    </button>

                    {t.status === "Belum lunas" ? (
                      <button
                        onClick={() => handleBayar(t.id)}
                        className="bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-white text-sm"
                      >
                        Bayar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReset(t.id)}
                        className="bg-gray-500 hover:bg-gray-600 px-2 py-1 rounded text-white text-sm"
                      >
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 animate-fadeIn">
          <div
            className={`bg-white rounded-2xl w-96 p-6 shadow-xl ${animateModal}`}
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              {isEditing ? "Edit Tagihan" : "Tambah Tagihan"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <label className="text-sm font-medium">Nama</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nama"
                  value={formData.name}
                  onChange={handleNameInput}
                  required
                  className="p-2 border rounded-md w-full"
                />

                {suggestions.length > 0 && (
                  <div className="border rounded-md bg-white shadow absolute z-50 w-full max-h-40 overflow-y-auto">
                    {suggestions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => selectSuggestion(s)}
                        className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                      >
                        {s.nama} —{" "}
                        <span className="text-blue-600">{s.kategori}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.kategori && (
                <div className="mt-3 p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm space-y-4">
                  <div>
                    <label className="font-semibold text-gray-700">
                      Kategori
                    </label>
                    <input
                      className="p-2 w-full rounded-md bg-gray-200 border"
                      value={formData.kategori}
                      readOnly
                    />
                  </div>

                  {formData.kategori === "siswa" && (
                    <>
                      <div>
                        <label className="font-semibold text-gray-700">
                          Kelas
                        </label>
                        <input
                          className="p-2 w-full rounded-md bg-gray-200 border"
                          value={formData.kelas}
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-gray-700">
                          Jurusan
                        </label>
                        <input
                          className="p-2 w-full rounded-md bg-gray-200 border"
                          value={formData.jurusan}
                          readOnly
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <label className="block text-sm font-semibold mt-1">
                Jenis Tagihan
              </label>
              <select
                name="jenis_tagihan"
                value={formData.jenis_tagihan}
                onChange={handleChange}
                required
                className="p-2 border rounded-md"
              >
                <option value="">Pilih Jenis Tagihan</option>

                {jenisTagihan.map((j) => (
                  <option key={j.id} value={j.type_bill}>
                    {j.type_bill}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-semibold mt-1">Jumlah</label>
              <input
                type="text"
                name="jumlah"
                placeholder="Jumlah"
                value={formData.jumlah}
                onChange={handleChange}
                required
                className="p-2 border rounded-md"
              />

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-md bg-gray-400 text-white hover:bg-gray-500"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isEditing ? "Simpan" : "Tambah"}
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
