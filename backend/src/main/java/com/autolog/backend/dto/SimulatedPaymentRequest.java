package com.autolog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.autolog.backend.model.PaymentMethod;

public record SimulatedPaymentRequest(
        @NotBlank @Size(max = 9) String plate,
        @NotBlank @Size(max = 100) String identificationNumber,
        @NotNull PaymentMethod paymentMethod) {
}
