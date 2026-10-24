package com.autolog.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.autolog.backend.dto.MechanicRequest;
import com.autolog.backend.model.Mecanico;
import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.model.Vehicle;
import com.autolog.backend.repository.AdminRepository;
import com.autolog.backend.repository.MecanicoRepository;
import com.autolog.backend.repository.ServiceOrderRepository;

@ExtendWith(MockitoExtension.class)
class MechanicManagementServiceTest {
    @Mock
    private MecanicoRepository mechanicRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private ServiceOrderRepository serviceOrderRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private MechanicManagementService mechanicService;

    @Test
    void listsAssignedUnpaidMechanicsAsOccupied() {
        Mecanico mechanic = mechanic();
        Vehicle vehicle = new Vehicle();
        vehicle.setPlate("ABC123");
        vehicle.setBrand("Honda");
        vehicle.setModel("CB");
        ServiceOrder order = new ServiceOrder();
        order.setId(12L);
        order.setStatus("LISTO");
        order.setVehicle(vehicle);
        order.setAssignedMechanic(mechanic);
        when(serviceOrderRepository
                .findByAssignedMechanicIsNotNullAndPaymentMethodIsNullOrderByEntryDateDescIdDesc())
                .thenReturn(List.of(order));
        when(mechanicRepository.findAll()).thenReturn(List.of(mechanic));
        when(serviceOrderRepository.findActiveAssignedMechanicIds()).thenReturn(List.of(1L));

        var result = mechanicService.getMechanics();

        assertEquals(1, result.size());
        assertFalse(result.getFirst().available());
        assertFalse(result.getFirst().deletable());
        assertEquals("ABC123", result.getFirst().assignments().getFirst().plate());
        assertEquals("LISTO", result.getFirst().assignments().getFirst().status());
    }

    @Test
    void hashesPasswordAndReturnsNoPasswordWhenCreatingMechanic() {
        MechanicRequest request = request("new@autolog.com", "password-123");
        when(mechanicRepository.existsByCodigoMecanicoIgnoreCase(request.accessEmail())).thenReturn(false);
        when(adminRepository.findByUsuarioIgnoreCase(request.accessEmail())).thenReturn(Optional.empty());
        when(mechanicRepository.existsByDocumentNumberIgnoreCase(request.documentNumber())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("bcrypt-hash");
        when(mechanicRepository.save(any(Mecanico.class))).thenAnswer(invocation -> {
            Mecanico saved = invocation.getArgument(0);
            saved.setId(4L);
            return saved;
        });

        var result = mechanicService.createMechanic(request);

        assertEquals("new@autolog.com", result.accessEmail());
        assertEquals("Carlos Mendoza", result.fullName());
        assertTrue(result.available());
        verify(passwordEncoder).encode("password-123");
    }

    @Test
    void refusesToDeleteMechanicAssignedToAnyServiceOrder() {
        Mecanico mechanic = mechanic();
        when(mechanicRepository.findById(1L)).thenReturn(Optional.of(mechanic));
        when(serviceOrderRepository.existsByAssignedMechanicIdAndPaymentMethodIsNull(1L)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> mechanicService.deleteMechanic(1L));

        verify(mechanicRepository, never()).delete(any(Mecanico.class));
    }

    private Mecanico mechanic() {
        Mecanico mechanic = new Mecanico();
        mechanic.setId(1L);
        mechanic.setCodigoMecanico("mecanico@autolog.com");
        mechanic.setNombre("Carlos Mendoza");
        mechanic.setDocumentNumber("123456");
        mechanic.setPassword("encoded-password");
        return mechanic;
    }

    private MechanicRequest request(String accessEmail, String password) {
        return new MechanicRequest(
                accessEmail,
                "Carlos Mendoza",
                "123456",
                "+573001234567",
                "carlos@gmail.com",
                "Mecánica general",
                "Junior",
                LocalDate.of(2026, 1, 15),
                password);
    }
}
