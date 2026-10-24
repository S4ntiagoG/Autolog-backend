package com.autolog.backend.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.autolog.backend.dto.MechanicRequest;
import com.autolog.backend.dto.MechanicResponse;
import com.autolog.backend.service.MechanicManagementService;

@RestController
@RequestMapping("/api/mechanics")
public class MechanicManagementController {
    private final MechanicManagementService mechanicService;

    public MechanicManagementController(MechanicManagementService mechanicService) {
        this.mechanicService = mechanicService;
    }

    @GetMapping
    public List<MechanicResponse> getMechanics() {
        return mechanicService.getMechanics();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MechanicResponse createMechanic(@Valid @RequestBody MechanicRequest request) {
        return mechanicService.createMechanic(request);
    }

    @PutMapping("/{id}")
    public MechanicResponse updateMechanic(
            @PathVariable Long id,
            @Valid @RequestBody MechanicRequest request) {
        return mechanicService.updateMechanic(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMechanic(@PathVariable Long id) {
        mechanicService.deleteMechanic(id);
    }
}
