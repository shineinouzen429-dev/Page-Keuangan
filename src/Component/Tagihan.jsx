import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function Tagihan() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const formatRupiah = (angka) => {
    if (!angka && angka !== 0) return "";
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const filteredTagihan = tagihan.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

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

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Data akan hilang😜!",
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

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

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

        <div className="mb-5">
          <input
            type="text"
            placeholder="Cari data (nama siswa)..."
            className="p-2 focus:outline-none text-black border-2 rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
          <table className="table-auto w-full border-gray-300">
            <thead className="bg-gray-200">
              <tr className="bg-sky-500 text-white">
                <th className="text-center px-3 py-2">No</th>
                <th className="text-left px-3 py-2">Nama</th>
                <th className="text-left px-3 py-2">Jenis tagihan</th>
                <th className="text-right px-3 py-2 align-middle">Jumlah</th>
                <th className="text-center px-3 py-2">Status pembayaran</th>
                <th className="text-left px-3 py-2">Aksi</th>
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

                    <td className="text-right px-3 py-2 align-middle">
                      {formatRupiah(item.jumlah)}
                    </td>

                    <td className="text-center px-3 py-2">{item.status}</td>
                    <td className="px-3 py-2 text-left">
                      <button
                        onClick={() => navigate(`/Edittagihanedit/${item.id}`)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        <i className="ri-edit-line"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded ml-4"
                      >
                        <i class="ri-delete-bin-6-line"></i>
                        Hapus
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
                    Belum ada data
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
