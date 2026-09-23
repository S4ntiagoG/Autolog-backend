package com.autolog.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderTaskRequest {

    @NotBlank(message = "La descripción de la tarea es obligatoria")
    private String description;

    private boolean completed;
}
