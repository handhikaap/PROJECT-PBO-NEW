package com.project.smartcommunity.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pengaduan")
public class Aduan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String provinsi;
    private String kabupaten;
    private String kecamatan;
    private String kelurahan;
    private String rt;
    private String rw;

    @Column(length = 1000)
    private String perihal;

    private String status; // Pending, Diproses, Selesai

    private LocalDateTime tanggalAduan;

    @PrePersist
    protected void onCreate() {
        tanggalAduan = LocalDateTime.now();
        if (status == null) {
            status = "Pending";
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getProvinsi() { return provinsi; }
    public void setProvinsi(String provinsi) { this.provinsi = provinsi; }

    public String getKabupaten() { return kabupaten; }
    public void setKabupaten(String kabupaten) { this.kabupaten = kabupaten; }

    public String getKecamatan() { return kecamatan; }
    public void setKecamatan(String kecamatan) { this.kecamatan = kecamatan; }

    public String getKelurahan() { return kelurahan; }
    public void setKelurahan(String kelurahan) { this.kelurahan = kelurahan; }

    public String getRt() { return rt; }
    public void setRt(String rt) { this.rt = rt; }

    public String getRw() { return rw; }
    public void setRw(String rw) { this.rw = rw; }

    public String getPerihal() { return perihal; }
    public void setPerihal(String perihal) { this.perihal = perihal; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTanggalAduan() { return tanggalAduan; }
    public void setTanggalAduan(LocalDateTime tanggalAduan) { this.tanggalAduan = tanggalAduan; }
}
