package com.autolog.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.model.ServiceTask;
import com.autolog.backend.model.Vehicle;
import com.autolog.backend.repository.ServiceOrderRepository;

@ExtendWith(MockitoExtension.class)
class ServiceOrderServiceTest {

    @Mock
    private ServiceOrderRepository serviceOrderRepository;

    @InjectMocks
    private ServiceOrderService serviceOrderService;

    @Test
    @DisplayName("Debería guardar una orden de servicio exitosamente")
    void testSaveServiceOrder() {
        // Arrange
        Vehicle vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setPlate("XYZ99A");

        ServiceOrder order = new ServiceOrder();
        order.setId(1L);
        order.setEntryDate(LocalDate.now());
        order.setPrimaryReason("Mantenimiento preventivo de 5,000 km");
        order.setCurrentMileage(4950);
        order.setVehicle(vehicle);

        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenReturn(order);

        // Act
        ServiceOrder savedOrder = serviceOrderService.saveServiceOrder(order);

        // Assert
        assertNotNull(savedOrder);
        assertEquals("Mantenimiento preventivo de 5,000 km", savedOrder.getPrimaryReason());
        assertEquals(4950, savedOrder.getCurrentMileage());
        assertNotNull(savedOrder.getVehicle());
        
        verify(serviceOrderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("Debería encontrar una orden de servicio por ID")
    void testFindServiceOrderById() {
        // Arrange
        Long orderId = 1L;
        ServiceOrder order = new ServiceOrder();
        order.setId(orderId);
        order.setPrimaryReason("Cambio de pastillas de freno");

        when(serviceOrderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // Act
        Optional<ServiceOrder> foundOrder = serviceOrderService.getServiceOrderById(orderId);

        // Assert
        assertTrue(foundOrder.isPresent());
        assertEquals("Cambio de pastillas de freno", foundOrder.get().getPrimaryReason());
        verify(serviceOrderRepository, times(1)).findById(orderId);
    }

    @Test
    @DisplayName("Incluye la hora estimada y la actualización en el historial del cliente")
    void includesPickupAndProgressNoteInVehicleHistory() {
        ServiceOrder order = new ServiceOrder();
        LocalDateTime estimatedPickupAt = LocalDateTime.of(2026, 10, 14, 17, 0);
        order.setId(3L);
        order.setEntryDate(LocalDate.of(2026, 10, 13));
        order.setPrimaryReason("Reparación");
        order.setCurrentMileage(12000);
        order.setStatus("EN PROGRESO");
        order.setEstimatedPickupAt(estimatedPickupAt);
        order.setProgressNote("Esperando repuestos");
        ServiceTask firstTask = new ServiceTask();
        firstTask.setDescription("Revisar frenos");
        firstTask.setCompleted(true);
        ServiceTask secondTask = new ServiceTask();
        secondTask.setDescription("Cambiar pastillas");
        secondTask.setCompleted(false);
        order.setTasks(List.of(firstTask, secondTask));
        when(serviceOrderRepository.findByVehicleIdOrderByEntryDateDescIdDesc(7L))
                .thenReturn(List.of(order));

        var history = serviceOrderService.getHistoryByVehicleId(7L);

        assertEquals(estimatedPickupAt, history.get(0).estimatedPickupAt());
        assertEquals("Esperando repuestos", history.get(0).progressNote());
        assertEquals(List.of("Revisar frenos", "Cambiar pastillas"),
                history.get(0).tasks().stream().map(ServiceTask::getDescription).toList());
        assertEquals(List.of(true, false),
                history.get(0).tasks().stream().map(ServiceTask::isCompleted).toList());
    }
}