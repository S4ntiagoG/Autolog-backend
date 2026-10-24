package com.autolog.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record MechanicResponse(
        Long id,
        String accessEmail,
        String fullName,
        String documentNumber,
        String phone,
        String email,
        String specialty,
        String experienceLevel,
        LocalDate hireDate,
        boolean available,
        boolean deletable,
        List<MechanicAssignmentResponse> assignments) {
}
