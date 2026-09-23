package com.autolog.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.autolog.backend.dto.ClientUpdateRequest;
import com.autolog.backend.model.Client;
import com.autolog.backend.repository.ClientRepository;

@Service
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Optional<Client> getClientById(Long id) {
        return clientRepository.findById(id);
    }

    public Client saveClient(Client client) {
        return clientRepository.save(client);
    }

    public Client updateClient(Long id, ClientUpdateRequest request) {
        Client existing = clientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado"));

        Optional<Client> byEmail = clientRepository.findByEmail(request.getEmail());
        if (byEmail.isPresent() && !byEmail.get().getId().equals(id)) {
            throw new IllegalArgumentException("Ya existe otro cliente con ese correo electrónico");
        }

        existing.setName(request.getName());
        existing.setIdentificationNumber(request.getIdentificationNumber());
        existing.setPhone(request.getPhone());
        existing.setEmail(request.getEmail());

        return clientRepository.save(existing);
    }

    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
    }
}