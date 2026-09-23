package com.autolog.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.model.Vehicle;
import com.autolog.backend.repository.VehicleRepository;
import com.autolog.backend.service.ServiceOrderService;

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

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<ServiceOrder>> getServiceOrdersByVehicle(@PathVariable Long vehicleId) {
        List<ServiceOrder> orders = serviceOrderService.getServiceOrdersByVehicleId(vehicleId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceOrder> getServiceOrderById(@PathVariable Long id) {
        return serviceOrderService.getServiceOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<ServiceOrder> createServiceOrder(@RequestBody ServiceOrder serviceOrder) {
        if (serviceOrder.getVehicle() == null || serviceOrder.getVehicle().getId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        Vehicle vehicle = vehicleRepository.findById(serviceOrder.getVehicle().getId())
                .orElse(null);

        if (vehicle == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        serviceOrder.setVehicle(vehicle);
        ServiceOrder savedOrder = serviceOrderService.saveServiceOrder(serviceOrder);
        return new ResponseEntity<>(savedOrder, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceOrder(@PathVariable Long id) {
        if (serviceOrderService.getServiceOrderById(id).isPresent()) {
            serviceOrderService.deleteServiceOrder(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}