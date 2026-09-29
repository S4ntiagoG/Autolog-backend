package com.autolog.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import com.autolog.backend.model.Vehicle;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    // Método personalizado útil para buscar vehículos por su placa
    Optional<Vehicle> findByPlate(String plate);

    @EntityGraph(attributePaths = "client")
    Optional<Vehicle> findByPlateAndClient_IdentificationNumber(String plate, String identificationNumber);

    Optional<Vehicle> findByChassisNumber(String chassisNumber);
}
