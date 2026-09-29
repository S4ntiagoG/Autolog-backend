package com.autolog.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

import jakarta.validation.Valid;
import com.autolog.backend.dto.ClientVehicleHomeResponse;
import com.autolog.backend.dto.VehicleLookupRequest;
import com.autolog.backend.service.VehicleLookupService;

import com.autolog.backend.model.Vehicle;
import com.autolog.backend.service.VehicleService;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;
    private final VehicleLookupService vehicleLookupService;

    public VehicleController(VehicleService vehicleService, VehicleLookupService vehicleLookupService) {
        this.vehicleService = vehicleService;
        this.vehicleLookupService = vehicleLookupService;
    }

    @PostMapping("/search")
    public ResponseEntity<ClientVehicleHomeResponse> searchByPlateAndDocument(
            @Valid @RequestBody VehicleLookupRequest request) {
        return vehicleLookupService.findByPlateAndDocument(request.plate(), request.identificationNumber())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET: Obtener todos los vehículos -> http://localhost:8080/api/vehicles
    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        List<Vehicle> vehicles = vehicleService.getAllVehicles();
        return ResponseEntity.ok(vehicles);
    }

    // GET: Obtener vehículo por ID -> http://localhost:8080/api/vehicles/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        return vehicleService.getVehicleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // POST: Registrar un nuevo vehículo -> http://localhost:8080/api/vehicles
    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@RequestBody Vehicle vehicle) {
        Vehicle savedVehicle = vehicleService.getOrCreateVehicle(vehicle);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedVehicle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        return vehicleService.getVehicleById(id)
                .map(existing -> {
                    existing.setVehicleType(vehicle.getVehicleType());
                    existing.setBrand(vehicle.getBrand());
                    existing.setModel(vehicle.getModel());
                    existing.setPlate(vehicle.getPlate());
                    existing.setChassisNumber(vehicle.getChassisNumber());
                    existing.setVehicleYear(vehicle.getVehicleYear());
                    return ResponseEntity.ok(vehicleService.saveVehicle(existing));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // DELETE: Eliminar un vehículo -> http://localhost:8080/api/vehicles/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        if (vehicleService.getVehicleById(id).isPresent()) {
            vehicleService.deleteVehicle(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}

