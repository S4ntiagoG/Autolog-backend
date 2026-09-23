package com.autolog.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autolog.backend.dto.OrderTaskRequest;
import com.autolog.backend.dto.ServiceOrderUpdateRequest;
import com.autolog.backend.model.OrderTask;
import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.model.Vehicle;
import com.autolog.backend.repository.VehicleRepository;
import com.autolog.backend.service.ServiceOrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/service-orders")
@CrossOrigin(origins = "*")
public class ServiceOrderController {

    private final ServiceOrderService serviceOrderService;
    private final VehicleRepository vehicleRepository;

    public ServiceOrderController(ServiceOrderService serviceOrderService, VehicleRepository vehicleRepository) {
        this.serviceOrderService = serviceOrderService;
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping
    public ResponseEntity<List<ServiceOrder>> getAllServiceOrders() {
        return ResponseEntity.ok(serviceOrderService.getAllServiceOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceOrder> getServiceOrderById(@PathVariable Long id) {
        return serviceOrderService.getServiceOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<?> createServiceOrder(@Valid @RequestBody ServiceOrder serviceOrder) {
        if (serviceOrder.getVehicle() == null || serviceOrder.getVehicle().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Debe indicar un vehículo válido"));
        }

        Vehicle vehicle = vehicleRepository.findById(serviceOrder.getVehicle().getId()).orElse(null);
        if (vehicle == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Vehículo no encontrado"));
        }

        serviceOrder.setVehicle(vehicle);
        ServiceOrder savedOrder = serviceOrderService.saveServiceOrder(serviceOrder);
        return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateServiceOrder(@PathVariable Long id, @Valid @RequestBody ServiceOrderUpdateRequest request) {
        try {
            ServiceOrder updated = serviceOrderService.updateServiceOrder(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/tasks")
    public ResponseEntity<?> addTask(@PathVariable Long id, @Valid @RequestBody OrderTaskRequest request) {
        try {
            OrderTask task = serviceOrderService.addTaskToOrder(id, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(task);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/tasks/{taskId}")
    public ResponseEntity<?> toggleTask(@PathVariable Long orderId, @PathVariable Long taskId, @RequestBody Map<String, Boolean> payload) {
        try {
            boolean completed = payload.getOrDefault("completed", false);
            OrderTask updated = serviceOrderService.toggleTask(orderId, taskId, completed);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceOrder(@PathVariable Long id) {
        if (serviceOrderService.getServiceOrderById(id).isPresent()) {
            serviceOrderService.deleteServiceOrder(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = error instanceof FieldError fieldError ? fieldError.getField() : error.getObjectName();
            errors.put(fieldName, error.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(errors);
    }
}