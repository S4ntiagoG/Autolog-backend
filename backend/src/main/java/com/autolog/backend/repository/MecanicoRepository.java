package com.autolog.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autolog.backend.model.Mecanico;

public interface MecanicoRepository extends JpaRepository<Mecanico, Long> {
    Optional<Mecanico> findByCodigoMecanicoIgnoreCase(String codigoMecanico);

    boolean existsByCodigoMecanicoIgnoreCase(String codigoMecanico);

    boolean existsByCodigoMecanicoIgnoreCaseAndIdNot(String codigoMecanico, Long id);

    boolean existsByDocumentNumberIgnoreCase(String documentNumber);

    boolean existsByDocumentNumberIgnoreCaseAndIdNot(String documentNumber, Long id);
}
