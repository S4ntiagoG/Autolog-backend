package com.autolog.backend.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import com.autolog.backend.model.ServiceOrder;

class ServiceOrderEvidenceServiceTest {
    private static final byte[] ONE_PIXEL_PNG = java.util.Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZr8AAAAASUVORK5CYII=");

    @TempDir
    Path uploadDirectory;

    private ServiceOrderEvidenceService evidenceService;

    @BeforeEach
    void setUp() {
        evidenceService = new ServiceOrderEvidenceService(uploadDirectory.toString());
    }

    @Test
    void savesEvidenceAndPersistsAPathThatCanBeServed() throws Exception {
        ServiceOrder order = new ServiceOrder();
        order.setId(42L);
        MockMultipartFile image = new MockMultipartFile("photoFront", "front.png", "image/png", ONE_PIXEL_PNG);

        evidenceService.saveEvidence(order, Map.of("front", image));

        assertTrue(order.getPhotoFront().startsWith("service-orders/42/"));
        assertTrue(order.getPhotoFront().endsWith(".png"));
        assertArrayEquals(ONE_PIXEL_PNG, evidenceService.loadEvidence(order, "front").getInputStream().readAllBytes());
        assertEquals(MediaType.IMAGE_PNG, evidenceService.getMediaType(order, "front"));
    }

    @Test
    void rejectsImageContentThatDoesNotMatchItsDeclaredType() throws Exception {
        ServiceOrder order = new ServiceOrder();
        order.setId(42L);
        MockMultipartFile image = new MockMultipartFile("photoFront", "front.png", "image/png", "not an image".getBytes());

        assertThrows(IllegalArgumentException.class, () ->
                evidenceService.saveEvidence(order, Map.of("front", image)));
        assertNull(order.getPhotoFront());
        try (var paths = Files.walk(uploadDirectory)) {
            assertEquals(1, paths.count());
        }
    }
}
