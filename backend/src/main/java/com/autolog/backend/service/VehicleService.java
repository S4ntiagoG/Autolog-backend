package com.autolog.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.autolog.backend.dto.VehicleUpdateRequest;
import com.autolog.backend.model.Vehicle;
import com.autolog.backend.repository.VehicleRepository;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id);
    }

    public Vehicle saveVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, VehicleUpdateRequest request) {
        Vehicle existing = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado"));

        Optional<Vehicle> duplicatePlate = vehicleRepository.findByPlate(request.getPlate());
        if (duplicatePlate.isPresent() && !duplicatePlate.get().getId().equals(id)) {
            throw new IllegalArgumentException("La placa ya está registrada para otro vehículo");
        }

        existing.setVehicleType(request.getVehicleType());
        existing.setBrand(request.getBrand());
        existing.setPlate(request.getPlate());
        existing.setChassisNumber(request.getChassisNumber());
        existing.setModel(request.getModel());
        existing.setVehicleYear(request.getVehicleYear());

        return vehicleRepository.save(existing);
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }
}
