package com.autolog.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.autolog.backend.model.PaymentMethod;

public record SimulatedPaymentResponse(
        Long serviceOrderId,
        PaymentMethod paymentMethod,
        LocalDateTime paymentRecordedAt,
        BigDecimal amount) {
}
