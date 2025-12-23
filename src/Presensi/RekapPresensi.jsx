import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:5000";

const RekapPresensi = () => {
  const [filterDate, setFilterDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const [rekap, setRekap] = useState([]);
  const [rekapFiltered, setRekapFiltered] = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [filterNama, setFilterNama] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");

  const showMessage = (text, type = "info") => {
    Swal.fire({ text, icon: type, timer: 2000, showConfirmButton: false });
  };

  const fmtTime = (isoString) => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const toTimeValue = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const options = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      };
      return new Intl.DateTimeFormat("id-ID", options).format(date);
    } catch {
      return "";
    }
  };
  useEffect(() => {
    let filtered = [...rekap];

    if (filterNama.trim() !== "") {
      filtered = filtered.filter((r) =>
        r.nama.toLowerCase().includes(filterNama.toLowerCase())
      );
    }

    if (filterKategori !== "Semua") {
      filtered = filtered.filter(
        (r) => r.kategori.toLowerCase() === filterKategori.toLowerCase()
      );
    }

    if (filterStatus !== "Semua") {
      filtered = filtered.filter((r) => {
        if (filterStatus === "IZIN") {
          return r.status.toUpperCase().includes("IZIN");
        }
        return r.status.toUpperCase() === filterStatus.toUpperCase();
      });
    }

    setRekapFiltered(filtered);
  }, [filterNama, filterKategori, filterStatus, rekap]);

  const fmtStatus = (r) => {
    if (r.keterangan_izin?.trim()) {
      if (!r.jam_masuk && !r.jam_pulang) {
        return "IZIN (TIDAK BERANGKAT)";
      }

      if (r.jam_masuk && r.jam_pulang) {
        return "IZIN (PULANG)";
      }

      return "IZIN";
    }

    if (r.status_kehadiran === "TEPAT_WAKTU") return "TEPAT WAKTU";
    if (r.status_kehadiran === "TERLAMBAT") return "TERLAMBAT";

    if (r.jam_masuk) return "HADIR";

    return "-";
  };

  const fetchRekap = async (date) => {
    setLoadingRekap(true);
    try {
      const res = await axios.get(`${API_BASE}/presensi`, {
        params: { tanggal: date },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.presensi || [];

      const merged = {};
      list.forEach((row) => {
        const key = row.nomor_unik;
        if (!merged[key]) {
          merged[key] = { ...row };
        } else {
          if (row.jam_masuk) merged[key].jam_masuk = row.jam_masuk;
          if (row.jam_pulang) merged[key].jam_pulang = row.jam_pulang;
          if (row.keterangan_izin)
            merged[key].keterangan_izin = row.keterangan_izin;
        }
      });

      const finalList = Object.values(merged).map((r) => ({
        ...r,
        jamMasukFormatted: fmtTime(r.jam_masuk),
        jamPulangFormatted: fmtTime(r.jam_pulang),
        status: fmtStatus(r),

        key: r.nomor_unik,
      }));

      setRekap(finalList);
      setRekapFiltered(finalList);
    } catch {
      showMessage("Gagal memuat rekap presensi", "error");
    } finally {
      setLoadingRekap(false);
    }
  };

  useEffect(() => {
    fetchRekap(filterDate);
  }, []);

  useEffect(() => {
    let filtered = [...rekap];

    if (filterNama.trim() !== "") {
      filtered = filtered.filter((r) =>
        r.nama.toLowerCase().includes(filterNama.toLowerCase())
      );
    }

    if (filterKategori !== "Semua") {
      filtered = filtered.filter(
        (r) => r.kategori.toLowerCase() === filterKategori.toLowerCase()
      );
    }

    setRekapFiltered(filtered);
  }, [filterNama, filterKategori, rekap]);

  const openEditModal = (row) => {
    const jamMasukValue = toTimeValue(row.jam_masuk);
    const jamPulangValue = toTimeValue(row.jam_pulang);

    setEditData({
      ...row,
      jam_masuk: jamMasukValue,
      jam_pulang: jamPulangValue,
      keterangan_izin: row.keterangan_izin || "",

      // FLAG
      canEditJamMasuk: !!row.jam_masuk,
      canEditJamPulang: !!row.jam_pulang,
    });

    setShowModal(true);
  };

  const saveEdit = async () => {
    if (!editData) return;

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (
      (editData.jam_masuk && !timeRegex.test(editData.jam_masuk)) ||
      (editData.jam_pulang && !timeRegex.test(editData.jam_pulang))
    ) {
      showMessage("Format jam harus HH:mm", "warning");
      return;
    }

    setSaving(true);
    try {
      await axios.put(`${API_BASE}/presensi/${editData.id}`, {
        jam_masuk: editData.canEditJamMasuk ? editData.jam_masuk || null : null,
        jam_pulang: editData.canEditJamPulang
          ? editData.jam_pulang || null
          : null,
        keterangan_izin: editData.keterangan_izin || null,
      });

      showMessage("Data berhasil diperbarui", "success");
      setShowModal(false);
      fetchRekap(filterDate);
    } catch {
      showMessage("Gagal menyimpan perubahan", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteData = async (row) => {
    const confirm = await Swal.fire({
      title: "Hapus presensi?",
      text: row.nama,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/presensi/${row.id}`);
      showMessage("Data berhasil dihapus", "success");
      fetchRekap(filterDate);
    } catch {
      showMessage("Gagal menghapus data", "error");
    }
  };

  const renderDetail = (r) => {
    const kategori = r.kategori?.toLowerCase();

    const detailUtama = (() => {
      if (kategori === "siswa")
        return `Kelas: ${r.kelas || "-"} ${r.jurusan || ""}`;
      if (kategori === "guru") return `Mapel: ${r.jabatan || "-"}`;
      if (kategori === "karyawan") return `Bagian: ${r.bagian || "-"}`;
      return "-";
    })();

    let izinText = "";

    if (r.status_kehadiran === "IZIN") {
      if (!r.jam_masuk && !r.jam_pulang) {
        izinText = `Izin: ${r.keterangan_izin || "-"}`;
      } else if (r.jam_masuk && !r.jam_pulang) {
        izinText = "Izin: Magang";
      } else if (r.jam_pulang) {
        izinText = "Izin: Pulang Awal";
      }
    }

    return (
      <div className="text-sm leading-tight">
        <div>{detailUtama}</div>
        <div className="text-red-600">
          {izinText || "\u00A0"}
          {r.keterangan_izin && r.jam_masuk && (
            <div className="text-xs">({r.keterangan_izin})</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow">
          <i className="ri-list-check-3 text-white text-2xl"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Rekap Presensi</h2>
          <p className="text-gray-500 text-sm -mt-1">
            Kelola dan lihat seluruh data presensi dengan mudah
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border mb-6">
        <div className="flex flex-wrap items-end justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border px-3 py-1 rounded-lg"
            />
            <button
              onClick={() => fetchRekap(filterDate)}
              className="bg-blue-500 text-white px-4 py-1 rounded-lg shadow hover:bg-blue-600"
            >
              {loadingRekap ? "Memuat..." : "Tampilkan"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Cari nama..."
            value={filterNama}
            onChange={(e) => setFilterNama(e.target.value)}
            className="border px-3 py-2 rounded-lg w-60"
          />
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option>Semua</option>
            <option>Siswa</option>
            <option>Guru</option>
            <option>Karyawan</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option>Semua</option>
            <option>TEPAT WAKTU</option>
            <option>TERLAMBAT</option>
            <option>IZIN</option>
            <option>HADIR</option>
            <option>IZIN (TIDAK BERANGKAT)</option>
            <option>IZIN (PULANG)</option>
          </select>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-3 border-b">No</th>
                <th className="px-4 py-3 border-b">Nomor Unik</th>
                <th className="px-4 py-3 border-b">Nama</th>
                <th className="px-4 py-3 border-b">Kategori</th>
                <th className="px-4 py-3 border-b">Detail</th>
                <th className="px-4 py-3 border-b">Jam Masuk</th>
                <th className="px-4 py-3 border-b">Jam Pulang</th>
                <th className="px-4 py-3 border-b">Status</th>
                <th className="px-4 py-3 border-b">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {rekapFiltered.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                rekapFiltered.map((r, idx) => (
                  <tr key={r.key} className="border-b">
                    <td className="px-4 py-3 text-center">{idx + 1}</td>
                    <td className="px-4 py-3">{r.nomor_unik}</td>
                    <td className="px-4 py-3">{r.nama}</td>
                    <td className="px-4 py-3 capitalize">{r.kategori}</td>
                    <td className="px-3 py-3">{renderDetail(r)}</td>
                    <td className="px-4 py-3">{r.jamMasukFormatted}</td>
                    <td className="px-4 py-3">{r.jamPulangFormatted}</td>
                    <td className="px-4 py-3">{r.status}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEditModal(r)}
                          className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                        >
                          <i className="ri-edit-2-line text-lg"></i>Edit
                        </button>
                        <button
                          onClick={() => deleteData(r)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <i className="ri-delete-bin-6-line text-lg"></i>Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Edit Presensi</h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm">Nama</label>
                <input
                  type="text"
                  value={editData.nama}
                  disabled
                  className="w-full border px-3 py-2 rounded bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm">Jam Masuk</label>
                <input
                  type="text"
                  placeholder="HH:mm"
                  value={editData.jam_masuk}
                  disabled={!editData.canEditJamMasuk}
                  onChange={(e) =>
                    setEditData({ ...editData, jam_masuk: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded ${
                    !editData.canEditJamMasuk
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>

              <div>
                <label className="text-sm">Jam Pulang</label>
                <input
                  type="text"
                  placeholder="HH:mm"
                  value={editData.jam_pulang}
                  disabled={!editData.canEditJamPulang}
                  onChange={(e) =>
                    setEditData({ ...editData, jam_pulang: e.target.value })
                  }
                  className={`w-full border px-3 py-2 rounded ${
                    !editData.canEditJamPulang
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>

              {editData.keterangan_izin && (
  <div>
    <label className="text-sm">Keterangan Izin</label>
    <textarea
      value={editData.keterangan_izin}
      onChange={(e) =>
        setEditData({
          ...editData,
          keterangan_izin: e.target.value,
        })
      }
      className="w-full border px-3 py-2 rounded"
      rows="2"
    />
  </div>
)}

            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border"
              >
                Batal
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapPresensi;
