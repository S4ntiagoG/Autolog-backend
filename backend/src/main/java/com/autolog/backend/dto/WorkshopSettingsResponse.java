package com.autolog.backend.dto;

import java.math.BigDecimal;

public record WorkshopSettingsResponse(
        BigDecimal hourlyRateCop,
        BigDecimal vatPercentage,
        String currency,
        String invoiceNote) {
}
