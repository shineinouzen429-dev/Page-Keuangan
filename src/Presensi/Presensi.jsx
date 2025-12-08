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

  const getDetailInfo = (item) => {
    if (!item) return { label: "Detail", value: "-" };
    const k = item.kategori?.toLowerCase();
    if (k === "guru")
      return { label: "Mapel", value: item.jabatan || item.mapel || "-" };
    if (k === "siswa")
      return {
        label: "Kelas",
        value: `${item.kelas || "-"} - ${item.jurusan || "-"}`,
      };
    if (k === "karyawan") return { label: "Bagian", value: item.bagian || "-" };
    return { label: "Detail", value: "-" };
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
    <div className="p-6 max-w-3xl mx-auto">
      <a
        href="/MasukPresensi"
        className="fixed top-4 left-4 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl shadow-md text-xl flex items-center justify-center"
      >
        <i className="ri-login-box-line"></i>
      </a>

      <div className="flex items-center gap-4 mb-8 justify-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md">
          <i className="ri-id-card-fill text-white text-3xl"></i>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Presensi Sekolah
          </h2>
          <p className="text-gray-600 text-sm -mt-1">
            Input presensi harian siswa, guru, dan karyawan
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-lg border"
      >
        <h3 className="text-xl font-semibold mb-5 text-gray-700">
          Input Presensi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nomor Unik</label>
            <input
              type="text"
              value={nomorUnik}
              onChange={(e) => setNomorUnik(e.target.value.trim())}
              placeholder="Masukkan Nomor Unik"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              value={loadingLookup ? "Mencari..." : dataOrang?.nama || "-"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <input
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              value={dataOrang?.kategori || "-"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {getDetailInfo(dataOrang).label}
            </label>
            <input
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              value={getDetailInfo(dataOrang).value}
            />
          </div>
        </div>

        <div className="mt-5 mb-4">
          <label className="block text-sm font-medium mb-2">
            Status Presensi
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={status === "Masuk"}
                onChange={() => setStatus("Masuk")}
              />
              Masuk
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={status === "Pulang"}
                onChange={() => setStatus("Pulang")}
              />
              Pulang
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full md:w-auto px-5 py-2 rounded-xl text-white shadow-md transition ${
            saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {saving ? "Menyimpan..." : "Simpan Presensi"}
        </button>
      </form>
    </div>
  );
};

export default Presensi;
