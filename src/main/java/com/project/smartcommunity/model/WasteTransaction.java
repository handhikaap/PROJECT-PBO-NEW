package com.project.smartcommunity.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "waste_transactions")
public class WasteTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // SYARAT DB: Foreign Key jelas (Many To One)
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private WasteCategory category;

    @Column(nullable = false)
    private Double beratKg;

    @Column(nullable = false)
    private Double totalHarga;

    private LocalDateTime tanggalSetor;

    @Column(name = "status")
    private String status;

    private String provinsi;
    private String kabupaten;
    private String kecamatan;
    private String kelurahan;
    private String rt;
    private String rw;

    @PrePersist
    protected void onCreate() {
        tanggalSetor = LocalDateTime.now();
        if (status == null) {
            status = "Pending";
        }
    }

    // Getter Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public WasteCategory getCategory() { return category; }
    public void setCategory(WasteCategory category) { this.category = category; }

    public Double getBeratKg() { return beratKg; }
    public void setBeratKg(Double beratKg) { this.beratKg = beratKg; }

    public Double getTotalHarga() { return totalHarga; }
    public void setTotalHarga(Double totalHarga) { this.totalHarga = totalHarga; }
    
    public LocalDateTime getTanggalSetor() { return tanggalSetor; }
    public void setTanggalSetor(LocalDateTime tanggalSetor) { this.tanggalSetor = tanggalSetor; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

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
}