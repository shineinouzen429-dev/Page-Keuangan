import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const Dashboard = () => {
  const [masterData, setMasterData] = useState([]);
  const [tagihan, setTagihan] = useState([]);
  const [rekapPresensi, setRekapPresensi] = useState([]);

  const [expandedTables, setExpandedTables] = useState({
    guru: false,
    siswa: false,
    karyawan: false,
    tagihan: false,
    presensi: false,
  });

  const tableRefs = {
    guru: useRef(null),
    siswa: useRef(null),
    karyawan: useRef(null),
    tagihan: useRef(null),
    presensi: useRef(null),
  };

  useEffect(() => {
    fetchData();
    fetchRekapPresensi();
  }, []);

  const fetchData = async () => {
    try {
      const [resMaster, resTagihan] = await Promise.all([
        axios.get("http://localhost:5000/masterdata"),
        axios.get("http://localhost:5000/tagihan"),
      ]);

      setMasterData(resMaster.data || []);
      setTagihan(resTagihan.data || []);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  };

  const fetchRekapPresensi = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);

      const res = await axios.get("http://localhost:5000/presensi", {
        params: { tanggal: today },
      });

      const list = Array.isArray(res.data) ? res.data : res.data.presensi || [];

      const merged = {};

      list.forEach((row) => {
        const key = row.nomor_unik;

        if (!merged[key]) {
          merged[key] = {
            nomor_unik: row.nomor_unik,
            nama: row.nama,
            kategori: row.kategori,
            kelas: row.kelas,
            jurusan: row.jurusan,
            jabatan: row.jabatan,
            bagian: row.bagian,
            tanggal: row.tanggal,
            jam_masuk: row.jam_masuk || null,
            jam_pulang: row.jam_pulang || null,
          };
        } else {
          if (row.jam_masuk) merged[key].jam_masuk = row.jam_masuk;
          if (row.jam_pulang) merged[key].jam_pulang = row.jam_pulang;
        }
      });

      const finalList = Object.values(merged);

      setRekapPresensi(finalList);
    } catch (err) {
      console.error("Gagal memuat presensi:", err);
    }
  };

  const formatRupiah = (angka) =>
    Number(angka).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

  const totalGuru = masterData.filter((d) => d.kategori === "guru").length;
  const totalSiswa = masterData.filter((d) => d.kategori === "siswa").length;
  const totalKaryawan = masterData.filter(
    (d) => d.kategori === "karyawan"
  ).length;
  const totalDatabase = totalGuru + totalSiswa + totalKaryawan;

  const totalLunas = tagihan.filter((t) => t.status === "Lunas").length;
  const totalBelumLunas = tagihan.filter(
    (t) => t.status === "Belum lunas"
  ).length;
  const totalDataTagihan = tagihan.length;
  const totalNominalLunas = tagihan
    .filter((t) => t.status === "Lunas")
    .reduce((sum, t) => sum + (parseInt(t.jumlah) || 0), 0);

  const Table = ({ id, title, columns, data, renderRow }) => {
    const isExpanded = expandedTables[id];
    const displayData = isExpanded ? data : data.slice(0, 5);

    const handleToggleExpand = () => {
      const currentScroll = window.scrollY;
      const tableElement = tableRefs[id].current;

      requestAnimationFrame(() => {
        setExpandedTables((prev) => ({
          ...prev,
          [id]: !prev[id],
        }));

        requestAnimationFrame(() => {
          window.scrollTo({
            top: currentScroll,
            behavior: "instant",
          });

          tableElement?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    };

    return (
      <div ref={tableRefs[id]} className="mt-10 scroll-mt-20">
        <h2 className="text-xl font-bold mb-3 text-gray-700 border-l-4 border-blue-600 pl-2">
          {title}
        </h2>

        <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="bg-blue-100">
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={`py-2 px-3 font-semibold border-b text-gray-700 ${
                      col === "Status"
                        ? "text-center"
                        : col === "Nominal"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.length > 0 ? (
                displayData.map(renderRow)
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-2 text-gray-500 italic"
                  >
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data.length > 5 && (
          <div className="flex justify-center mt-3">
            <button
              onClick={handleToggleExpand}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold shadow transition"
            >
              {isExpanded ? "Tampilkan Lebih Sedikit" : "Lihat Selengkapnya"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-wide text-gray-800 flex items-center justify-center gap-3">
          <span className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-300/40">
            <i className="ri-dashboard-fill text-3xl"></i>
          </span>
          <span>Smart Monitoring Panel</span>
        </h1>

        <p className="text-gray-500 mt-3 text-lg tracking-wide">
          Menampilkan Data Akademik, Keuangan & Presensi — real-time dan
          informatif
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card
          color="bg-blue-600"
          icon="ri-user-star-fill"
          title="Total Guru"
          value={totalGuru}
        />
        <Card
          color="bg-green-600"
          icon="ri-team-fill"
          title="Total Siswa"
          value={totalSiswa}
        />
        <Card
          color="bg-yellow-500"
          icon="ri-user-2-fill"
          title="Total Karyawan"
          value={totalKaryawan}
        />
        <Card
          color="bg-purple-600"
          icon="ri-server-fill"
          title="Total Database"
          value={totalDatabase}
        />
        <Card
          color="bg-emerald-600"
          icon="ri-check-double-line"
          title="Tagihan Lunas"
          value={totalLunas}
        />
        <Card
          color="bg-red-600"
          icon="ri-error-warning-fill"
          title="Belum Lunas"
          value={totalBelumLunas}
        />
        <Card
          color="bg-cyan-600"
          icon="ri-file-list-3-line"
          title="Total Data Tagihan"
          value={totalDataTagihan}
        />
        <Card
          color="bg-blue-700"
          icon="ri-money-dollar-circle-line"
          title="Total Nominal Lunas"
          value={formatRupiah(totalNominalLunas)}
        />
      </div>

      <Table
        id="guru"
        title="Data Guru"
        columns={["No", "Nama", "Mapel"]}
        data={masterData.filter((d) => d.kategori === "guru")}
        renderRow={(guru, i) => (
          <tr key={i} className="odd:bg-white even:bg-gray-50">
            <td className="px-4 text-center">{i + 1}</td>
            <td className="py-2 px-4">{guru.nama}</td>
            <td className="py-2 px-4">{guru.jabatan || "-"}</td>
          </tr>
        )}
      />

      <Table
        id="siswa"
        title="Data Siswa"
        columns={["No", "Nama", "Kelas", "Jurusan"]}
        data={masterData.filter((d) => d.kategori === "siswa")}
        renderRow={(siswa, i) => (
          <tr key={i} className="odd:bg-white even:bg-gray-50 transition">
            <td className="py-2 px-3 text-center">{i + 1}</td>
            <td className="py-2 px-3">{siswa.nama}</td>
            <td className="py-2 px-3">{siswa.kelas || "-"}</td>
            <td className="py-2 px-3">{siswa.jurusan || "-"}</td>
          </tr>
        )}
      />

      <Table
        id="karyawan"
        title="Data Karyawan"
        columns={["No", "Nama", "Bagian"]}
        data={masterData.filter((d) => d.kategori === "karyawan")}
        renderRow={(kar, i) => (
          <tr key={i} className="odd:bg-white even:bg-gray-50 transition">
            <td className="py-2 px-3 text-center">{i + 1}</td>
            <td className="py-2 px-3">{kar.nama}</td>
            <td className="py-2 px-3">{kar.bagian || "-"}</td>
          </tr>
        )}
      />

      <Table
        id="tagihan"
        title="Data Pembayaran / Tagihan"
        columns={["No", "Nama", "Jenis Tagihan", "Nominal", "Status"]}
        data={tagihan}
        renderRow={(t, i) => (
          <tr key={i} className="odd:bg-white even:bg-gray-50 transition">
            <td className="py-2 px-3 text-center">{i + 1}</td>
            <td className="py-2 px-3">{t.name}</td>
            <td className="py-2 px-3">{t.jenis_tagihan}</td>
            <td className="py-2 px-3 text-right">{formatRupiah(t.jumlah)}</td>
            <td
              className={`py-2 px-3 text-center font-semibold ${
                t.status === "Lunas" ? "text-green-600" : "text-red-600"
              }`}
            >
              {t.status}
            </td>
          </tr>
        )}
      />

      <Table
        id="presensi"
        title="Rekap Presensi Hari Ini"
        columns={[
          "No",
          "Nomor Unik",
          "Nama",
          "Kategori",
          "Jam Masuk",
          "Jam Pulang",
        ]}
        data={rekapPresensi}
        renderRow={(p, i) => (
          <tr key={i} className="odd:bg-white even:bg-gray-50 transition">
            <td className="py-2 px-3 text-center">{i + 1}</td>
            <td className="py-2 px-3">{p.nomor_unik}</td>
            <td className="py-2 px-3">{p.nama}</td>
            <td className="py-2 px-3 capitalize">{p.kategori}</td>
            <td className="py-2 px-3">
              {p.jam_masuk
                ? new Date(p.jam_masuk).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </td>
            <td className="py-2 px-3">
              {p.jam_pulang
                ? new Date(p.jam_pulang).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </td>
          </tr>
        )}
      />
    </div>
  );
};

const Card = ({ color, icon, title, value }) => (
  <div
    className={`${color} text-white rounded-xl shadow-lg p-6 relative overflow-hidden`}
  >
    <i
      className={`${icon} absolute right-3 bottom-3 text-[75px] opacity-25`}
    ></i>
    <p className="text-sm font-semibold relative z-10">{title}</p>
    <h2 className="text-3xl font-bold mt-1 relative z-10">{value}</h2>
  </div>
);

export default Dashboard;
