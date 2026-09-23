package com.autolog.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autolog.backend.model.Client;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    
    // Método opcional pero muy útil para buscar clientes por su email único
    Optional<Client> findByEmail(String email);
}