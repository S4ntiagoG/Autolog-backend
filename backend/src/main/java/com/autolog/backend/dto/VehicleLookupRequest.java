package com.autolog.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record VehicleLookupRequest(
        @NotBlank String plate,
        @NotBlank String identificationNumber) {
}