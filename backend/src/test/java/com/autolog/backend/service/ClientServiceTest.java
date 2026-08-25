package com.autolog.backend.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.autolog.backend.model.Client;
import com.autolog.backend.repository.ClientRepository;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private ClientService clientService;

    @Test
    @DisplayName("Debería guardar un cliente exitosamente")
    void testSaveClient() {
        // Arrange (Preparar datos de prueba)
        Client client = new Client();
        client.setId(1L);
        client.setName("María Gómez");
        client.setEmail("maria@email.com");
        client.setPhone("3109876543");

        // Simular que el repositorio devuelve el cliente al guardarlo
        when(clientRepository.save(any(Client.class))).thenReturn(client);

        // Act (Ejecutar el método del servicio)
        Client savedClient = clientService.saveClient(client);

        // Assert (Verificar resultados)
        assertNotNull(savedClient);
        assertEquals("María Gómez", savedClient.getName());
        assertEquals("maria@email.com", savedClient.getEmail());
        
        // Verificar que el repositorio fue llamado exactamente una vez
        verify(clientRepository, times(1)).save(client);
    }

    @Test
    @DisplayName("Debería encontrar un cliente por su ID")
    void testFindClientById() {
        // Arrange
        Long clientId = 1L;
        Client client = new Client();
        client.setId(clientId);
        client.setName("Carlos Pérez");

        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));

        // Act
        Optional<Client> foundClient = clientService.getClientById(clientId);

        // Assert
        assertTrue(foundClient.isPresent());
        assertEquals("Carlos Pérez", foundClient.get().getName());
        verify(clientRepository, times(1)).findById(clientId);
    }
}