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

    List<ServiceOrder> findByAssignedMechanicIsNotNullAndPaymentMethodIsNullOrderByEntryDateDescIdDesc();

    boolean existsByAssignedMechanicIdAndPaymentMethodIsNull(Long mechanicId);

    @Query("select distinct serviceOrder.assignedMechanic.id from ServiceOrder serviceOrder "
            + "where serviceOrder.assignedMechanic is not null and serviceOrder.paymentMethod is null")
    List<Long> findActiveAssignedMechanicIds();

    @org.springframework.data.jpa.repository.Modifying
    @Query("update ServiceOrder serviceOrder set serviceOrder.assignedMechanic = null "
            + "where serviceOrder.assignedMechanic.id = :mechanicId")
    int clearMechanicAssignments(@Param("mechanicId") Long mechanicId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select serviceOrder from ServiceOrder serviceOrder where serviceOrder.id = :id")
    java.util.Optional<ServiceOrder> findByIdForUpdate(@Param("id") Long id);
}