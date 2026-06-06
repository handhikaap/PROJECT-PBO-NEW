package com.project.smartcommunity.controller;

import com.project.smartcommunity.model.Campaign;
import com.project.smartcommunity.model.User;
import com.project.smartcommunity.repository.CampaignRepository;
import com.project.smartcommunity.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/campaigns")
public class CampaignController {

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private UserRepository userRepository;

    // GET: Melihat semua campaign
    @GetMapping
    public ResponseEntity<List<Campaign>> getAllCampaigns() {
        return ResponseEntity.ok(campaignRepository.findAll());
    }

    // POST: Admin membuat campaign baru
    @PostMapping
    public ResponseEntity<?> createCampaign(@RequestBody Map<String, Object> payload) {
        try {
            Campaign campaign = new Campaign();
            campaign.setNamaKegiatan(payload.getOrDefault("namaKegiatan", "").toString());
            
            if (payload.containsKey("tanggalPelaksanaan") && !payload.get("tanggalPelaksanaan").toString().isEmpty()) {
                campaign.setTanggalPelaksanaan(LocalDate.parse(payload.get("tanggalPelaksanaan").toString()));
            }

            Campaign saved = campaignRepository.save(campaign);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Gagal membuat campaign: " + e.getMessage());
        }
    }

    // POST: Warga mendaftar ke campaign
    @PostMapping("/{campaignId}/register")
    public ResponseEntity<?> registerToCampaign(@PathVariable Long campaignId, @RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

            Campaign campaign = campaignRepository.findById(campaignId)
                    .orElseThrow(() -> new RuntimeException("Campaign tidak ditemukan"));

            // Tambahkan relasi
            user.getCampaigns().add(campaign);
            userRepository.save(user); // Karena User adalah pihak yang mendominasi relasi (JoinTable ada di User)

            return ResponseEntity.ok("Berhasil mendaftar ke kegiatan: " + campaign.getNamaKegiatan());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Gagal mendaftar: " + e.getMessage());
        }
    }
}
