package com.autolog.backend.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.autolog.backend.repository.AdminRepository;
import com.autolog.backend.repository.MecanicoRepository;

@Service
public class MecanicoUserDetailsService implements UserDetailsService {
    private final MecanicoRepository mecanicoRepository;
    private final AdminRepository adminRepository;

    public MecanicoUserDetailsService(
            MecanicoRepository mecanicoRepository,
            AdminRepository adminRepository) {
        this.mecanicoRepository = mecanicoRepository;
        this.adminRepository = adminRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String normalizedUsername = username.trim();
        var mechanic = mecanicoRepository.findByCodigoMecanicoIgnoreCase(normalizedUsername);
        var admin = adminRepository.findByUsuarioIgnoreCase(normalizedUsername);
        if (mechanic.isPresent() == admin.isPresent()) {
            throw new UsernameNotFoundException("Credenciales inválidas.");
        }
        if (admin.isPresent()) {
            return new MecanicoPrincipal(admin.get());
        }
        return new MecanicoPrincipal(mechanic.orElseThrow());
    }
}
