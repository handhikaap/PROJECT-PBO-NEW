package com.project.smartcommunity.controller;

import com.project.smartcommunity.model.Aduan;
import com.project.smartcommunity.model.User;
import com.project.smartcommunity.repository.AduanRepository;
import com.project.smartcommunity.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/pengaduan")
public class AduanController {

    @Autowired
    private AduanRepository aduanRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Aduan>> getAllAduan() {
        return ResponseEntity.ok(aduanRepository.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Aduan>> getAduanByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(aduanRepository.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> createAduan(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Warga tidak ditemukan"));

            Aduan aduan = new Aduan();
            aduan.setUser(user);
            aduan.setProvinsi(payload.getOrDefault("provinsi", "").toString());
            aduan.setKabupaten(payload.getOrDefault("kabupaten", "").toString());
            aduan.setKecamatan(payload.getOrDefault("kecamatan", "").toString());
            aduan.setKelurahan(payload.getOrDefault("kelurahan", "").toString());
            aduan.setRt(payload.getOrDefault("rt", "").toString());
            aduan.setRw(payload.getOrDefault("rw", "").toString());
            aduan.setPerihal(payload.getOrDefault("perihal", "").toString());
            
            Aduan saved = aduanRepository.save(aduan);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Gagal menyimpan pengaduan: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatusAduan(@PathVariable Long id, @RequestParam String status) {
        try {
            Aduan aduan = aduanRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Aduan tidak ditemukan"));
            aduan.setStatus(status);
            aduanRepository.save(aduan);
            return ResponseEntity.ok(aduan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Gagal update status: " + e.getMessage());
        }
    }
}
