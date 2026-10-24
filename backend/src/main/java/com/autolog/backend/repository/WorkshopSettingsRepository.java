package com.autolog.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autolog.backend.model.WorkshopSettings;

public interface WorkshopSettingsRepository extends JpaRepository<WorkshopSettings, Long> {
}
