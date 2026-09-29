package com.autolog.backend.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.autolog.backend.model.Client;
import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.model.Vehicle;
import com.autolog.backend.repository.ServiceOrderRepository;
import com.autolog.backend.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class VehicleLookupServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ServiceOrderRepository serviceOrderRepository;

    @InjectMocks
    private VehicleLookupService vehicleLookupService;

    @Test
    void returnsVehicleHomeForMatchingPlateAndOwnerDocument() {
        Client client = new Client();
        client.setIdentificationNumber("123456");
        Vehicle vehicle = new Vehicle();
        vehicle.setId(12L);
        vehicle.setVehicleType("Motocicleta");
        vehicle.setBrand("Yamaha");
        vehicle.setModel("FZ25");
        vehicle.setVehicleYear(2024);
        vehicle.setPlate("ABC123");
        vehicle.setClient(client);
        ServiceOrder order = new ServiceOrder();
        order.setId(1L);

        when(vehicleRepository.findByPlateAndClient_IdentificationNumber("ABC123", "123456"))
                .thenReturn(Optional.of(vehicle));
        when(serviceOrderRepository.findFirstByVehicleIdOrderByEntryDateDescIdDesc(12L))
                .thenReturn(Optional.of(order));

        var result = vehicleLookupService.findByPlateAndDocument("abc123", "123456").orElseThrow();

        assertEquals("Yamaha", result.brand());
        assertEquals("FZ25", result.model());
        assertEquals("ABC123", result.plate());
        assertEquals("ORD-001", result.orderNumber());
        assertEquals("PENDIENTE", result.status());
        verify(vehicleRepository).findByPlateAndClient_IdentificationNumber("ABC123", "123456");
    }

    @Test
    void returnsEmptyWhenPlateAndDocumentDoNotMatch() {
        when(vehicleRepository.findByPlateAndClient_IdentificationNumber("ABC123", "wrong"))
                .thenReturn(Optional.empty());

        assertTrue(vehicleLookupService.findByPlateAndDocument("ABC123", "wrong").isEmpty());
    }
}