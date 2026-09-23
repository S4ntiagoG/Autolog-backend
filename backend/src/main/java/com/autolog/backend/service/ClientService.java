package com.autolog.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.autolog.backend.model.Client;
import com.autolog.backend.repository.ClientRepository;

@Service
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    // Listar todos los clientes
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    // Buscar cliente por ID
    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }

    // Guardar o registrar un nuevo cliente
    public Client saveClient(Client client) {
        return clientRepository.save(client);
    }

    // Eliminar cliente por ID
    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }
}