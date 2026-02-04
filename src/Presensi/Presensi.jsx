import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:8080/api";

const PresensiGabungan = () => {
  const [nomerUnik, setNomerUnik] = useState("");
  const [dataOrang, setDataOrang] = useState(null);

  const [isIzin, setIsIzin] = useState(false);
  const [jenisIzin, setJenisIzin] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const [loadingLookup, setLoadingLookup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showMessage = (text, icon = "info") => {
    Swal.fire({ text, icon, timer: 2000, showConfirmButton: false });
  };

  const resetForm = () => {
    setNomerUnik("");
    setDataOrang(null);
    setIsIzin(false);
    setJenisIzin("");
    setKeterangan("");
  };

  useEffect(() => {
    if (!nomerUnik) {
      setDataOrang(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingLookup(true);
      try {
        const res = await axios.get(`${API_BASE}/master-data`, {
          params: { nomer_unik: nomerUnik },
        });

        const data = Array.isArray(res.data) ? res.data : [];

        if (!data.length) {
          setDataOrang(null);
          showMessage("Nomer unik tidak ditemukan", "error");
          return;
        }

        setDataOrang(data[0]);
      } catch (err) {
        console.error("Lookup masterdata error:", err);
        showMessage("Gagal lookup data", "error");
      } finally {
        setLoadingLookup(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [nomerUnik]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomerUnik) return showMessage("Masukkan nomer unik!", "error");
    if (!dataOrang) return showMessage("Nomer unik tidak valid!", "error");

    const now = new Date();
    const tanggal = now.toISOString().slice(0, 10);
    const jam = now.toISOString();
    const jamMenit = now.getHours() * 60 + now.getMinutes();

    let presensiHariIni = null;
    try {
      const cek = await axios.get(`${API_BASE}/presensi`, {
        params: { nomer_unik: nomerUnik, tanggal },
      });

      const list = Array.isArray(cek.data) ? cek.data : [];
      presensiHariIni = list.length ? list[0] : null;
    } catch (err) {
      console.error(err);
      return showMessage("Gagal cek presensi", "error");
    }

    if (isIzin) {
      if (!jenisIzin) return showMessage("Pilih jenis izin!", "error");

      const payload = {
        nomer_unik: nomerUnik,
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
      } catch (err) {
        console.error(err);
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

    if (jamMenit >= 17 * 60 + 1 || jamMenit < 5 * 60)
      return Swal.fire("Ditolak", "Sekolah belum dibuka", "error");

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
      nomer_unik: nomerUnik,
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
    } catch (err) {
      console.error(err);
      showMessage("Gagal menyimpan presensi", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6
    bg-gradient-to-br from-emerald-900 via-black to-black"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl p-10 rounded-3xl
        bg-black/60 backdrop-blur-xl
        border border-emerald-400/40
        text-emerald-200
        shadow-[0_0_35px_rgba(16,185,129,0.25)]"
      >
        <div className="grid md:grid-cols-2 gap-10">
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-4">
              <img
                src={
                  dataOrang?.foto ||
                  "https://i.pinimg.com/736x/38/41/97/384197530d32338dd6caafaf1c6a26c4.jpg"
                }
                alt="foto"
                className="w-72 h-72 rounded-2xl object-cover
        border border-emerald-400/60
        shadow-[0_0_25px_rgba(16,185,129,0.35)]"
              />

              <div
                className="w-64 text-center rounded-xl
        bg-black/70 backdrop-blur-md
        border border-emerald-400/40
        text-emerald-300
        px-4 py-2
        shadow-lg"
              >
                <div className="text-lg font-bold tracking-wide">
                  {nowTime.toLocaleTimeString("id-ID")}
                </div>
                <div className="text-sm text-emerald-400">
                  {nowTime.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <input
              placeholder="Nomer Unik"
              value={nomerUnik}
              onChange={(e) => setNomerUnik(e.target.value.trim())}
              disabled={saving}
              className="w-full p-4 rounded-xl
              bg-black/70
              border border-emerald-400/40
              placeholder:text-emerald-700
              focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <input
              disabled
              value={loadingLookup ? "Mencari..." : dataOrang?.nama || "-"}
              className="w-full p-4 rounded-xl
              bg-black/70
              border border-emerald-400/20
              text-emerald-400"
            />

            <label className="flex items-center gap-3 text-emerald-300">
              <input
                type="checkbox"
                checked={isIzin}
                onChange={(e) => setIsIzin(e.target.checked)}
                className="accent-emerald-400 w-5 h-5"
              />
              Izin
            </label>

            {isIzin && (
              <div
                className="space-y-4 p-5 rounded-2xl
              bg-black/50 border border-emerald-400/30"
              >
                {[
                  { label: "Tidak Berangkat", value: "TIDAK_BERANGKAT" },
                  { label: "Izin Jam Masuk", value: "IZIN_MASUK" },
                  { label: "Izin Jam Pulang", value: "IZIN_PULANG" },
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-3">
                    <input
                      type="radio"
                      value={item.value}
                      checked={jenisIzin === item.value}
                      onChange={(e) => setJenisIzin(e.target.value)}
                      className="accent-emerald-400"
                    />
                    {item.label}
                  </label>
                ))}

                <textarea
                  placeholder="Keterangan izin"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full p-4 rounded-xl
                  bg-black/70
                  border border-emerald-400/40
                  placeholder:text-emerald-700
                  focus:outline-none focus:ring-2 focus:ring-emerald-400
                  resize-none"
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`mt-10 w-full py-4 rounded-2xl
          font-bold text-black text-lg
          transition-all duration-300
          ${
            saving
              ? "bg-gray-600"
              : "bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 shadow-lg"
          }`}
        >
          {saving ? "Menyimpan..." : "SUBMIT"}
        </button>
      </form>
    </div>
  );
};

export default PresensiGabungan;
