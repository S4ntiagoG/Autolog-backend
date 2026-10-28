package com.autolog.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MechanicRequest(
        @NotBlank @Email @Size(max = 254) String accessEmail,
        @NotBlank @Pattern(regexp = "^(?=.*\\p{L})[\\p{L}\\p{M} ]{3,100}$") String fullName,
        @NotBlank @Pattern(regexp = "[0-9]{3,10}") String documentNumber,
        @NotBlank @Pattern(regexp = "[0-9]{10}") String phone,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Pattern(regexp = "Mecánica general|Motores|Frenos|Transmisión|Electricidad|Inyección|Suspensión")
        String specialty,
        @NotBlank @Pattern(regexp = "Junior|Semi-senior|Senior") String experienceLevel,
        @NotNull LocalDate hireDate,
        @Pattern(regexp = "^$|^.{8,72}$") String password) {
}
