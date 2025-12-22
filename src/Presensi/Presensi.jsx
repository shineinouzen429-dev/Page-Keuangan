import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:5000";

const PresensiGabungan = () => {
  const [nomorUnik, setNomorUnik] = useState("");
  const [dataOrang, setDataOrang] = useState(null);
  const [isIzin, setIsIzin] = useState(false);
  const [keterangan, setKeterangan] = useState("");
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [saving, setSaving] = useState(false);

  const showMessage = (text, icon = "info") => {
    Swal.fire({ text, icon, timer: 2000, showConfirmButton: false });
  };

  /* ================= LOOKUP NOMOR UNIK ================= */
  useEffect(() => {
    if (!nomorUnik) {
      setDataOrang(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingLookup(true);
      try {
        const res = await axios.get(`${API_BASE}/masterdata`, {
          params: { nomor_unik: nomorUnik },
        });

        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.masterdata || [];

        if (!data.length) {
          setDataOrang(null);
          showMessage("Nomor unik tidak ditemukan", "error");
          return;
        }

        setDataOrang(data[0]);
      } catch {
        showMessage("Gagal lookup data", "error");
      } finally {
        setLoadingLookup(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [nomorUnik]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomorUnik) return showMessage("Masukkan nomor unik!", "error");
    if (!dataOrang) return showMessage("Nomor unik tidak valid!", "error");
    if (isIzin && !keterangan.trim())
      return showMessage("Isi keterangan izin!", "error");

    const now = new Date();
    const tanggal = now.toISOString().slice(0, 10);
    const jam = now.toISOString();
    const jamMenit = now.getHours() * 60 + now.getMinutes();

    /* ===== CEK PRESENSI HARI INI ===== */
    let sudahMasuk = false;

    try {
      const cek = await axios.get(`${API_BASE}/presensi`, {
        params: { nomor_unik: nomorUnik, tanggal },
      });

      if (cek.data.length && cek.data[0].jam_masuk) {
        sudahMasuk = true;
      }
    } catch {
      showMessage("Gagal cek presensi hari ini", "error");
      return;
    }

    /* ===== TENTUKAN MODE OTOMATIS ===== */
    let mode = "MASUK";
    let statusKehadiran = "HADIR";

    /* ===== 17.01 – 04.59 : SEKOLAH BELUM DIBUKA ===== */
    if (jamMenit >= 17 * 60 + 1 || jamMenit < 5 * 60) {
      await Swal.fire({
        title: "Ditolak",
        text: "Sekolah belum dibuka",
        icon: "error",
      });
      return;
    }

    /* ===== 05.00 – 06.50 : MASUK TEPAT WAKTU ===== */
    if (jamMenit >= 5 * 60 && jamMenit <= 6 * 60 + 50) {
      if (sudahMasuk) return showMessage("Sudah presensi masuk", "error");
      statusKehadiran = "TEPAT_WAKTU";
      await Swal.fire("Tepat Waktu", "Masuk tepat waktu", "success");
    }

    /* ===== 06.51 – 10.00 : MASUK TERLAMBAT ===== */
    else if (jamMenit <= 10 * 60) {
      if (sudahMasuk) return showMessage("Sudah presensi masuk", "error");
      statusKehadiran = "TERLAMBAT";
      await Swal.fire("Terlambat", "Anda terlambat hadir", "warning");
    }

    /* ===== 10.01 – 14.59 : DINAMIS ===== */
    else if (jamMenit <= 14 * 60 + 59) {
      if (!sudahMasuk) {
        statusKehadiran = "TERLAMBAT";
        await Swal.fire("Terlambat", "Anda terlambat hadir", "warning");
      } else {
        await Swal.fire({
          title: "Belum Bisa Pulang",
          text: "Belum waktunya pulang",
          icon: "error",
        });
        return;
      }
    }

    /* ===== 15.00 – 17.00 : PULANG ===== */
    else {
      if (!sudahMasuk)
        return showMessage("Belum presensi masuk", "error");
      mode = "PULANG";
      await Swal.fire("Pulang", "Pulang tepat waktu", "success");
    }

    /* ===== PAYLOAD (TIDAK DIUBAH) ===== */
    const payload = {
      nomor_unik: nomorUnik,
      nama: dataOrang.nama,
      kategori: dataOrang.kategori || "",
      kelas: dataOrang.kelas || "",
      jurusan: dataOrang.jurusan || "",
      jabatan: dataOrang.jabatan || "",
      bagian: dataOrang.bagian || "",
      tanggal,
      status_kehadiran: statusKehadiran,
    };

    if (isIzin) {
      payload.keterangan_izin = keterangan;
    } else if (mode === "MASUK") {
      payload.jam_masuk = jam;
    } else {
      payload.jam_pulang = jam;
    }

    try {
      setSaving(true);
      await axios.post(`${API_BASE}/presensi`, payload);
      showMessage("Presensi berhasil disimpan", "success");

      setNomorUnik("");
      setDataOrang(null);
      setIsIzin(false);
      setKeterangan("");
    } catch {
      showMessage("Gagal menyimpan presensi", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI (TIDAK DIUBAH) ================= */
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl p-8 rounded-3xl bg-black/80 border border-green-400 text-green-300"
      >
        <div className="grid md:grid-cols-2 gap-10">
          <div className="flex justify-center">
            <img
              src={
                dataOrang?.foto ||
                "https://i.pinimg.com/736x/38/41/97/384197530d32338dd6caafaf1c6a26c4.jpg"
              }
              alt="foto"
              className="w-72 h-72 rounded-2xl object-cover border border-green-400"
            />
          </div>

          <div className="space-y-5">
            <input
              placeholder="Nomor Unik"
              value={nomorUnik}
              onChange={(e) => setNomorUnik(e.target.value.trim())}
              disabled={saving}
              className="w-full p-3 rounded bg-black border border-green-400"
            />

            <input
              disabled
              value={loadingLookup ? "Mencari..." : dataOrang?.nama || "-"}
              className="w-full p-3 rounded bg-black border border-green-400"
            />

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isIzin}
                onChange={(e) => setIsIzin(e.target.checked)}
              />
              Izin
            </label>

            {isIzin && (
              <textarea
                placeholder="Keterangan izin"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full p-3 rounded bg-black border border-green-400"
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`mt-8 w-full py-4 rounded-xl text-black font-bold
            ${saving ? "bg-gray-500" : "bg-green-400 hover:bg-green-500"}`}
        >
          {saving ? "Menyimpan..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default PresensiGabungan;
