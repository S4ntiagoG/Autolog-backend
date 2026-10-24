package com.autolog.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "mecanicos")
@Getter
@Setter
@NoArgsConstructor
public class Mecanico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigoMecanico; // Coincide con la búsqueda del repositorio

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(unique = true, length = 30)
    private String documentNumber;

    @Column(length = 30)
    private String phone;

    @Column(length = 254)
    private String email;

    @Column(length = 50)
    private String specialty;

    @Column(length = 30)
    private String experienceLevel;

    private java.time.LocalDate hireDate;
}