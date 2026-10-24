package com.autolog.backend.controller;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autolog.backend.dto.WorkshopSettingsRequest;
import com.autolog.backend.dto.WorkshopSettingsResponse;
import com.autolog.backend.service.WorkshopSettingsService;

@RestController
@RequestMapping("/api/workshop-settings")
public class WorkshopSettingsController {
    private final WorkshopSettingsService settingsService;

    public WorkshopSettingsController(WorkshopSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public WorkshopSettingsResponse getSettings() {
        return settingsService.getSettings();
    }

    @PutMapping
    public WorkshopSettingsResponse updateSettings(@Valid @RequestBody WorkshopSettingsRequest request) {
        return settingsService.updateSettings(request);
    }
}
