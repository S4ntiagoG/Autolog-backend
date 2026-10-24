package com.autolog.backend.service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.autolog.backend.dto.MechanicAssignmentResponse;
import com.autolog.backend.dto.MechanicRequest;
import com.autolog.backend.dto.MechanicResponse;
import com.autolog.backend.model.Mecanico;
import com.autolog.backend.repository.AdminRepository;
import com.autolog.backend.repository.MecanicoRepository;
import com.autolog.backend.repository.ServiceOrderRepository;

@Service
public class MechanicManagementService {
    private final MecanicoRepository mechanicRepository;
    private final AdminRepository adminRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final PasswordEncoder passwordEncoder;

    public MechanicManagementService(
            MecanicoRepository mechanicRepository,
            AdminRepository adminRepository,
            ServiceOrderRepository serviceOrderRepository,
            PasswordEncoder passwordEncoder) {
        this.mechanicRepository = mechanicRepository;
        this.adminRepository = adminRepository;
        this.serviceOrderRepository = serviceOrderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<MechanicResponse> getMechanics() {
        var activeOrders = serviceOrderRepository
                .findByAssignedMechanicIsNotNullAndPaymentMethodIsNullOrderByEntryDateDescIdDesc();
        Map<Long, List<MechanicAssignmentResponse>> assignmentsByMechanic = activeOrders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getAssignedMechanic().getId(),
                        Collectors.mapping(this::toAssignment, Collectors.toList())));
        var assignedMechanicIds = new HashSet<>(serviceOrderRepository.findActiveAssignedMechanicIds());
        return mechanicRepository.findAll().stream()
                .sorted(Comparator.comparing(Mecanico::getNombre, String.CASE_INSENSITIVE_ORDER))
                .map(mechanic -> toResponse(
                        mechanic,
                        assignmentsByMechanic.getOrDefault(mechanic.getId(), List.of()),
                        !assignedMechanicIds.contains(mechanic.getId())))
                .toList();
    }

    @Transactional
    public MechanicResponse createMechanic(MechanicRequest request) {
        validateCredentials(request, null);
        validatePassword(request.password(), true);
        Mecanico mechanic = new Mecanico();
        applyRequest(mechanic, request);
        mechanic.setPassword(passwordEncoder.encode(request.password()));
        return toResponse(mechanicRepository.save(mechanic), List.of(), true);
    }

    @Transactional
    public MechanicResponse updateMechanic(Long id, MechanicRequest request) {
        Mecanico mechanic = mechanicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        validateCredentials(request, id);
        validatePassword(request.password(), false);
        applyRequest(mechanic, request);
        if (request.password() != null && !request.password().isBlank()) {
            mechanic.setPassword(passwordEncoder.encode(request.password()));
        }
        List<MechanicAssignmentResponse> assignments = getActiveAssignments(id);
        return toResponse(mechanicRepository.save(mechanic), assignments, assignments.isEmpty());
    }

    @Transactional
    public void deleteMechanic(Long id) {
        Mecanico mechanic = mechanicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (serviceOrderRepository.existsByAssignedMechanicIdAndPaymentMethodIsNull(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar un mecánico asignado a una orden de servicio.");
        }
        serviceOrderRepository.clearMechanicAssignments(id);
        mechanicRepository.delete(mechanic);
    }

    private void validateCredentials(MechanicRequest request, Long existingId) {
        boolean usernameExists = existingId == null
                ? mechanicRepository.existsByCodigoMecanicoIgnoreCase(request.accessEmail())
                : mechanicRepository.existsByCodigoMecanicoIgnoreCaseAndIdNot(request.accessEmail(), existingId);
        if (usernameExists || adminRepository.findByUsuarioIgnoreCase(request.accessEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo de acceso ya está registrado.");
        }

        boolean documentExists = existingId == null
                ? mechanicRepository.existsByDocumentNumberIgnoreCase(request.documentNumber())
                : mechanicRepository.existsByDocumentNumberIgnoreCaseAndIdNot(request.documentNumber(), existingId);
        if (documentExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El documento ya está registrado.");
        }
    }

    private void validatePassword(String password, boolean required) {
        if (password == null || password.isBlank()) {
            if (required) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña es obligatoria.");
            }
            return;
        }
        if (password.length() < 8 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "La contraseña debe tener entre 8 y 72 bytes UTF-8.");
        }
    }

    private void applyRequest(Mecanico mechanic, MechanicRequest request) {
        mechanic.setCodigoMecanico(request.accessEmail().trim());
        mechanic.setNombre(request.fullName().trim());
        mechanic.setDocumentNumber(request.documentNumber().trim());
        mechanic.setPhone(request.phone().trim());
        mechanic.setEmail(request.email().trim());
        mechanic.setSpecialty(request.specialty());
        mechanic.setExperienceLevel(request.experienceLevel());
        mechanic.setHireDate(request.hireDate());
    }

    private List<MechanicAssignmentResponse> getActiveAssignments(Long mechanicId) {
        return serviceOrderRepository
                .findByAssignedMechanicIsNotNullAndPaymentMethodIsNullOrderByEntryDateDescIdDesc()
                .stream()
                .filter(order -> order.getAssignedMechanic().getId().equals(mechanicId))
                .map(order -> new MechanicAssignmentResponse(
                        order.getId(),
                        order.getVehicle().getPlate(),
                        order.getVehicle().getBrand() + " " + order.getVehicle().getModel(),
                        order.getStatus()))
                .toList();
    }

    private MechanicAssignmentResponse toAssignment(com.autolog.backend.model.ServiceOrder order) {
        return new MechanicAssignmentResponse(
                order.getId(),
                order.getVehicle().getPlate(),
                order.getVehicle().getBrand() + " " + order.getVehicle().getModel(),
                order.getStatus());
    }

    private MechanicResponse toResponse(
            Mecanico mechanic,
            List<MechanicAssignmentResponse> assignments,
            boolean deletable) {
        return new MechanicResponse(
                mechanic.getId(),
                mechanic.getCodigoMecanico(),
                mechanic.getNombre(),
                mechanic.getDocumentNumber(),
                mechanic.getPhone(),
                mechanic.getEmail(),
                mechanic.getSpecialty(),
                mechanic.getExperienceLevel(),
                mechanic.getHireDate(),
                assignments.isEmpty(),
                deletable,
                new ArrayList<>(assignments));
    }
}
