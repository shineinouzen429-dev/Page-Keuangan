import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function Jenistagihan() {
  const [tagihan, setTagihan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/jenistagihan");
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
      text: "Data akan hilang 😜!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/jenistagihan/${id}`);
          setTagihan((prev) => prev.filter((item) => item.id !== id));
          Swal.fire("Deleted!", "Data berhasil dihapus.", "success");
        } catch (err) {
          console.error("Gagal menghapus data:", err);
          Swal.fire("Error!", "Gagal menghapus data.", "error");
        }
      }
    });
  };

  const handleToggleStatus = async (item) => {
    const currentStatus = item.masih?.toLowerCase();
    const newStatus = currentStatus === "aktif" ? "nonaktif" : "aktif";

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
        await axios.put(`http://localhost:5000/jenistagihan/${item.id}`, {
          ...item,
          masih: newStatus,
        });

        setTagihan((prev) =>
          prev.map((data) =>
            data.id === item.id ? { ...data, masih: newStatus } : data
          )
        );

        Swal.fire(
          "Berhasil!",
          `Status diubah menjadi ${newStatus}.`,
          "success"
        );
      } catch (error) {
        console.error("Gagal ubah status:", error);
        Swal.fire("Error!", "Gagal mengubah status.", "error");
      }
    }
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
        <div className="flex justify-between items-center mb-6 rounded-2xl py-5 px-10 bg-yellow-400 shadow-mdrelative">
          <h1 className="text-2xl font-bold text-center w-full mr-210">
            Jenis Tagihan
          </h1>
          <button
            onClick={() => navigate("/Tambahjenistagihan")}
            className="absolute right-10 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow"
          >
            + Tambah Data
          </button>
        </div>

        <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-sky-500 text-white text-sm uppercase tracking-wider">
                <th className="px-4 py-3 text-center w-[8%] rounded-tl-2xl">
                  No
                </th>
                <th className="px-4 py-3 text-left w-[25%]">Jenis Tagihan</th>
                <th className="px-4 py-3 text-left w-[35%]">Keterangan</th>
                <th className="px-4 py-3 text-center w-[15%]">Status</th>
                <th className="px-4 py-3 text-center w-[17%] rounded-tr-2xl">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="text-gray-800">
              {tagihan.length > 0 ? (
                tagihan.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50 transition duration-150 text-sm"
                  >
                    <td className="text-center px-4 py-3 align-top">
                      {index + 1}
                    </td>
                    <td className="text-left px-4 py-3 align-top">
                      {item.type_bill}
                    </td>

                    <td className="text-left px-4 py-3 whitespace-normal break-words max-w-sm align-top">
                      {item.keterangan || "-"}
                    </td>

                    <td className="text-center px-4 py-3 align-top">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-3 py-1 rounded text-white text-xs font-semibold transition ${
                          item.masih?.toLowerCase() === "aktif"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-500 hover:bg-gray-600"
                        }`}
                      >
                        {item.masih?.toUpperCase() || "TIDAK DIKETAHUI"}
                      </button>
                    </td>

                    <td className="text-center px-4 py-3 align-top">
                      <div className="flex justify-center space-x-3">
                        
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                        >
                          <i className="ri-delete-bin-6-line mr-1"></i> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
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

export default Jenistagihan;
