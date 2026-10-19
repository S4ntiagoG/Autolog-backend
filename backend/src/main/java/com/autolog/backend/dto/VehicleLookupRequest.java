package com.autolog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VehicleLookupRequest(
        @NotBlank @Size(max = 9) String plate,
        @NotBlank @Size(max = 100) String identificationNumber) {
}