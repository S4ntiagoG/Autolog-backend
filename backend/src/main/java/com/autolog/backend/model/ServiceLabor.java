package com.autolog.backend.model;

import java.math.BigDecimal;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class ServiceLabor {
    private String description;

    @Column(precision = 8, scale = 2)
    private BigDecimal hours;

    @Column(precision = 12, scale = 2)
    private BigDecimal rate;
}
