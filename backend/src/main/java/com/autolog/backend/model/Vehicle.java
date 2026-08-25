package com.autolog.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String vehicleType; // Ej: Motocicleta, Automóvil, Camioneta

    @Column(nullable = false)
    private String brand; // Ej: Kymco, Yamaha, Toyota

    @Column(nullable = false)
    private String model; // Ej: Active 110, Hilux

    @Column(nullable = false, unique = true)
    private String plate; // Placa única

    @Column(nullable = false, unique = true)
    private String chassisNumber; // Número de chasis / VIN único

    @Column(nullable = false)
    private Integer vehicleYear; // Año del vehículo

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client; // Dueño del vehículo
}
