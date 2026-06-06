package com.project.smartcommunity.controller;

import com.project.smartcommunity.model.User;
import com.project.smartcommunity.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping({"/api/users", "/api/warga"})
@SuppressWarnings("null") // <-- Tambahkan ini untuk membungkam warning null safety
public class UserController {
    // isi method tetap sama seperti sebelumnya...


    @Autowired
    private UserRepository userRepository;

    // USER & ADMIN: Melihat semua data warga
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // USER & ADMIN: Melihat data warga berdasarkan ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Autowired
    private com.project.smartcommunity.repository.RoleRepository roleRepository;

    // USER: Menambah data warga baru (Create)
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            // Validasi agar tidak mendaftar dengan email yang sama dua kali
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email sudah terdaftar di sistem!");
            }

            // Hindari error JPA Detached Entity pada roles dan cegah Duplicate Key
            java.util.Set<com.project.smartcommunity.model.Role> managedRoles = new java.util.HashSet<>();
            for (com.project.smartcommunity.model.Role role : user.getRoles()) {
                com.project.smartcommunity.model.Role existingRole = null;
                
                // Cari berdasarkan Nama (misal "ROLE_USER") alih-alih ID yang bisa tidak cocok di database lokal
                if (role.getName() != null && !role.getName().isEmpty()) {
                    existingRole = roleRepository.findByName(role.getName()).orElse(null);
                }
                
                // Jika tidak ketemu berdasarkan nama, buat baru
                if (existingRole == null) {
                    existingRole = roleRepository.save(role);
                }
                managedRoles.add(existingRole);
            }
            user.setRoles(managedRoles);

            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Gagal menyimpan user: " + e.getMessage());
        }
    }

    // USER: Mengubah data warga (Update)
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        if (userRepository.existsById(id)) {
            user.setId(id);
            return ResponseEntity.ok(userRepository.save(user));
        }
        return ResponseEntity.notFound().build();
    }

    // USER: Menghapus data warga (Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok("Data warga berhasil dihapus");
        }
        return ResponseEntity.notFound().build();
    }
}