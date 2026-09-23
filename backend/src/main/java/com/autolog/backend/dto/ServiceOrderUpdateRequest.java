package com.autolog.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceOrderUpdateRequest {

    private List<String> reasons;

    @NotNull(message = "El kilometraje es obligatorio")
    @PositiveOrZero(message = "El kilometraje no puede ser negativo")
    private Integer currentMileage;

    private String mileageUnit;
    private String orderStatus;

    private String initialObservations;
    private String customerObservations;
    private String workshopPreliminaryObservations;

    @NotBlank(message = "La razón principal no puede quedar vacía")
    private String primaryReason;
}
