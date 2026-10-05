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
public class ServicePart {
    private String name;
    private String partNumber;
    private Integer quantity;

    @Column(precision = 12, scale = 2)
    private BigDecimal unitPrice;
}
