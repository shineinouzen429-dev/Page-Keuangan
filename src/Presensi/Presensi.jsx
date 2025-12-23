import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:5000";

const PresensiGabungan = () => {
  const [nomorUnik, setNomorUnik] = useState("");
  const [dataOrang, setDataOrang] = useState(null);

  const [isIzin, setIsIzin] = useState(false);
  const [jenisIzin, setJenisIzin] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const [loadingLookup, setLoadingLookup] = useState(false);
  const [saving, setSaving] = useState(false);

  const showMessage = (text, icon = "info") => {
    Swal.fire({ text, icon, timer: 2000, showConfirmButton: false });
  };

  const resetForm = () => {
    setNomorUnik("");
    setDataOrang(null);
    setIsIzin(false);
    setJenisIzin("");
    setKeterangan("");
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomorUnik) return showMessage("Masukkan nomor unik!", "error");
    if (!dataOrang) return showMessage("Nomor unik tidak valid!", "error");

    const now = new Date();
    const tanggal = now.toISOString().slice(0, 10);
    const jam = now.toISOString();
    const jamMenit = now.getHours() * 60 + now.getMinutes();

    let presensiHariIni = null;
    try {
      const cek = await axios.get(`${API_BASE}/presensi`, {
        params: { nomor_unik: nomorUnik, tanggal },
      });
      presensiHariIni = cek.data[0] || null;
    } catch {
      return showMessage("Gagal cek presensi", "error");
    }

    if (isIzin) {
      if (!jenisIzin) return showMessage("Pilih jenis izin!", "error");

      const payload = {
        nomor_unik: nomorUnik,
        nama: dataOrang.nama,
        kategori: dataOrang.kategori || "",
        kelas: dataOrang.kelas || "",
        jurusan: dataOrang.jurusan || "",
        jabatan: dataOrang.jabatan || "",
        bagian: dataOrang.bagian || "",
        tanggal,
        status_kehadiran: "IZIN",
      };

      if (jenisIzin === "TIDAK_BERANGKAT") {
        if (presensiHariIni)
          return showMessage("Sudah ada presensi hari ini", "error");

        if (!keterangan.trim())
          return showMessage("Keterangan wajib diisi", "error");

        payload.keterangan_izin = keterangan;
      }

      if (jenisIzin === "IZIN_MASUK") {
        if (presensiHariIni?.jam_masuk)
          return showMessage("Sudah presensi masuk", "error");

        payload.jam_masuk = jam;
      }

      if (jenisIzin === "IZIN_PULANG") {
        if (!presensiHariIni?.jam_masuk)
          return showMessage("Belum presensi masuk", "error");

        if (!keterangan.trim())
          return showMessage("Keterangan wajib diisi", "error");

        payload.jam_pulang = jam;
        payload.keterangan_izin = keterangan;
      }

      try {
        setSaving(true);
        await axios.post(`${API_BASE}/presensi`, payload);
        showMessage("Izin berhasil disimpan", "success");
        resetForm();
      } catch {
        showMessage("Gagal menyimpan izin", "error");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (presensiHariIni?.status_kehadiran === "IZIN")
      return showMessage("Sudah izin hari ini", "error");

    let mode = "MASUK";
    let statusKehadiran = "HADIR";

    if (jamMenit >= 17 * 60 + 1 || jamMenit < 5 * 60) {
      return Swal.fire("Ditolak", "Sekolah belum dibuka", "error");
    }

    if (jamMenit >= 5 * 60 && jamMenit <= 6 * 60 + 50) {
      if (presensiHariIni?.jam_masuk)
        return showMessage("Sudah presensi masuk", "error");
      statusKehadiran = "TEPAT_WAKTU";
    } else if (jamMenit <= 10 * 60) {
      if (presensiHariIni?.jam_masuk)
        return showMessage("Sudah presensi masuk", "error");
      statusKehadiran = "TERLAMBAT";
    } else if (jamMenit <= 14 * 60 + 59) {
      if (!presensiHariIni?.jam_masuk) {
        statusKehadiran = "TERLAMBAT";
      } else {
        return Swal.fire("Belum Bisa Pulang", "Belum waktunya pulang", "error");
      }
    } else {
      if (!presensiHariIni?.jam_masuk)
        return showMessage("Belum presensi masuk", "error");
      mode = "PULANG";
    }

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

    if (mode === "MASUK") payload.jam_masuk = jam;
    else payload.jam_pulang = jam;

    try {
      setSaving(true);
      await axios.post(`${API_BASE}/presensi`, payload);
      showMessage("Presensi berhasil", "success");
      resetForm();
    } catch {
      showMessage("Gagal menyimpan presensi", "error");
    } finally {
      setSaving(false);
    }
  };

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

          <div className="space-y-4">
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
              <div className="space-y-3">
                <label className="flex gap-2">
                  <input
                    type="radio"
                    value="TIDAK_BERANGKAT"
                    checked={jenisIzin === "TIDAK_BERANGKAT"}
                    onChange={(e) => setJenisIzin(e.target.value)}
                  />
                  Tidak Berangkat
                </label>

                <label className="flex gap-2">
                  <input
                    type="radio"
                    value="IZIN_MASUK"
                    checked={jenisIzin === "IZIN_MASUK"}
                    onChange={(e) => setJenisIzin(e.target.value)}
                  />
                  Izin Jam Masuk
                </label>

                <label className="flex gap-2">
                  <input
                    type="radio"
                    value="IZIN_PULANG"
                    checked={jenisIzin === "IZIN_PULANG"}
                    onChange={(e) => setJenisIzin(e.target.value)}
                  />
                  Izin Jam Pulang
                </label>

                {(jenisIzin === "TIDAK_BERANGKAT" ||
                  jenisIzin === "IZIN_PULANG" ||
                  jenisIzin === "IZIN_MASUK") && (
                  <textarea
                    placeholder="Keterangan izin (opsional untuk jam masuk)"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    className="w-full p-3 rounded bg-black border border-green-400"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`mt-8 w-full py-4 rounded-xl text-black font-bold ${
            saving ? "bg-gray-500" : "bg-green-400 hover:bg-green-500"
          }`}
        >
          {saving ? "Menyimpan..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default PresensiGabungan;
