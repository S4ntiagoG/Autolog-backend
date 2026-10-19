package com.autolog.backend.dto;

import java.time.LocalDateTime;

import com.autolog.backend.model.WorkshopActivityType;

public record WorkshopActivityResponse(
        Long id,
        WorkshopActivityType type,
        LocalDateTime occurredAt,
        String mechanicName,
        String vehicleBrand,
        String vehicleModel,
        String plate,
        String detail,
        Long serviceOrderId) {
}
