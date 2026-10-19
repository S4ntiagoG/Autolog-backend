package com.autolog.backend.security;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.autolog.backend.model.Admin;
import com.autolog.backend.model.Mecanico;
import com.autolog.backend.repository.AdminRepository;
import com.autolog.backend.repository.MecanicoRepository;

@ExtendWith(MockitoExtension.class)
class MecanicoUserDetailsServiceTest {
    @Mock
    private MecanicoRepository mecanicoRepository;

    @Mock
    private AdminRepository adminRepository;

    @InjectMocks
    private MecanicoUserDetailsService userDetailsService;

    @Test
    void loadsMechanicByTrimmedCodeAndProvidesOnlyMechanicRole() {
        Mecanico mechanic = new Mecanico();
        mechanic.setId(4L);
        mechanic.setCodigoMecanico("MEC-004");
        mechanic.setNombre("Mecánico de prueba");
        mechanic.setPassword("$2a$12$encoded-password");
        when(mecanicoRepository.findByCodigoMecanicoIgnoreCase("MEC-004"))
                .thenReturn(Optional.of(mechanic));
        when(adminRepository.findByUsuarioIgnoreCase("MEC-004"))
                .thenReturn(Optional.empty());

        MecanicoPrincipal principal = (MecanicoPrincipal) userDetailsService.loadUserByUsername(" MEC-004 ");

        assertEquals(4L, principal.getId());
        assertEquals("Mecánico de prueba", principal.getNombre());
        assertEquals("MEC-004", principal.getUsername());
        assertEquals("MECHANIC", principal.getRole());
        assertEquals("$2a$12$encoded-password", principal.getPassword());
        assertEquals("ROLE_MECHANIC", principal.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void rejectsUnknownMechanicCodes() {
        when(mecanicoRepository.findByCodigoMecanicoIgnoreCase("UNKNOWN"))
                .thenReturn(Optional.empty());
        when(adminRepository.findByUsuarioIgnoreCase("UNKNOWN"))
                .thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("UNKNOWN"));
    }

    @Test
    void loadsAdminByUsernameAndProvidesOnlyAdminRole() {
        Admin admin = new Admin();
        admin.setId(7L);
        admin.setUsuario("admin.taller");
        admin.setPassword("$2a$12$encoded-admin-password");
        when(mecanicoRepository.findByCodigoMecanicoIgnoreCase("admin.taller"))
                .thenReturn(Optional.empty());
        when(adminRepository.findByUsuarioIgnoreCase("admin.taller"))
                .thenReturn(Optional.of(admin));

        MecanicoPrincipal principal = (MecanicoPrincipal) userDetailsService.loadUserByUsername(" admin.taller ");

        assertEquals(7L, principal.getId());
        assertEquals("admin.taller", principal.getUsername());
        assertEquals("admin.taller", principal.getNombre());
        assertEquals("ADMIN", principal.getRole());
        assertEquals("ROLE_ADMIN", principal.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void rejectsAmbiguousUsernameSharedByAdminAndMechanic() {
        Mecanico mechanic = new Mecanico();
        mechanic.setCodigoMecanico("DUPLICATE");
        Admin admin = new Admin();
        admin.setUsuario("DUPLICATE");
        when(mecanicoRepository.findByCodigoMecanicoIgnoreCase("DUPLICATE"))
                .thenReturn(Optional.of(mechanic));
        when(adminRepository.findByUsuarioIgnoreCase("DUPLICATE"))
                .thenReturn(Optional.of(admin));

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("DUPLICATE"));
    }
}
