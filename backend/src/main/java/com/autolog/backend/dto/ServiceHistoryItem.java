package com.autolog.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.autolog.backend.model.ServiceTask;

public record ServiceHistoryItem(
        Long serviceOrderId,
        LocalDate entryDate,
        String primaryReason,
        Integer currentMileage,
        String customerObservations,
        BigDecimal serviceCost,
        String status,
        LocalDateTime estimatedPickupAt,
        String progressNote,
        List<ServiceTask> tasks) {
}
