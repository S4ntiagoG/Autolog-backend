package com.autolog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MechanicLoginRequest(
        @NotBlank @Size(max = 100) String codigoMecanico,
        @NotBlank @Size(max = 72) String password) {
}
