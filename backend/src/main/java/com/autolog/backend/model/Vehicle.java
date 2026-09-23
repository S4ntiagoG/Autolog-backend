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
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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

    @NotBlank
    @Column(nullable = false)
    private String vehicleType;

    @NotBlank
    @Column(nullable = false)
    private String brand;

    @NotBlank
    @Column(nullable = false)
    private String model;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z]{2,4}[-]?[0-9A-Za-z]{3,8}$", message = "La placa tiene un formato inválido")
    @Column(nullable = false, unique = true)
    private String plate;

    @NotBlank
    @Pattern(regexp = "^[A-HJ-NPR-Z0-9]{17}$", message = "El VIN debe tener 17 caracteres y formato válido")
    @Column(nullable = false, unique = true)
    private String chassisNumber;

    @NotNull
    @Min(1886)
    @Max(2100)
    @Column(nullable = false)
    private Integer vehicleYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
}
