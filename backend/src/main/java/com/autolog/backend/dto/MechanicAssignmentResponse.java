package com.autolog.backend.dto;

public record MechanicAssignmentResponse(
        Long serviceOrderId,
        String plate,
        String vehicleDescription,
        String status) {
}
