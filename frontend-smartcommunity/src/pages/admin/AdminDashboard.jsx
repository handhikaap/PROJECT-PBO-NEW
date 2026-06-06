import React, { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dataSetoran, setDataSetoran] = useState([]);
  const [dataAduan, setDataAduan] = useState([]);
  const [jadwalArmada, setJadwalArmada] = useState([]);
  const [dataCampaign, setDataCampaign] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  // Form Jadwal Baru & Campaign Baru
  const [newJadwal, setNewJadwal] = useState({ hari: "", jam: "", lokasi: "" });
  const [newCampaign, setNewCampaign] = useState({ namaKegiatan: "", tanggalPelaksanaan: "" });

  // Sync Data dari LocalStorage (Source of Truth)
  useEffect(() => {
    const syncData = async () => {
      // SINKRONISASI 100% MYSQL
      try {
        const resSetoran = await fetch("http://localhost:8080/api/transactions");
        if (resSetoran.ok) {
            const data = await resSetoran.json();
            // Map the field names from backend WasteTransaction to match existing Frontend logic
            const mappedSetoran = data.map(t => ({
                ...t,
                berat: t.beratKg,
                pendapatan: t.totalHarga,
                jenis: t.category ? t.category.namaKategori : "Unknown",
                namaWarga: t.user ? t.user.name : "Warga"
            }));
            setDataSetoran(mappedSetoran);
        }

        const resAduan = await fetch("http://localhost:8080/api/pengaduan");
        if (resAduan.ok) {
            setDataAduan(await resAduan.json());
        }
      } catch (err) {
        console.error("Gagal sinkronisasi dengan backend:", err);
      }

      setJadwalArmada(JSON.parse(localStorage.getItem("jadwalArmada") || "[]"));
    };
    
    // Fetch Data Campaign dari MySQL
    const fetchCampaigns = async () => {
      try {
          const res = await fetch("http://localhost:8080/api/campaigns");
          if (res.ok) {
              const data = await res.json();
              setDataCampaign(data);
          }
      } catch (err) {
          console.error("Gagal mengambil data campaign dari MySQL:", err);
      }
    };

    syncData();
    fetchCampaigns();
    const interval = setInterval(syncData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Aksi Validasi Setoran
  const verifikasiSetoran = async (id, status) => {
    // 💡 SINKRONISASI DATABASE: Kirim perintah update status ke Java MySQL
    try {
        const response = await fetch(`http://localhost:8080/api/transactions/${id}/status?status=${status}`, {
            method: 'PUT'
        });

        if (!response.ok) {
            console.warn("Gagal update ke MySQL. (Mungkin data ini adalah data dummy lokal yang ID-nya tidak ada di database)");
        }
    } catch (err) {
        console.error("Terjadi kesalahan koneksi ke backend Java:", err);
    }

    // Tetap update tampilan UI Admin seketika (Optimistic Update)
    const updated = dataSetoran.map((s) =>
      s.id === id ? { ...s, status } : s,
    );
    setDataSetoran(updated);
    localStorage.setItem("riwayatSetoran", JSON.stringify(updated));
  };

  // Aksi Validasi Aduan
  const handleAduanStatus = async (id, status) => {
    try {
        await fetch(`http://localhost:8080/api/pengaduan/${id}/status?status=${status}`, {
            method: 'PUT'
        });
    } catch (err) {
        console.error("Terjadi kesalahan koneksi ke backend Java:", err);
    }
    const updated = dataAduan.map((a) => (a.id === id ? { ...a, status } : a));
    setDataAduan(updated);
    localStorage.setItem("riwayatAduan", JSON.stringify(updated));
  };

  // Tambah Jadwal Armada
  const tambahJadwal = (e) => {
    e.preventDefault();
    const updated = [...jadwalArmada, { id: Date.now(), ...newJadwal }];
    setJadwalArmada(updated);
    localStorage.setItem("jadwalArmada", JSON.stringify(updated));
    setNewJadwal({ hari: "", jam: "", lokasi: "" });
  };

  // Tambah Campaign ke MySQL
  const handleTambahCampaign = async (e) => {
      e.preventDefault();
      try {
          const response = await fetch("http://localhost:8080/api/campaigns", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newCampaign)
          });
          if (response.ok) {
              const saved = await response.json();
              setDataCampaign([...dataCampaign, saved]);
              setNewCampaign({ namaKegiatan: "", tanggalPelaksanaan: "" });
              alert("Campaign berhasil ditambahkan ke Database!");
          } else {
              alert("Gagal menambahkan Campaign");
          }
      } catch (err) {
          console.error(err);
          alert("Terjadi kesalahan koneksi ke server Java.");
      }
  };

  const theme = {
    bg: darkMode ? "#020617" : "#f8fafc",
    card: darkMode ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.8)",
    text: darkMode ? "#f8fafc" : "#0f172a",
    accent: "#10b981",
    border: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
  };

  const navItem = {
    padding: "16px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "0.3s",
    border: "none",
    width: "100%",
    fontSize: "15px",
    fontWeight: "600",
  };

  // PERBAIKAN: Filter aduan yang masuk di badge agar hanya menghitung aduan yang belum diproses (Pending)
  const aduanPending = dataAduan.filter(
    (a) => !a.status || a.status === "Pending",
  );

  return (
    <div
      style={{
        backgroundColor: theme.bg,
        minHeight: "100vh",
        color: theme.text,
        display: "flex",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "280px",
          margin: "20px",
          borderRadius: "24px",
          background: theme.card,
          backdropFilter: "blur(20px)",
          border: `1px solid ${theme.border}`,
          padding: "30px",
        }}
      >
        <h2
          style={{
            color: theme.accent,
            marginBottom: "40px",
            fontWeight: "800",
          }}
        >
          SYS<span style={{ color: theme.text }}>ADMIN</span>
        </h2>
        {[
          { id: "overview", label: "Overview", icon: "📊" },
          { id: "verifikasi", label: "Validasi Sampah", icon: "✅" },
          {
            id: "aduan",
            label: "Inbox Aduan",
            icon: "📢",
            badge: aduanPending.length,
          }, // Menggunakan panjang aduanPending
          { id: "jadwal", label: "Jadwal Armada", icon: "🗓️" },
          { id: "wilayah", label: "Data Nasional", icon: "🌐" },
          { id: "campaign", label: "Kelola Campaign", icon: "🎯" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...navItem,
              background: activeTab === tab.id ? theme.accent : "transparent",
              color: activeTab === tab.id ? "#fff" : theme.text,
            }}
          >
            {tab.icon} {tab.label}
            {tab.badge > 0 && (
              <span
                style={{
                  background: "#ef4444",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "12px",
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            ...navItem,
            marginTop: "auto",
            background: "rgba(16, 185, 129, 0.1)",
            color: theme.accent,
          }}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          style={{
            ...navItem,
            marginTop: "15px",
            background: "rgba(244, 63, 94, 0.1)",
            color: "#f43f5e",
          }}
        >
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "40px" }}>
          {activeTab.replace("_", " ").toUpperCase()}
        </h1>

        {activeTab === "overview" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "24px",
            }}
          >
            <div
              style={{
                padding: "30px",
                background: theme.card,
                borderRadius: "24px",
                border: `1px solid ${theme.border}`,
              }}
            >
              <p style={{ color: "#94a3b8" }}>Total Transaksi</p>
              <h2 style={{ fontSize: "32px" }}>{dataSetoran.length}</h2>
            </div>
            <div
              style={{
                padding: "30px",
                background: theme.card,
                borderRadius: "24px",
                border: `1px solid ${theme.border}`,
              }}
            >
              <p style={{ color: "#94a3b8" }}>Total Sampah</p>
              <h2 style={{ fontSize: "32px", color: theme.accent }}>
                {dataSetoran.reduce((a, b) => a + (b.berat || 0), 0).toFixed(1)}{" "}
                Kg
              </h2>
            </div>
          </div>
        )}

        {activeTab === "verifikasi" && (
          <div
            style={{
              padding: "30px",
              background: theme.card,
              borderRadius: "24px",
              border: `1px solid ${theme.border}`,
            }}
          >
            <h3>Validasi Setoran Warga</h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px",
              }}
            >
              <thead>
                <tr
                  style={{
                    color: "#94a3b8",
                    borderBottom: "1px solid #334155",
                  }}
                >
                  <th style={{ padding: "16px", textAlign: "left" }}>Warga</th>
                  <th>Berat</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dataSetoran.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #334155" }}>
                    <td style={{ padding: "16px" }}>
                      <strong>{s.namaWarga}</strong><br/>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>{s.kelurahan} (RT{s.rt}/RW{s.rw})</span>
                    </td>
                    <td style={{ padding: "16px" }}>{s.berat} Kg</td>
                    <td
                      style={{
                        padding: "16px",
                        color:
                          s.status === "Terverifikasi"
                            ? theme.accent
                            : "#f59e0b",
                      }}
                    >
                      {s.status || "Pending"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <button
                        onClick={() => verifikasiSetoran(s.id, "Terverifikasi")}
                        style={{
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "5px",
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => verifikasiSetoran(s.id, "Ditolak")}
                        style={{
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "aduan" && (
          <div style={{ display: "grid", gap: "20px" }}>
            {/* PERBAIKAN: Menggunakan aduanPending agar aduan yang sudah di-approve/reject langsung hilang dari list */}
            {aduanPending.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>Tidak ada aduan pending.</p>
            ) : (
              aduanPending.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: "24px",
                    background: theme.card,
                    borderRadius: "20px",
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <h4>
                    Aduan: {a.kelurahan} (RT{a.rt}/RW{a.rw}) -{" "}
                    <span style={{ color: "#f59e0b" }}>
                      Status: {a.status || "Pending"}
                    </span>
                  </h4>
                  <p style={{ color: "#94a3b8", margin: "10px 0" }}>
                    {a.perihal}
                  </p>
                  <button
                    onClick={() => handleAduanStatus(a.id, "Diterima")}
                    style={{
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      marginRight: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Terima
                  </button>
                  <button
                    onClick={() => handleAduanStatus(a.id, "Ditolak")}
                    style={{
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Tolak
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "jadwal" && (
          <div
            style={{
              padding: "30px",
              background: theme.card,
              borderRadius: "24px",
              border: `1px solid ${theme.border}`,
            }}
          >
            <h3>Tambah Jadwal Armada</h3>
            <form
              onSubmit={tambahJadwal}
              style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
            >
              <input
                placeholder="Hari"
                required
                value={newJadwal.hari}
                onChange={(e) =>
                  setNewJadwal({ ...newJadwal, hari: e.target.value })
                }
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.border}`,
                  background: darkMode ? "#0f172a" : "#fff",
                  color: theme.text,
                }}
              />
              <input
                placeholder="Jam"
                required
                value={newJadwal.jam}
                onChange={(e) =>
                  setNewJadwal({ ...newJadwal, jam: e.target.value })
                }
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.border}`,
                  background: darkMode ? "#0f172a" : "#fff",
                  color: theme.text,
                }}
              />
              <input
                placeholder="Lokasi (RW)"
                required
                value={newJadwal.lokasi}
                onChange={(e) =>
                  setNewJadwal({ ...newJadwal, lokasi: e.target.value })
                }
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.border}`,
                  background: darkMode ? "#0f172a" : "#fff",
                  color: theme.text,
                }}
              />
              <button
                type="submit"
                style={{
                  background: theme.accent,
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Tambah
              </button>
            </form>
            {jadwalArmada.map((j) => (
              <div
                key={j.id}
                style={{
                  padding: "15px",
                  border: "1px solid #475569",
                  marginTop: "10px",
                  borderRadius: "8px",
                }}
              >
                {j.hari} | {j.jam} | {j.lokasi}
              </div>
            ))}
          </div>
        )}

        {activeTab === "wilayah" && (
          <div
            style={{
              padding: "30px",
              background: theme.card,
              borderRadius: "24px",
              border: `1px solid ${theme.border}`,
            }}
          >
            <h3>Data Seluruh Warga Indonesia</h3>
            <table style={{ width: "100%", marginTop: "20px" }}>
              <thead>
                <tr
                  style={{
                    color: "#94a3b8",
                    borderBottom: "2px solid #334155",
                  }}
                >
                  <th>Provinsi</th>
                  <th>Kab/Kota</th>
                  <th>Kecamatan</th>
                  <th>Kelurahan</th>
                  <th>RT/RW</th>
                </tr>
              </thead>
              <tbody>
                {dataSetoran.map((s, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #334155" }}>
                    <td style={{ padding: "12px" }}>{s.provinsi}</td>
                    <td>{s.kabupaten}</td>
                    <td>{s.kecamatan}</td>
                    <td>{s.kelurahan}</td>
                    <td>
                      {s.rt}/{s.rw}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "campaign" && (
          <div
            style={{
              padding: "30px",
              background: theme.card,
              borderRadius: "24px",
              border: `1px solid ${theme.border}`,
            }}
          >
            <h3>Buat Kegiatan / Campaign Warga Baru</h3>
            <form
              onSubmit={handleTambahCampaign}
              style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
            >
              <input
                placeholder="Nama Kegiatan (Cth: Kerja Bakti Massal)"
                required
                value={newCampaign.namaKegiatan}
                onChange={(e) =>
                  setNewCampaign({ ...newCampaign, namaKegiatan: e.target.value })
                }
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.border}`,
                  background: darkMode ? "#0f172a" : "#fff",
                  color: theme.text,
                }}
              />
              <input
                type="date"
                required
                value={newCampaign.tanggalPelaksanaan}
                onChange={(e) =>
                  setNewCampaign({ ...newCampaign, tanggalPelaksanaan: e.target.value })
                }
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.border}`,
                  background: darkMode ? "#0f172a" : "#fff",
                  color: theme.text,
                }}
              />
              <button
                type="submit"
                style={{
                  background: theme.accent,
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Buat Campaign
              </button>
            </form>
            
            <div style={{ marginTop: "30px" }}>
              <h4>Daftar Campaign Tersedia:</h4>
              <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
                {dataCampaign.length === 0 ? (
                  <p style={{ color: "#94a3b8" }}>Belum ada campaign di MySQL.</p>
                ) : (
                  dataCampaign.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: "20px",
                        background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                        border: `1px solid ${theme.border}`,
                        borderRadius: "12px",
                      }}
                    >
                      <h4 style={{ margin: "0 0 10px 0", color: theme.accent }}>{c.namaKegiatan}</h4>
                      <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
                        🗓️ Pelaksanaan: {c.tanggalPelaksanaan || "Belum ditentukan"}
                      </p>
                      <p style={{ margin: "10px 0 0 0", fontSize: "13px" }}>
                        👥 Jumlah Pendaftar: {c.users ? c.users.length : 0} Warga
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
