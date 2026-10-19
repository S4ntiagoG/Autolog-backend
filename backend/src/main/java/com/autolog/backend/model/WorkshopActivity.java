package com.autolog.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "workshop_activity")
@Getter
@Setter
@NoArgsConstructor
public class WorkshopActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WorkshopActivityType type;

    @Column(nullable = false)
    private LocalDateTime occurredAt;

    @Column(nullable = false, length = 255)
    private String mechanicName;

    @Column(nullable = false, length = 255)
    private String vehicleBrand;

    @Column(nullable = false, length = 255)
    private String vehicleModel;

    @Column(nullable = false, length = 255)
    private String plate;

    @Column(nullable = false, length = 1000)
    private String detail;

    @Column(nullable = false)
    private Long serviceOrderId;
}
