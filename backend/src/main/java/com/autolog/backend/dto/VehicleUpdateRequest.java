package com.autolog.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VehicleUpdateRequest {

    @NotBlank(message = "El tipo de vehículo es obligatorio")
    private String vehicleType;

    @NotBlank(message = "La marca es obligatoria")
    private String brand;

    @NotBlank(message = "La placa es obligatoria")
    @Pattern(regexp = "^[A-Za-z]{2,4}[-]?[0-9A-Za-z]{3,8}$", message = "La placa tiene un formato inválido")
    private String plate;

    @NotBlank(message = "El VIN es obligatorio")
    @Pattern(regexp = "^[A-HJ-NPR-Z0-9]{17}$", message = "El VIN debe tener 17 caracteres y formato válido")
    private String chassisNumber;

    @NotBlank(message = "El modelo es obligatorio")
    private String model;

    @NotNull(message = "El año es obligatorio")
    @Min(value = 1886, message = "El año debe ser mayor o igual a 1886")
    @Max(value = 2100, message = "El año no puede ser superior a 2100")
    private Integer vehicleYear;
}
