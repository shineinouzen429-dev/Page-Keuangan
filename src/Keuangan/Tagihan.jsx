import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function Tagihan() {
  const style = `
    @keyframes slideUpFade {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .animate-slideUpFade {
      animation: slideUpFade .35s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(50px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(50px); }
    }
    .animate-slideUp { animation: slideUp .35s ease forwards; }
    .animate-slideDown { animation: slideDown .35s ease forwards; }
  `;

  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = style;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

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
  const [animatePay, setAnimatePay] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    jenis_tagihan: "",
    jumlah: "",
    status: "Belum lunas",
    kelas: "",
    jurusan: "",
  });

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const formatRupiah = (angka) =>
    angka ? "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";

  const unformatRupiah = (v) => parseInt(v.replace(/[^0-9]/g, "")) || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/tagihan");
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
    const fetchJenis = async () => {
      try {
        const res = await axios.get("http://localhost:5000/kategoritagihan");
        setJenisTagihan(
          res.data.filter((j) => j.masih?.toLowerCase() === "aktif"),
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchJenis();
  }, []);

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/master-data");
        setMasterData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMaster();
  }, []);

  const openAddModal = () => {
    setFormData({
      nama: "",
      jenis_tagihan: "",
      jumlah: "",
      status: "Belum lunas",
      kelas: "",
      jurusan: "",
    });
    setIsEditing(false);
    setShowModal(true);
    setAnimateModal("animate-slideUp");
  };

  const openEditModal = (item) => {
    setFormData({
      nama: item.nama,
      jenis_tagihan: item.jenis_tagihan,
      jumlah: formatRupiah(String(item.jumlah).replace(/[^0-9]/g, "")),
      status: item.status,
      kelas: item.kelas || "",
      jurusan: item.jurusan || "",
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
      setSuggestions([]);
      setFormData({
        nama: "",
        jenis_tagihan: "",
        jumlah: "",
        status: "Belum lunas",
        kelas: "",
        jurusan: "",
      });
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
    setFormData({ ...formData, nama: val });

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
      nama: item.nama,
      kelas: item.kelas || "",
      jurusan: item.jurusan || "",
    });
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      jumlah: unformatRupiah(formData.jumlah),
      created_at: new Date().toISOString(),
    };

    try {
      if (isEditing) {
        await axios.put(`http://localhost:8080/api/tagihan/${currentId}`, payload);

        setTagihan((prev) =>
          prev.map((t) => (t.id === currentId ? { ...t, ...payload } : t)),
        );

        Swal.fire("Berhasil!", "Data berhasil diperbarui.", "success");
      } else {
        const res = await axios.post("http://localhost:8080/api/tagihan", payload);
        setTagihan((prev) => [...prev, res.data]);
        Swal.fire("Berhasil!", "Data berhasil ditambahkan.", "success");
      }

      handleCloseModal();
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Gagal menyimpan data.", "error");
    }
  };

  const handleBayar = async (id) => {
    const selected = tagihan.find((t) => t.id === id);

    Swal.fire({
      title: "Bayar Tagihan?",
      text: "Status akan menjadi Lunas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, bayar!",
    }).then(async (res) => {
      if (res.isConfirmed) {
        setAnimatePay(id);

        setTimeout(async () => {
          await axios.put(`http://localhost:8080/api/tagihan/${id}`, {
            ...selected,
            status: "Lunas",
          });

          setTagihan((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: "Lunas" } : t)),
          );

          setAnimatePay(null);
          Swal.fire("Berhasil!", "Tagihan sudah dibayar.", "success");
        }, 350);
      }
    });
  };

  const handleReset = async (id) => {
    const selected = tagihan.find((t) => t.id === id);

    setAnimatePay(id);

    setTimeout(async () => {
      await axios.put(`http://localhost:8080/api/tagihan/${id}`, {
        ...selected,
        status: "Belum lunas",
      });

      setTagihan((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "Belum lunas" } : t)),
      );

      setAnimatePay(null);
      Swal.fire("Direset!", "Status kembali menjadi Belum Lunas.", "success");
    }, 350);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Hapus Data?",
      text: "Data tidak bisa dikembalikan setelah dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8080/api/tagihan/${id}`);

          setTagihan((prev) => prev.filter((t) => t.id !== id));

          Swal.fire("Berhasil!", "Data berhasil dihapus.", "success");
        } catch (err) {
          console.error(err);
          Swal.fire("Gagal!", "Tidak dapat menghapus data.", "error");
        }
      }
    });
  };

  const filtered = tagihan.filter(
    (t) =>
      (t.nama || "").toLowerCase().includes(search.toLowerCase()) &&
      (selectedJenis === "" || t.jenis_tagihan === selectedJenis) &&
      (selectedStatus === "" || t.status === selectedStatus),
  );

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 ml-3">
      <div className="flex justify-between items-center bg-white shadow-md rounded-2xl px-8 mb-5 py-5 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <i className="ri-bill-line text-white text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">
              Manajemen Tagihan Siswa
            </h1>
            <p className="text-gray-500 text-sm -mt-1">
              Kelola data tagihan, pembayaran, dan rincian siswa
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
               text-white px-5 py-2.5 rounded-xl font-semibold shadow 
               transition-all duration-300 hover:scale-[1.03]"
        >
          <i className="ri-add-circle-line text-xl"></i>
          Tambah Data
        </button>
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Cari nama..."
            className="p-2 pl-4 w-64 border border-gray-300 rounded-lg shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-2 w-52 border border-gray-300 rounded-lg shadow-sm"
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
            className="p-2 w-44 border border-gray-300 rounded-lg shadow-sm"
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
        className={`transition-all duration-700 overflow-x-auto bg-white shadow-lg rounded-2xl border border-gray-200 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <table className="table-auto w-full text-sm">
          <thead className="bg-blue-100 text-gray-700 uppercase tracking-wide select-none">
            <tr>
              <th className="px-4 py-2">No</th>
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">Kelas</th>
              <th className="px-4 py-2">Jurusan</th>
              <th className="px-4 py-2">Jenis Tagihan</th>
              <th className="px-4 py-2">Jumlah</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((t, i) => (
                <tr
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } border-t transition ${
                    animatePay === t.id ? "animate-slideUpFade" : ""
                  }`}
                >
                  <td className="text-center py-3">{i + 1}</td>
                  <td className="px-4 py-3">{t.nama}</td>
                  <td className="px-4 py-3">{t.kelas || "-"}</td>
                  <td className="px-4 py-3">{t.jurusan || "-"}</td>
                  <td className="px-4 py-3">{t.jenis_tagihan}</td>
                  <td className="px-4 py-3 text-right">
                    {formatRupiah(t.jumlah)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        t.status?.toLowerCase() === "lunas"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td className="px-2 py-2 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => openEditModal(t)}
                      className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow"
                    >
                      <i className="ri-edit-2-line text-lg"></i>
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(t.id)}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded shadow"
                    >
                      <i className="ri-delete-bin-6-line text-lg"></i>
                      Hapus
                    </button>

                    {t.status === "Belum lunas" ? (
                      <button
                        onClick={() => handleBayar(t.id)}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow"
                      >
                        <i className="ri-money-dollar-circle-line text-lg"></i>
                        Bayar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReset(t.id)}
                        className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded shadow"
                      >
                        <i className="ri-refresh-line text-lg"></i>
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
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div
            className={`bg-white w-96 p-6 rounded-2xl shadow-xl ${animateModal}`}
          >
            <h2 className="text-xl font-bold text-center mb-4 text-blue-700">
              {isEditing ? "Edit Tagihan" : "Tambah Tagihan"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <label className="text-sm font-semibold">Nama</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleNameInput}
                  className="p-2 w-full border rounded-md"
                  required
                />

                {suggestions.length > 0 && (
                  <div className="absolute w-full bg-white border rounded-md shadow max-h-40 overflow-y-auto z-50">
                    {suggestions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => selectSuggestion(s)}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {s.nama} —{" "}
                        <span className="text-blue-600">
                          {s.kelas}/{s.jurusan}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="text-sm font-semibold">Kelas</label>
              <input
                type="text"
                name="kelas"
                value={formData.kelas}
                onChange={handleChange}
                className="p-2 w-full border rounded-md"
              />

              <label className="text-sm font-semibold">Jurusan</label>
              <input
                type="text"
                name="jurusan"
                value={formData.jurusan}
                onChange={handleChange}
                className="p-2 w-full border rounded-md"
              />

              <label className="text-sm font-semibold">Jenis Tagihan</label>
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

              <label className="text-sm font-semibold">Jumlah</label>
              <input
                type="text"
                name="jumlah"
                value={formData.jumlah}
                onChange={handleChange}
                required
                className="p-2 border rounded-md"
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-600 text-white rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
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
