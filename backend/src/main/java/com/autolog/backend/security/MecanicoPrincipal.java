package com.autolog.backend.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.autolog.backend.model.Admin;
import com.autolog.backend.model.Mecanico;

public final class MecanicoPrincipal implements UserDetails {
    private final Long id;
    private final String codigoMecanico;
    private final String nombre;
    private final String passwordHash;
    private final String role;

    public MecanicoPrincipal(Mecanico mecanico) {
        this.id = mecanico.getId();
        this.codigoMecanico = mecanico.getCodigoMecanico();
        this.nombre = mecanico.getNombre();
        this.passwordHash = mecanico.getPassword();
        this.role = "MECHANIC";
    }

    public MecanicoPrincipal(Admin admin) {
        this.id = admin.getId();
        this.codigoMecanico = admin.getUsuario();
        this.nombre = admin.getUsuario();
        this.passwordHash = admin.getPassword();
        this.role = "ADMIN";
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getRole() {
        return role;
    }

    @Override
    public String getUsername() {
        return codigoMecanico;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }
}
