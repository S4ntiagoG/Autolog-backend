package com.autolog.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ServiceHistoryItem(
        Long serviceOrderId,
        LocalDate entryDate,
        String primaryReason,
        Integer currentMileage,
        String customerObservations,
        BigDecimal serviceCost) {
}
