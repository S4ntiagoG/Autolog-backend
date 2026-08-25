package com.autolog.backend.service;

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

import com.autolog.backend.model.Client;
import com.autolog.backend.model.Vehicle;
import com.autolog.backend.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    @Test
    @DisplayName("Debería guardar un vehículo exitosamente asociado a un cliente")
    void testSaveVehicle() {
        // Arrange (Preparar datos de prueba)
        Client client = new Client();
        client.setId(1L);
        client.setName("Carlos Pérez");

        Vehicle vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setPlate("ABC-123");
        vehicle.setBrand("Kymco");
        vehicle.setModel("Active 110");
        vehicle.setVehicleYear(2023);
        vehicle.setClient(client);

        // Simular que el repositorio devuelve el vehículo al guardarlo
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        // Act (Ejecutar el método del servicio)
        Vehicle savedVehicle = vehicleService.saveVehicle(vehicle);

        // Assert (Verificar resultados)
        assertNotNull(savedVehicle);
        assertEquals("ABC-123", savedVehicle.getPlate());
        assertEquals("Kymco", savedVehicle.getBrand());
        assertNotNull(savedVehicle.getClient());
        assertEquals(1L, savedVehicle.getClient().getId());

        // Verificar que el repositorio fue llamado exactamente una vez
        verify(vehicleRepository, times(1)).save(vehicle);
    }

    @Test
    @DisplayName("Debería encontrar un vehículo por su ID")
    void testFindVehicleById() {
        // Arrange
        Long vehicleId = 1L;
        Vehicle vehicle = new Vehicle();
        vehicle.setId(vehicleId);
        vehicle.setPlate("XYZ-789");

        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));

        // Act
        Optional<Vehicle> foundVehicle = vehicleService.getVehicleById(vehicleId);

        // Assert
        assertTrue(foundVehicle.isPresent());
        assertEquals("XYZ-789", foundVehicle.get().getPlate());
        verify(vehicleRepository, times(1)).findById(vehicleId);
    }
}