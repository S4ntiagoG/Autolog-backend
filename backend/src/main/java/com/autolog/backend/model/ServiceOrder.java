package com.autolog.backend.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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
    private LocalDate entryDate;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private String primaryReason;

    @Column(nullable = false)
    private Integer currentMileage;

    @Column(columnDefinition = "TEXT")
    private String customerObservations;

    @Column(columnDefinition = "TEXT")
    private String initialObservations;

    @Column(columnDefinition = "TEXT")
    private String workshopPreliminaryObservations;

    @Column(columnDefinition = "TEXT")
    private String diagnosticSummary;

    @Column(nullable = false)
    private String orderStatus = "PENDIENTE";

    @Column
    private String mileageUnit = "KM";

    @OneToMany(mappedBy = "serviceOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderTask> tasks = new ArrayList<>();

    @Column
    private String photoFront;
    @Column
    private String photoRightSide;
    @Column
    private String photoBack;
    @Column
    private String photoOdometer;
    @Column
    private String photoExtra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    public void addTask(OrderTask task) {
        tasks.add(task);
        task.setServiceOrder(this);
    }

    public void removeTask(OrderTask task) {
        tasks.remove(task);
        task.setServiceOrder(null);
    }
}