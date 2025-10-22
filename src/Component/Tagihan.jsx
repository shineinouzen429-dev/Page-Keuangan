import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function Tagihan() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [jenisTagihan, setJenisTagihan] = useState([]);

  const navigate = useNavigate();

  const handleReset = async (id) => {
    const tagihanDipilih = tagihan.find((item) => item.id === id);

    Swal.fire({
      title: "Reset Status?",
      text: `Apakah ingin mengembalikan status tagihan ${tagihanDipilih.name} menjadi 'Belum lunas'?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, reset!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`http://localhost:5000/tagihan/${id}`, {
            ...tagihanDipilih,
            status: "Belum lunas",
          });

          setTagihan((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, status: "Belum lunas" } : item
            )
          );

          Swal.fire("Berhasil!", "Status berhasil direset.", "success");
        } catch (error) {
          console.error("Gagal reset status:", error);
          Swal.fire("Error!", "Gagal mereset status tagihan.", "error");
        }
      }
    });
  };

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const formatRupiah = (angka) => {
    if (!angka && angka !== 0) return "";
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/tagihan");
        setTagihan(response.data);
      } catch (error) {
        console.error("Gagal ambil data tagihan:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchJenisTagihan = async () => {
      try {
        const response = await axios.get("http://localhost:5000/jenistagihan");
        const aktif = response.data.filter((item) => item.masih === "aktif");
        setJenisTagihan(aktif);
      } catch (error) {
        console.error("Gagal ambil data jenis tagihan:", error);
      }
    };

    fetchJenisTagihan();
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Data akan hilang 😜!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/tagihan/${id}`);
          setTagihan((prev) => prev.filter((item) => item.id !== id));
          Swal.fire("Deleted!", "Data berhasil dihapus.", "success");
        } catch (err) {
          console.error("Gagal menghapus data:", err);
          Swal.fire("Error!", "Gagal menghapus data.", "error");
        }
      }
    });
  };

  const handleBayar = async (id) => {
    const tagihanDipilih = tagihan.find((item) => item.id === id);

    if (tagihanDipilih.status === "Lunas") {
      Swal.fire("Sudah Lunas!", "Tagihan ini sudah dibayar.", "info");
      return;
    }

    Swal.fire({
      title: "Konfirmasi Pembayaran",
      text: `Apakah tagihan atas nama ${tagihanDipilih.name} sudah dibayar?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, bayar!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(`http://localhost:5000/tagihan/${id}`, {
            ...tagihanDipilih,
            status: "Lunas",
          });

          setTagihan((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, status: "Lunas" } : item
            )
          );

          Swal.fire("Berhasil!", "Tagihan telah dilunasi.", "success");
        } catch (error) {
          console.error("Gagal memperbarui status:", error);
          Swal.fire("Error!", "Gagal memperbarui status tagihan.", "error");
        }
      }
    });
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const filteredTagihan = tagihan.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedJenis === "" || item.jenis_tagihan === selectedJenis) &&
      (selectedStatus === "" || item.status === selectedStatus)
  );

  return (
    <div
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <div className="p-6 ml-3">
        <div className="flex justify-between items-center mb-6 rounded-2xl py-5 px-20 bg-yellow-400">
          <h1 className="text-2xl font-bold">Halaman Tagihan</h1>
          <button
            onClick={() => navigate("/Tambahtagihan")}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow"
          >
            + Tambah Data
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            🔍 Cari Data Tagihan
          </h2>

          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Cari nama siswa..."
              className="p-2 pl-4 w-64 border-2 border-gray-300 rounded-md text-gray-700 shadow-sm bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="p-2 w-52 border-2 border-gray-300 rounded-md text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200"
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
            >
              <option value="">Semua Jenis Tagihan</option>
              {jenisTagihan.map((jenis) => (
                <option key={jenis.id} value={jenis.type_bill}>
                  {jenis.type_bill}
                </option>
              ))}
            </select>

            <select
              className="p-2 w-44 border-2 border-gray-300 rounded-md text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-200"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum lunas">Belum Lunas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
          <table className="table-auto w-full border-gray-300">
            <thead className="bg-gray-200">
              <tr className="bg-sky-500 text-white">
                <th className="text-center px-3 py-2">No</th>
                <th className="text-center px-3 py-2">Nama</th>
                <th className="text-center px-3 py-2">Jenis Tagihan</th>
                <th className="text-center px-3 py-2">Jumlah</th>
                <th className="text-center px-3 py-2">Status</th>
                <th className="text-center px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTagihan.length > 0 ? (
                filteredTagihan.map((item, index) => (
                  <tr key={item.id} className="transition duration-200">
                    <td className="text-center">{index + 1}</td>
                    <td className="text-left px-3 py-2">{item.name}</td>
                    <td className="text-left px-3 py-2">
                      {item.jenis_tagihan}
                    </td>
                    <td className="text-right px-3 py-2">
                      {formatRupiah(item.jumlah)}
                    </td>
                    <td className="text-center px-3 py-2">
                      <span
                        className={`${
                          item.status === "Lunas"
                            ? "text-green-600 bg-green-100 px-3 py-1 rounded"
                            : "text-red-600 bg-red-100 px-3 py-1 rounded"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/Edittagihanedit/${item.id}`)
                          }
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                          <i className="ri-edit-line"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          <i className="ri-delete-bin-6-line"></i> Hapus
                        </button>
                        {item.status === "Belum lunas" ? (
                          <button
                            onClick={() => handleBayar(item.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                          >
                            💰 Bayar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReset(item.id)}
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
                  <td
                    colSpan="6"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Tidak ada data ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Tagihan;
