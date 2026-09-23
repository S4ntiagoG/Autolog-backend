package com.autolog.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClientUpdateRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotBlank(message = "La identificación es obligatoria")
    private String identificationNumber;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^(\\+?\\d{7,15}|\\d{7,15})$", message = "El teléfono tiene un formato inválido")
    private String phone;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo electrónico no es válido")
    private String email;
}
