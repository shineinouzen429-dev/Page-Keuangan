import React, { useEffect, useState } from "react";
import axios from "axios";

function RekapTagihan() {
  const [tagihan, setTagihan] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/tagihan");
        setTagihan(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const filteredTagihan = tagihan.filter((t) => {
    const matchName = t.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "semua" ||
      t.status.toLowerCase() === statusFilter.toLowerCase();
    return matchName && matchStatus;
  });

  const formatRupiah = (angka) =>
    angka
      ? "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      : "Rp 0";

  const lunasData = filteredTagihan.filter(
    (t) => t.status.toLowerCase() === "lunas"
  );
  const totalJumlahLunas = lunasData.reduce(
    (sum, item) => sum + Number(item.jumlah),
    0
  );
  const belumLunas = filteredTagihan.length - lunasData.length;

  return (
    <div className="p-6 ml-3">
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[220px] relative overflow-hidden bg-gradient-to-l from-green-600 to-green-500 text-white rounded-lg shadow-lg p-4 text-center">
          <i className="ri-check-double-line text-green-200 absolute right-2 bottom-2 text-[70px] opacity-40"></i>
          <p className="text-sm font-semibold relative z-10">Data Lunas</p>
          <h2 className="text-2xl font-bold mt-1 relative z-10">
            {lunasData.length}
          </h2>
        </div>

        <div className="flex-1 min-w-[220px] relative overflow-hidden bg-gradient-to-l from-orange-600 to-orange-500 text-white rounded-lg shadow-lg p-4 text-center">
          <i className="ri-error-warning-line text-orange-200 absolute right-2 bottom-2 text-[70px] opacity-40"></i>
          <p className="text-sm font-semibold relative z-10">
            Data Belum Lunas
          </p>
          <h2 className="text-2xl font-bold mt-1 relative z-10">
            {belumLunas}
          </h2>
        </div>

        <div className="flex-1 min-w-[220px] relative overflow-hidden bg-gradient-to-l from-blue-700 to-blue-500 text-white rounded-lg shadow-lg p-4 text-center">
          <i className="ri-money-dollar-circle-line text-blue-200 absolute right-2 bottom-2 text-[70px] opacity-40"></i>
          <p className="text-sm font-semibold relative z-10">
            Total Nominal Lunas
          </p>
          <h2 className="text-2xl font-bold mt-1 relative z-10">
            {formatRupiah(totalJumlahLunas)}
          </h2>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">Rekap Tagihan</h1>
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
        <input
          type="text"
          placeholder="Cari nama siswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-blue-200 bg-white rounded-md px-3 py-2 text-sm"
        >
          <option value="semua">Semua Status</option>
          <option value="lunas">Lunas</option>
          <option value="belum lunas">Belum Lunas</option>
        </select>
      </div>
      <div className="overflow-x-auto bg-white shadow-md rounded-2xl">
        <table className="table-auto w-full border-gray-300">
          <thead className="bg-gradient-to-l from-blue-800 to-blue-600 text-white">
            <tr>
              <th className="px-3 py-2">No</th>
              <th className="px-3 py-2 text-left">Nama</th>
              <th className="px-3 py-2 text-right">Jumlah</th>
              <th className="px-3 py-2 text-center">Status</th>
              <th className="px-3 py-2 text-center">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {filteredTagihan.length > 0 ? (
              filteredTagihan.map((t, i) => (
                <tr key={t.id} className="border-b">
                  <td className="text-center px-3 py-2">{i + 1}</td>
                  <td className="text-left px-3 py-2">{t.nama}</td>
                  <td className="text-right px-3 py-2">
                    {formatRupiah(t.jumlah)}
                  </td>
                  <td
                    className={`text-center px-3 py-2 font-semibold ${
                      t.status.toLowerCase() === "lunas"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {t.status}
                  </td>
                  <td className="text-center px-3 py-2">
                    {new Date(t.created_at).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="font-bold border-t border-gray-400 bg-gray-100">
              <td colSpan="2" className="text-left px-3 py-2">
                Total Lunas
              </td>
              <td className="text-right px-3 py-2">
                {formatRupiah(totalJumlahLunas)}
              </td>
              <td className="text-center px-3 py-2">{lunasData.length}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default RekapTagihan;
