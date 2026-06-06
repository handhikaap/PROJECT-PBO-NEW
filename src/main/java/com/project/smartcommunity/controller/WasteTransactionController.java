package com.project.smartcommunity.controller;

import com.project.smartcommunity.model.WasteTransaction;
import com.project.smartcommunity.model.WasteCategory;
import com.project.smartcommunity.model.User;
import com.project.smartcommunity.repository.TransactionRepository;
import com.project.smartcommunity.repository.CategoryRepository;
import com.project.smartcommunity.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/transactions")
public class WasteTransactionController {

    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<java.util.List<WasteTransaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionRepository.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<java.util.List<WasteTransaction>> getTransactionsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionRepository.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody Map<String, Object> payload) {
        try {
            // Ambil data dari Frontend React
            Long userId = Long.valueOf(payload.get("userId").toString());
            String jenis = payload.get("jenis").toString();
            Double berat = Double.valueOf(payload.get("berat").toString());
            Double pendapatan = Double.valueOf(payload.get("pendapatan").toString());

            // 1. Cari Warga di Database
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Warga tidak ditemukan"));
            
            // 2. Buat & Simpan Kategori Sampah secara dinamis
            WasteCategory category = new WasteCategory();
            category.setNamaKategori(jenis);
            category.setHargaPerKg(berat > 0 ? (pendapatan / berat) : 0);
            category = categoryRepository.save(category); // Save ke tabel waste_categories

            // 3. Buat & Simpan Transaksi Sampah
            WasteTransaction transaction = new WasteTransaction();
            transaction.setUser(user);
            transaction.setCategory(category);
            transaction.setBeratKg(berat);
            transaction.setTotalHarga(pendapatan);
            transaction.setTanggalSetor(LocalDateTime.now());
            transaction.setStatus("Pending");
            
            // Simpan Data Lokasi
            transaction.setProvinsi(payload.getOrDefault("provinsi", "").toString());
            transaction.setKabupaten(payload.getOrDefault("kabupaten", "").toString());
            transaction.setKecamatan(payload.getOrDefault("kecamatan", "").toString());
            transaction.setKelurahan(payload.getOrDefault("kelurahan", "").toString());
            transaction.setRt(payload.getOrDefault("rt", "").toString());
            transaction.setRw(payload.getOrDefault("rw", "").toString());

            WasteTransaction saved = transactionRepository.save(transaction); // Save ke tabel waste_transactions
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Gagal menyimpan ke database: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatusTransaction(@PathVariable Long id, @RequestParam String status) {
        try {
            WasteTransaction transaction = transactionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Transaksi tidak ditemukan"));
            transaction.setStatus(status);
            transactionRepository.save(transaction);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Gagal update status: " + e.getMessage());
        }
    }
}
