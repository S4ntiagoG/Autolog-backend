package com.autolog.backend.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autolog.backend.dto.WorkshopSettingsRequest;
import com.autolog.backend.dto.WorkshopSettingsResponse;
import com.autolog.backend.model.WorkshopSettings;
import com.autolog.backend.repository.WorkshopSettingsRepository;

@Service
public class WorkshopSettingsService {
    private static final long SETTINGS_ID = 1L;

    private final WorkshopSettingsRepository settingsRepository;

    public WorkshopSettingsService(WorkshopSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    @Transactional
    public WorkshopSettingsResponse getSettings() {
        return toResponse(findOrCreateSettings());
    }

    @Transactional
    public WorkshopSettingsResponse updateSettings(WorkshopSettingsRequest request) {
        WorkshopSettings settings = findOrCreateSettings();
        settings.setHourlyRateCop(request.hourlyRateCop());
        settings.setVatPercentage(request.vatPercentage());
        settings.setCurrency(request.currency());
        settings.setInvoiceNote(request.invoiceNote());
        return toResponse(settingsRepository.save(settings));
    }

    private WorkshopSettings findOrCreateSettings() {
        return settingsRepository.findById(SETTINGS_ID).orElseGet(() -> {
            WorkshopSettings defaults = new WorkshopSettings();
            defaults.setId(SETTINGS_ID);
            defaults.setHourlyRateCop(new BigDecimal("45000.00"));
            defaults.setVatPercentage(new BigDecimal("19.00"));
            defaults.setCurrency("COP");
            defaults.setInvoiceNote("Gracias por su preferencia — Garantía 30 días");
            return settingsRepository.save(defaults);
        });
    }

    private WorkshopSettingsResponse toResponse(WorkshopSettings settings) {
        return new WorkshopSettingsResponse(
                settings.getHourlyRateCop(),
                settings.getVatPercentage(),
                settings.getCurrency(),
                settings.getInvoiceNote());
    }
}
