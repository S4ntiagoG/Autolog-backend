package com.autolog.backend.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OrderColumn;
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
@Table(name = "service_orders")
@Getter
@Setter
@NoArgsConstructor
public class ServiceOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate entryDate; // Fecha de entrada

    @Column(nullable = false)
    private String primaryReason; // Razón principal de visita / diagnóstico

    @Column(nullable = false)
    private Integer currentMileage; // Kilometraje actual (KM/MI)

    @Column(precision = 12, scale = 2)
    private BigDecimal serviceCost; // Costo total registrado para el mantenimiento

    @Column(columnDefinition = "TEXT")
    private String customerObservations; // Observaciones y comentarios del cliente

    @Column(columnDefinition = "TEXT")
    private String mechanicDiagnosis;

    @Column(length = 30)
    private String status = "PENDIENTE";

    private LocalDateTime estimatedPickupAt;

    @Column(length = 300)
    private String progressNote;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PaymentMethod paymentMethod;

    private LocalDateTime paymentRecordedAt;

    @Column(precision = 12, scale = 2)
    private BigDecimal paymentAmount;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "service_order_tasks", joinColumns = @JoinColumn(name = "service_order_id"))
    @OrderColumn(name = "task_position")
    private List<ServiceTask> tasks = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "service_order_parts", joinColumns = @JoinColumn(name = "service_order_id"))
    @OrderColumn(name = "part_position")
    private List<ServicePart> parts = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "service_order_labor", joinColumns = @JoinColumn(name = "service_order_id"))
    @OrderColumn(name = "labor_position")
    private List<ServiceLabor> labor = new ArrayList<>();

    // Rutas o nombres de los archivos de las 5 fotos de evidencia
    private String photoFront;          // Frente
    private String photoRightSide;      // Lateral derecho
    private String photoBack;           // Trasera
    private String photoOdometer;       // Odómetro
    private String photoExtra;          // Foto adicional / estado

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle; // Relación con el vehículo que ingresa al taller
}