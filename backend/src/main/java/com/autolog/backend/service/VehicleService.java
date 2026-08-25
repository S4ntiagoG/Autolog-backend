package com.autolog.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.autolog.backend.model.Vehicle;
import com.autolog.backend.repository.VehicleRepository;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    // Inyección de dependencias por constructor (buena práctica en Spring Boot)
    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    // Listar todos los vehículos
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    // Buscar vehículo por ID
    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id);
    }

    // Guardar o registrar un nuevo vehículo
    public Vehicle saveVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    // Eliminar vehículo por ID
    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }
}
