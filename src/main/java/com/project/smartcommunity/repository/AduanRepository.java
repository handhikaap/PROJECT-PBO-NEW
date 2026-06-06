package com.project.smartcommunity.repository;

import com.project.smartcommunity.model.Aduan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AduanRepository extends JpaRepository<Aduan, Long> {
    List<Aduan> findByUserId(Long userId);
}
