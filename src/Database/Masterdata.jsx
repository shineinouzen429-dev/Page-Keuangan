import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const defaultFoto =
  "https://i.pinimg.com/736x/b1/26/e5/b126e56c40c6cbffb30bd5e4204a1a0e.jpg";

function MasterData() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [showNomorUnikRow, setShowNomorUnikRow] = useState({});
  const [kelasData, setKelasData] = useState([]);

const getKelasData = async () => {
  try {
    const res = await axios.get("http://localhost:5000/kelasdata");
    setKelasData(res.data || []);
  } catch (err) {
    console.error("Gagal mengambil data kelas:", err);
  }
};

useEffect(() => {
  getKelasData();
}, []);

const getUniqueJurusan = () => {
  const jurusanList = kelasData.map((item) => item.jurusan).filter(Boolean);
  return [...new Set(jurusanList)];
};


  const [formData, setFormData] = useState({
    nama: "",
    kategori: "",
    kelas: "",
    jurusan: "",
    jabatan: "",
    bagian: "",
    nomor_unik: "",
    foto: defaultFoto,
  });

  const API_URL = "http://localhost:5000/masterdata";

  const generateUniqueCode = () => "";

  const getData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setData(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const totalGuru = data.filter(
    (d) => d.kategori?.toLowerCase() === "guru"
  ).length;
  const totalSiswa = data.filter(
    (d) => d.kategori?.toLowerCase() === "siswa"
  ).length;
  const totalKaryawan = data.filter(
    (d) => d.kategori?.toLowerCase() === "karyawan"
  ).length;
  const totalDatabase = data.length;

  const filteredData =
    filter === "Semua"
      ? data.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()))
      : data
          .filter((d) => d.kategori?.toLowerCase() === filter.toLowerCase())
          .filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.nama || !formData.kategori) {
        Swal.fire("Lengkapi Form", "Nama dan Kategori wajib diisi", "warning");
        return;
      }

      if (!formData.nomor_unik || formData.nomor_unik.length !== 10) {
        Swal.fire(
          "Nomor Unik Tidak Valid",
          "Nomor unik harus tepat 8 karakter",
          "warning"
        );
        return;
      }
      if (!/^\d{10}$/.test(formData.nomor_unik)) {
        Swal.fire(
          "Nomor Unik Tidak Valid",
          "Nomor unik harus 8 digit angka",
          "warning"
        );
        return;
      }

      const newData = {
        nama: formData.nama,
        kategori: formData.kategori.toLowerCase(),
        kelas: formData.kelas || "",
        jurusan: formData.jurusan || "",
        jabatan: formData.jabatan || "",
        bagian: formData.bagian || "",
        nomor_unik: formData.nomor_unik,
        foto: formData.foto || defaultFoto,
      };

      if (editMode) {
        await axios.put(`${API_URL}/${editId}`, newData);
        Swal.fire("Berhasil", "Data berhasil diperbarui", "success");
      } else {
        await axios.post(API_URL, newData);
        Swal.fire("Berhasil", "Data berhasil ditambahkan", "success");
      }

      setFormData({
        nama: "",
        kategori: "",
        kelas: "",
        jurusan: "",
        jabatan: "",
        bagian: "",
        nomor_unik: "",
        foto: defaultFoto,
      });

      setEditMode(false);
      setEditId(null);
      setShowModal(false);

      getData();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      Swal.fire("Gagal", "Tidak bisa menyimpan data", "error");
    }
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setEditId(item.id);
    setShowModal(true);

    setFormData({
      nama: item.nama || "",
      kategori: item.kategori
        ? item.kategori.charAt(0).toUpperCase() + item.kategori.slice(1)
        : "",
      kelas: item.kelas || "",
      jurusan: item.jurusan || "",
      jabatan: item.jabatan || "",
      bagian: item.bagian || "",
      nomor_unik: item.nomor_unik || "",
      foto: item.foto || defaultFoto,
    });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      Swal.fire("Berhasil", "Data berhasil dihapus", "success");
      getData();
    } catch (err) {
      console.error("Gagal hapus:", err);
      Swal.fire("Gagal", "Tidak bisa menghapus data", "error");
    }
  };

  return (
    <div className="min-h-screen p-8 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
        <div className="flex justify-between items-center bg-white shadow-md rounded-2xl px-8 py-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <i className="ri-database-line text-white text-2xl"></i>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800 leading-tight">
                Master Data
              </h1>
              <p className="text-gray-500 text-sm -mt-1">
                Kelola semua data seperti siswa, guru, karyawan & lainnya
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditMode(false);
              setFormData({
                nama: "",
                kategori: "",
                kelas: "",
                jurusan: "",
                jabatan: "",
                bagian: "",
                nomor_unik: "",
                foto: defaultFoto,
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow transition-all duration-300 hover:scale-[1.03]"
          >
            <i className="ri-add-circle-line text-xl"></i>
            Tambah Data
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            title="Total Guru"
            count={totalGuru}
            color="blue"
            icon="ri-user-star-fill"
          />
          <Card
            title="Total Siswa"
            count={totalSiswa}
            color="green"
            icon="ri-team-fill"
          />
          <Card
            title="Total Karyawan"
            count={totalKaryawan}
            color="amber"
            icon="ri-user-2-fill"
          />
          <Card
            title="Total Database"
            count={totalDatabase}
            color="purple"
            icon="ri-server-fill"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 overflow-x-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h2 className="text-xl font-semibold">Daftar Data</h2>
              <p className="text-sm text-gray-500">
                Menampilkan semua data kategori.
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Cari nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border py-2 px-4 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border py-2 px-3 rounded-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                <option value="Semua">Semua</option>
                <option value="Guru">Guru</option>
                <option value="Siswa">Siswa</option>
                <option value="Karyawan">Karyawan</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-center py-10 text-gray-500">Memuat data...</p>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-100 text-sm text-left">
                  <th className="p-3">No</th>
                  <th className="p-3">Foto</th>
                  <th className="p-3">Nomor Unik</th>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Mapel / Kelas / Bagian</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      } transition`}
                    >
                      <td className="p-3 text-center">{index + 1}</td>
                      <td className="p-3">
                        <img
                          src={item.foto || defaultFoto}
                          alt={item.nama}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </td>
                      <td className="p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="tracking-widest">
                            {item.nomor_unik
                              ? showNomorUnikRow[item.id]
                                ? item.nomor_unik
                                : "••••••••"
                              : "-"}
                          </span>

                          {item.nomor_unik && (
                            <button
                              type="button"
                              onClick={() =>
                                setShowNomorUnikRow((prev) => ({
                                  ...prev,
                                  [item.id]: !prev[item.id],
                                }))
                              }
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <i
                                className={`ri ${
                                  showNomorUnikRow[item.id]
                                    ? "ri-eye-off-line"
                                    : "ri-eye-line"
                                }`}
                              ></i>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="p-3">{item.nama}</td>
                      <td className="p-3">
                        {item.kategori === "siswa"
                          ? `${item.kelas || "-"} ${item.jurusan || ""}`
                          : item.kategori === "guru"
                          ? item.jabatan || "-"
                          : item.bagian || "-"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item.kategori === "guru"
                              ? "bg-blue-100 text-blue-700"
                              : item.kategori === "siswa"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.kategori
                            ? item.kategori.charAt(0).toUpperCase() +
                              item.kategori.slice(1)
                            : "-"}
                        </span>
                      </td>
                      <td className="p-3 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                        >
                          <i className="ri-edit-line"></i>Edit
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <i className="ri-delete-bin-6-line"></i>Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-6 text-gray-500 italic"
                    >
                      Tidak ada data untuk kategori ini.
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
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 overflow-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? "Edit Data" : "Tambah Data Master"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Nama
                </label>
                <input
                  required
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Masukkan Nama"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <select
                  required
                  value={formData.kategori}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      kategori: selected,
                      kelas: "",
                      jurusan: "",
                      jabatan: "",
                      bagian: "",
                      nomor_unik:
                        !editMode && selected
                          ? generateUniqueCode(selected)
                          : prev.nomor_unik,
                    }));
                  }}
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Guru">Guru</option>
                  <option value="Siswa">Siswa</option>
                  <option value="Karyawan">Karyawan</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Nomor Unik
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.nomor_unik}
                    maxLength={10}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setFormData({ ...formData, nomor_unik: value });
                    }}
                    placeholder="Masukkan Nomer Unik"
                    className="w-full mt-1 p-2 border rounded-lg
  focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Foto Profil (URL)
                </label>
                <input
                  type="text"
                  value={formData.foto}
                  onChange={(e) =>
                    setFormData({ ...formData, foto: e.target.value })
                  }
                  placeholder="Masukkan URL foto"
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              {formData.kategori === "Guru" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Mapel
                  </label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) =>
                      setFormData({ ...formData, jabatan: e.target.value })
                    }
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              )}

              {formData.kategori === "Siswa" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Kelas
                    </label>
                    <select
                      required
                      value={formData.kelas}
                      onChange={(e) =>
                        setFormData({ ...formData, kelas: e.target.value })
                      }
                      className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      <option value="">Pilih Kelas</option>
                      <option value="X">X</option>
                      <option value="XI">XI</option>
                      <option value="XII">XII</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Jurusan
                    </label>
                   <select
  required
  value={formData.jurusan}
  onChange={(e) =>
    setFormData({ ...formData, jurusan: e.target.value })
  }
  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
>
  <option value="">Pilih Jurusan</option>
  {getUniqueJurusan().map((jrs) => (
    <option key={jrs} value={jrs}>
      {jrs}
    </option>
  ))}
</select>

                  </div>
                </div>
              )}

              {formData.kategori === "Karyawan" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Bagian
                  </label>
                  <input
                    type="text"
                    value={formData.bagian}
                    onChange={(e) =>
                      setFormData({ ...formData, bagian: e.target.value })
                    }
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  {editMode ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, count, color, icon }) {
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    amber: "bg-amber-500",
    purple: "bg-purple-500",
    gray: "bg-gray-500",
  };
  return (
    <div
      className={`p-5 rounded-2xl text-white flex items-center gap-5 shadow-lg ${colors[color]}`}
    >
      {icon && <i className={`text-3xl ri ${icon}`}></i>}
      <div>
        <p className="font-bold text-3xl">{count}</p>
        <p className="opacity-90">{title}</p>
      </div>
    </div>
  );
}

export default MasterData;
