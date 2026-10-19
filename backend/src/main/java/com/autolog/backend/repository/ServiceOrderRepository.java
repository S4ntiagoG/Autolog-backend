package com.autolog.backend.repository;

import java.util.List;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.autolog.backend.model.ServiceOrder;

@Repository
public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long> {
    
    // Método útil para buscar todas las órdenes asociadas a un vehículo específico por su ID
    List<ServiceOrder> findByVehicleIdOrderByEntryDateDescIdDesc(Long vehicleId);

    java.util.Optional<ServiceOrder> findFirstByVehicleIdOrderByEntryDateDescIdDesc(Long vehicleId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select serviceOrder from ServiceOrder serviceOrder where serviceOrder.id = :id")
    java.util.Optional<ServiceOrder> findByIdForUpdate(@Param("id") Long id);
}