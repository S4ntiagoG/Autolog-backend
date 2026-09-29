package com.autolog.backend.service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.autolog.backend.model.Vehicle;
import com.autolog.backend.repository.VehicleRepository;

@Service
public class VehicleService {

    private static final Pattern COLOMBIAN_PLATE_PATTERN = Pattern.compile(
            "^(?:[A-Z]{3}(?:\\d{3}|\\d{2}[A-Z]?)|[RS]\\d{5}|(?:CD|CC|AT|OI)\\d{4})$");

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
        validatePlate(vehicle);
        return vehicleRepository.save(vehicle);
    }

    public Vehicle getOrCreateVehicle(Vehicle vehicle) {
        validatePlate(vehicle);
        Optional<Vehicle> vehicleByPlate = vehicleRepository.findByPlate(vehicle.getPlate());
        Optional<Vehicle> vehicleByChassis = vehicleRepository.findByChassisNumber(vehicle.getChassisNumber());

        if (vehicleByPlate.isPresent() && vehicleByChassis.isPresent()
                && !Objects.equals(vehicleByPlate.get().getId(), vehicleByChassis.get().getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La placa y el VIN pertenecen a vehículos diferentes");
        }

        Optional<Vehicle> existingVehicle = vehicleByPlate.or(() -> vehicleByChassis);
        if (existingVehicle.isPresent()) {
            Long existingClientId = existingVehicle.get().getClient().getId();
            Long requestedClientId = vehicle.getClient() == null ? null : vehicle.getClient().getId();
            if (!Objects.equals(existingClientId, requestedClientId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "El vehículo ya está asociado a otro cliente");
            }
            return existingVehicle.get();
        }

        return saveVehicle(vehicle);
    }

    public static boolean isValidColombianPlate(String plate) {
        return plate != null && COLOMBIAN_PLATE_PATTERN.matcher(plate).matches();
    }

    private void validatePlate(Vehicle vehicle) {
        if (vehicle == null || !isValidColombianPlate(vehicle.getPlate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La placa no cumple con un formato válido para Colombia");
        }
    }

    // Eliminar vehículo por ID
    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }
}
