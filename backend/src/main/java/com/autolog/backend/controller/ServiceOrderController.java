package com.autolog.backend.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.autolog.backend.dto.ServiceHistoryItem;
import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.model.Vehicle;
import com.autolog.backend.repository.VehicleRepository;
import com.autolog.backend.service.ServiceOrderEvidenceService;
import com.autolog.backend.service.ServiceOrderService;

@RestController
@RequestMapping("/api/service-orders")
@CrossOrigin(origins = "*")
public class ServiceOrderController {

    private final ServiceOrderService serviceOrderService;
    private final VehicleRepository vehicleRepository;
    private final ServiceOrderEvidenceService evidenceService;

    public ServiceOrderController(
            ServiceOrderService serviceOrderService,
            VehicleRepository vehicleRepository,
            ServiceOrderEvidenceService evidenceService) {
        this.serviceOrderService = serviceOrderService;
        this.vehicleRepository = vehicleRepository;
        this.evidenceService = evidenceService;
    }

    // 1. Listar todas las órdenes de servicio del taller
    @GetMapping
    public ResponseEntity<List<ServiceOrder>> getAllServiceOrders() {
        List<ServiceOrder> orders = serviceOrderService.getAllServiceOrders();
        return ResponseEntity.ok(orders);
    }

    // 2. Buscar una orden de servicio por ID
    @GetMapping("/{id}")
    public ResponseEntity<ServiceOrder> getServiceOrderById(@PathVariable Long id) {
        return serviceOrderService.getServiceOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping(value = "/{id}/evidence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ServiceOrder> uploadEvidence(
            @PathVariable Long id,
            @RequestParam(value = "photoFront", required = false) MultipartFile photoFront,
            @RequestParam(value = "photoRightSide", required = false) MultipartFile photoRightSide,
            @RequestParam(value = "photoBack", required = false) MultipartFile photoBack,
            @RequestParam(value = "photoOdometer", required = false) MultipartFile photoOdometer,
            @RequestParam(value = "photoExtra", required = false) MultipartFile photoExtra) {
        return serviceOrderService.getServiceOrderById(id)
                .map(order -> {
                    Map<String, MultipartFile> files = new LinkedHashMap<>();
                    files.put("front", photoFront);
                    files.put("right-side", photoRightSide);
                    files.put("back", photoBack);
                    files.put("odometer", photoOdometer);
                    files.put("extra", photoExtra);
                    try {
                        evidenceService.saveEvidence(order, files);
                        return ResponseEntity.ok(serviceOrderService.saveServiceOrder(order));
                    } catch (IOException error) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar la evidencia fotográfica.", error);
                    } catch (IllegalArgumentException error) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                HttpStatus.BAD_REQUEST, error.getMessage(), error);
                    }
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/{id}/evidence/{slot}")
    public ResponseEntity<Resource> getEvidence(
            @PathVariable Long id,
            @PathVariable String slot) throws IOException {
        return serviceOrderService.getServiceOrderById(id)
                .map(order -> {
                    try {
                        Resource image = evidenceService.loadEvidence(order, slot);
                        MediaType mediaType = evidenceService.getMediaType(order, slot);
                        return ResponseEntity.ok().contentType(mediaType).body(image);
                    } catch (IOException error) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                HttpStatus.NOT_FOUND, "No se encontró la evidencia solicitada.", error);
                    } catch (IllegalArgumentException error) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                HttpStatus.NOT_FOUND, "No se encontró la evidencia solicitada.", error);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<ServiceHistoryItem>> getVehicleHistory(@PathVariable Long vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(serviceOrderService.getHistoryByVehicleId(vehicleId));
    }

    // 3. Registrar una nueva entrada / orden de servicio (Recepción del vehículo)
    @PostMapping
    public ResponseEntity<ServiceOrder> createServiceOrder(@RequestBody ServiceOrder serviceOrder) {
        // Validar que el vehículo exista antes de crear la orden
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

    @PutMapping("/{id}")
    public ResponseEntity<ServiceOrder> updateServiceOrder(@PathVariable Long id,
            @RequestBody ServiceOrder serviceOrder) {
        return serviceOrderService.getServiceOrderById(id)
                .map(existing -> {
                    existing.setEntryDate(LocalDate.now());
                    existing.setPrimaryReason(serviceOrder.getPrimaryReason());
                    existing.setCurrentMileage(serviceOrder.getCurrentMileage());
                    existing.setCustomerObservations(serviceOrder.getCustomerObservations());
                    if (serviceOrder.getMechanicDiagnosis() != null) {
                        existing.setMechanicDiagnosis(serviceOrder.getMechanicDiagnosis());
                    }
                    if (serviceOrder.getStatus() != null) {
                        existing.setStatus(serviceOrder.getStatus());
                    }
                    if (serviceOrder.getTasks() != null) {
                        existing.setTasks(serviceOrder.getTasks());
                    }
                    if (serviceOrder.getParts() != null) {
                        existing.setParts(serviceOrder.getParts());
                    }
                    if (serviceOrder.getLabor() != null) {
                        existing.setLabor(serviceOrder.getLabor());
                    }
                    if (serviceOrder.getServiceCost() != null) {
                        existing.setServiceCost(serviceOrder.getServiceCost());
                    }
                    return ResponseEntity.ok(serviceOrderService.saveServiceOrder(existing));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // 4. Eliminar una orden de servicio
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceOrder(@PathVariable Long id) {
        if (serviceOrderService.getServiceOrderById(id).isPresent()) {
            serviceOrderService.deleteServiceOrder(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}