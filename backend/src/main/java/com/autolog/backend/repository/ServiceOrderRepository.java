package com.autolog.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autolog.backend.model.ServiceOrder;

@Repository
public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long> {
    
    // Método útil para buscar todas las órdenes asociadas a un vehículo específico por su ID
    List<ServiceOrder> findByVehicleId(Long vehicleId);
}