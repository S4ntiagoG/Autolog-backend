package com.autolog.backend.service;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.autolog.backend.dto.WorkshopSettingsRequest;
import com.autolog.backend.model.WorkshopSettings;
import com.autolog.backend.repository.WorkshopSettingsRepository;

@ExtendWith(MockitoExtension.class)
class WorkshopSettingsServiceTest {
    @Mock
    private WorkshopSettingsRepository settingsRepository;

    @InjectMocks
    private WorkshopSettingsService settingsService;

    @Test
    void createsAndReturnsDefaultSettingsWhenNoneExist() {
        when(settingsRepository.findById(1L)).thenReturn(Optional.empty());
        when(settingsRepository.save(org.mockito.ArgumentMatchers.any(WorkshopSettings.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var result = settingsService.getSettings();

        assertEquals(new BigDecimal("45000.00"), result.hourlyRateCop());
        assertEquals(new BigDecimal("19.00"), result.vatPercentage());
        assertEquals("COP", result.currency());
        assertEquals("Gracias por su preferencia — Garantía 30 días", result.invoiceNote());
        verify(settingsRepository).save(org.mockito.ArgumentMatchers.any(WorkshopSettings.class));
    }

    @Test
    void updatesAndReturnsThePersistedSettings() {
        WorkshopSettings existing = new WorkshopSettings();
        existing.setId(1L);
        when(settingsRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(settingsRepository.save(existing)).thenReturn(existing);
        var request = new WorkshopSettingsRequest(
                new BigDecimal("52000"),
                new BigDecimal("16"),
                "USD",
                "Gracias por visitarnos");

        var result = settingsService.updateSettings(request);

        assertEquals(new BigDecimal("52000"), result.hourlyRateCop());
        assertEquals(new BigDecimal("16"), result.vatPercentage());
        assertEquals("USD", result.currency());
        assertEquals("Gracias por visitarnos", result.invoiceNote());
        verify(settingsRepository).save(existing);
    }
}
