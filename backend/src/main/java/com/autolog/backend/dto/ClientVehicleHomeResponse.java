package com.autolog.backend.dto;

public record ClientVehicleHomeResponse(
        Long vehicleId,
        String vehicleType,
        String brand,
        String model,
        Integer vehicleYear,
        String plate,
        String orderNumber,
        String status) {
}