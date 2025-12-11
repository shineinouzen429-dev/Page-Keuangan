import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:5000";

const Presensi = () => {
  const [nomorUnik, setNomorUnik] = useState("");
  const [dataOrang, setDataOrang] = useState(null);
  const [status, setStatus] = useState("Masuk");

  const [loadingLookup, setLoadingLookup] = useState(false);
  const [saving, setSaving] = useState(false);

  const showMessage = (text, type = "info") => {
    const icon =
      type === "error" ? "error" : type === "success" ? "success" : "info";
    Swal.fire({ text, icon, timer: 2000, showConfirmButton: false });
  };

  useEffect(() => {
    if (!nomorUnik) return setDataOrang(null);

    let cancelled = false;
    const timer = setTimeout(() => {
      lookupNomorUnik(nomorUnik).catch(() => {
        if (!cancelled) showMessage("Gagal lookup data", "error");
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [nomorUnik]);

  const lookupNomorUnik = async (nomor) => {
    setLoadingLookup(true);
    try {
      const res = await axios.get(`${API_BASE}/masterdata`, {
        params: { nomor_unik: nomor },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.masterdata || [];

      if (!data || data.length === 0) {
        setDataOrang(null);
        showMessage("Nomor unik tidak ditemukan", "error");
        return null;
      }

      const orang = data[0];
      setDataOrang(orang);
      return orang;
    } catch (err) {
      setDataOrang(null);
      throw err;
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomorUnik) return showMessage("Masukkan nomor unik!", "error");
    if (!dataOrang) return showMessage("Nomor unik tidak valid", "error");

    setSaving(true);
    try {
      const now = new Date();
      const tanggal = now.toISOString().slice(0, 10);
      const jam = now.toISOString();

      let payload = {
        nomor_unik: nomorUnik,
        nama: dataOrang.nama,
        kategori: dataOrang.kategori || "",
        kelas: dataOrang.kelas || "",
        jurusan: dataOrang.jurusan || "",
        jabatan: dataOrang.jabatan || "",
        bagian: dataOrang.bagian || "",
        tanggal,
      };

      if (status === "Masuk") payload.jam_masuk = jam;
      else payload.jam_pulang = jam;

      const todayRes = await axios.get(`${API_BASE}/presensi`, {
        params: { tanggal, nomor_unik: nomorUnik },
      });

      const todayList = Array.isArray(todayRes.data)
        ? todayRes.data
        : todayRes.data?.presensi || [];

      const today = todayList[0];

      if (status === "Masuk") {
        if (today && today.jam_masuk) {
          setSaving(false);

          Swal.fire({
            title: "Sudah Presensi Masuk!",
            text: "Anda sudah melakukan presensi masuk hari ini.",
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Lihat Data",
            cancelButtonText: "Tutup",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "/RekapPresensi";
            }
          });

          return;
        }
      }

      if (status === "Pulang") {
        if (!today || !today.jam_masuk) {
          showMessage("Belum presensi masuk!", "error");
          setSaving(false);
          return;
        }

        if (today.jam_pulang) {
          setSaving(false);

          Swal.fire({
            title: "Sudah Presensi Pulang!",
            text: "Anda sudah melakukan presensi pulang hari ini.",
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Lihat Data",
            cancelButtonText: "Tutup",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "/RekapPresensi";
            }
          });

          return;
        }
      }

      await axios.post(`${API_BASE}/presensi`, payload);

      showMessage(
        `Presensi ${status} tersimpan untuk ${dataOrang.nama}`,
        "success"
      );

      setNomorUnik("");
      setDataOrang(null);
    } catch {
      showMessage("Gagal menyimpan presensi", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/736x/3f/79/05/3f79054d7cc22ce0693c06893fcdfc3c.jpg')",
      }}
    >
      <a
        href="/MasukPresensi"
        className="fixed top-4 left-4 bg-green-600 hover:bg-green-700 text-black px-4 py-3 rounded-xl shadow-lg text-xl flex items-center justify-center border border-green-400"
      >
        <i className="ri-login-box-line text-2xl text-black"></i>
      </a>

      <div className="w-full max-w-5xl">
        <form
          onSubmit={handleSubmit}
          className="p-10 rounded-3xl shadow-[0_0_30px_rgba(0,255,0,0.7)] border-2 border-green-400 bg-cover bg-center bg-opacity-40 backdrop-blur-xl"
          style={{
            backgroundImage:
              "url('https://i.pinimg.com/736x/ff/1a/a1/ff1aa12fab36ab39a9a40e7db166a339.jpg')",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className="flex justify-center">
              <img
                src={
                  dataOrang?.foto ||
                  "https://i.pinimg.com/736x/38/41/97/384197530d32338dd6caafaf1c6a26c4.jpg"
                }
                alt={dataOrang?.nama}
                className="w-72 h-72 rounded-2xl object-cover shadow-[0_0_25px_rgba(0,255,0,0.7)] border-2 border-green-400"
              />
            </div>

            <div className="space-y-7 text-green-300 text-xl font-semibold tracking-wide">
              <div>
                <label className="block font-bold mb-2">Nomor Unik</label>
                <input
                  type="text"
                  value={nomorUnik}
                  onChange={(e) => setNomorUnik(e.target.value.trim())}
                  placeholder="Masukkan Nomor Unik"
                  className="w-full border border-green-400 rounded-xl px-5 py-4 bg-black/60 text-green-300 shadow-[0_0_15px_rgba(0,255,0,0.4)] focus:ring-2 focus:ring-green-500 outline-none text-xl"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Nama</label>
                <input
                  disabled
                  className="w-full border border-green-400 rounded-xl px-5 py-4 bg-black/60 text-green-300 shadow-sm"
                  value={loadingLookup ? "Mencari..." : dataOrang?.nama || "-"}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Status Presensi</label>
                <div className="flex gap-10 mt-2 text-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={status === "Masuk"}
                      onChange={() => setStatus("Masuk")}
                    />
                    Masuk
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={status === "Pulang"}
                      onChange={() => setStatus("Pulang")}
                    />
                    Pulang
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-10">
            <button
              type="submit"
              disabled={saving}
              className={`w-full md:w-80 px-6 py-5 rounded-xl text-black text-2xl font-bold shadow-xl border border-green-400
              ${
                saving
                  ? "bg-gray-500"
                  : "bg-green-500 hover:bg-green-600 active:scale-95"
              }
            `}
            >
              {saving ? "Menyimpan..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Presensi;
