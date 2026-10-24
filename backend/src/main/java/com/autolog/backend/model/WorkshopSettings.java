package com.autolog.backend.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "workshop_settings")
@Getter
@Setter
@NoArgsConstructor
public class WorkshopSettings {

    @Id
    private Long id;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal hourlyRateCop;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal vatPercentage;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, length = 1000)
    private String invoiceNote;
}
