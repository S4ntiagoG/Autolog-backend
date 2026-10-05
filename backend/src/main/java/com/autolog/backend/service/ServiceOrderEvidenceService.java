package com.autolog.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.autolog.backend.model.ServiceOrder;

@Service
public class ServiceOrderEvidenceService {
    private static final long MAX_IMAGE_SIZE_BYTES = 10L * 1024 * 1024;
    private static final Map<String, String> ALLOWED_IMAGE_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp");

    private final Path uploadRoot;

    public ServiceOrderEvidenceService(@Value("${autolog.upload-dir:uploads}") String uploadDirectory) {
        this.uploadRoot = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    public void saveEvidence(ServiceOrder order, Map<String, MultipartFile> files) throws IOException {
        Path orderDirectory = uploadRoot.resolve("service-orders").resolve(order.getId().toString()).normalize();
        if (!orderDirectory.startsWith(uploadRoot)) {
            throw new IllegalArgumentException("La ruta de almacenamiento no es válida.");
        }

        List<Path> savedFiles = new ArrayList<>();
        try {
            for (Map.Entry<String, MultipartFile> entry : files.entrySet()) {
                MultipartFile file = entry.getValue();
                if (file == null || file.isEmpty()) {
                    continue;
                }

                String extension = validateImage(file);
                Files.createDirectories(orderDirectory);
                Path destination = orderDirectory.resolve(UUID.randomUUID() + extension).normalize();
                if (!destination.startsWith(uploadRoot)) {
                    throw new IllegalArgumentException("La ruta del archivo no es válida.");
                }
                file.transferTo(destination);
                savedFiles.add(destination);
                setEvidencePath(order, entry.getKey(),
                        uploadRoot.relativize(destination).toString().replace('\\', '/'));
            }
        } catch (IOException | RuntimeException error) {
            for (Path savedFile : savedFiles) {
                Files.deleteIfExists(savedFile);
            }
            throw error;
        }
    }

    public Resource loadEvidence(ServiceOrder order, String slot) throws IOException {
        String storedPath = getEvidencePath(order, slot);
        if (storedPath == null || storedPath.isBlank()) {
            throw new IOException("No hay una imagen guardada para esta evidencia.");
        }

        Path imagePath = uploadRoot.resolve(storedPath).normalize();
        Path orderDirectory = uploadRoot.resolve("service-orders").resolve(order.getId().toString()).normalize();
        if (!imagePath.startsWith(orderDirectory) || !Files.isRegularFile(imagePath)) {
            throw new IOException("La ruta de evidencia no existe o no es válida.");
        }
        return new FileSystemResource(imagePath);
    }

    public MediaType getMediaType(ServiceOrder order, String slot) {
        String storedPath = getEvidencePath(order, slot);
        if (storedPath == null) {
            throw new IllegalArgumentException("No hay una imagen guardada para esta evidencia.");
        }

        String lowerPath = storedPath.toLowerCase();
        if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        }
        if (lowerPath.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }
        if (lowerPath.endsWith(".webp")) {
            return MediaType.parseMediaType("image/webp");
        }
        throw new IllegalArgumentException("El formato de imagen guardado no es válido.");
    }

    private String validateImage(MultipartFile file) {
        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new IllegalArgumentException("Cada imagen debe pesar máximo 10 MB.");
        }
        String extension = ALLOWED_IMAGE_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new IllegalArgumentException("Solo se permiten imágenes JPG, PNG o WebP.");
        }
        try (InputStream input = file.getInputStream()) {
            byte[] signature = input.readNBytes(12);
            boolean matchesType = switch (file.getContentType()) {
                case "image/jpeg" -> signature.length >= 3
                        && (signature[0] & 0xff) == 0xff
                        && (signature[1] & 0xff) == 0xd8
                        && (signature[2] & 0xff) == 0xff;
                case "image/png" -> signature.length >= 8
                        && (signature[0] & 0xff) == 0x89
                        && signature[1] == 'P'
                        && signature[2] == 'N'
                        && signature[3] == 'G'
                        && (signature[4] & 0xff) == 0x0d
                        && (signature[5] & 0xff) == 0x0a
                        && (signature[6] & 0xff) == 0x1a
                        && (signature[7] & 0xff) == 0x0a;
                case "image/webp" -> signature.length >= 12
                        && new String(signature, 0, 4, java.nio.charset.StandardCharsets.US_ASCII).equals("RIFF")
                        && new String(signature, 8, 4, java.nio.charset.StandardCharsets.US_ASCII).equals("WEBP");
                default -> false;
            };
            if (!matchesType) {
                throw new IllegalArgumentException("El contenido no coincide con el formato de imagen declarado.");
            }
        } catch (IOException error) {
            throw new IllegalArgumentException("No se pudo leer el archivo de imagen.", error);
        }
        return extension;
    }

    private void setEvidencePath(ServiceOrder order, String slot, String path) {
        switch (slot) {
            case "front" -> order.setPhotoFront(path);
            case "right-side" -> order.setPhotoRightSide(path);
            case "back" -> order.setPhotoBack(path);
            case "odometer" -> order.setPhotoOdometer(path);
            case "extra" -> order.setPhotoExtra(path);
            default -> throw new IllegalArgumentException("Tipo de evidencia no válido.");
        }
    }

    private String getEvidencePath(ServiceOrder order, String slot) {
        return switch (slot) {
            case "front" -> order.getPhotoFront();
            case "right-side" -> order.getPhotoRightSide();
            case "back" -> order.getPhotoBack();
            case "odometer" -> order.getPhotoOdometer();
            case "extra" -> order.getPhotoExtra();
            default -> throw new IllegalArgumentException("Tipo de evidencia no válido.");
        };
    }
}
