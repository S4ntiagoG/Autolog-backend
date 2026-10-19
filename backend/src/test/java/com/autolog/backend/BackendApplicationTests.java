package com.autolog.backend;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.autolog.backend.model.Client;
import com.autolog.backend.model.Admin;
import com.autolog.backend.model.Mecanico;
import com.autolog.backend.model.ServiceLabor;
import com.autolog.backend.model.ServiceOrder;
import com.autolog.backend.model.ServicePart;
import com.autolog.backend.model.Vehicle;
import com.autolog.backend.repository.ClientRepository;
import com.autolog.backend.repository.AdminRepository;
import com.autolog.backend.repository.MecanicoRepository;
import com.autolog.backend.repository.ServiceOrderRepository;
import com.autolog.backend.repository.VehicleRepository;

@SpringBootTest
@AutoConfigureMockMvc
class BackendApplicationTests {
	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private MecanicoRepository mecanicoRepository;

	@Autowired
	private AdminRepository adminRepository;

	@Autowired
	private ClientRepository clientRepository;

	@Autowired
	private VehicleRepository vehicleRepository;

	@Autowired
	private ServiceOrderRepository serviceOrderRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Test
	void contextLoads() {
	}

	@Test
	void mechanicWriteRoutesRequireAuthenticationAndPublicClientReadsRemainAvailable() throws Exception {
		MvcResult csrfResult = mockMvc.perform(get("/api/mechanics/auth/csrf"))
				.andExpect(status().isNoContent())
				.andReturn();
		Cookie csrfCookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");
		assertNotNull(csrfCookie);

		mockMvc.perform(post("/api/mechanics/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"codigoMecanico\":\"TEST-MECH\",\"password\":\"invalid\"}"))
				.andExpect(status().isForbidden());

		mockMvc.perform(get("/api/mechanics/auth/me"))
				.andExpect(status().isUnauthorized());

		mockMvc.perform(get("/api/mechanics/activity"))
				.andExpect(status().isUnauthorized());

		mockMvc.perform(post("/api/clients")
				.cookie(csrfCookie)
				.header("X-XSRF-TOKEN", csrfCookie.getValue())
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
				.andExpect(status().isUnauthorized());

		mockMvc.perform(get("/api/clients"))
				.andExpect(status().isUnauthorized());

		mockMvc.perform(get("/api/service-orders/vehicle/99999999"))
				.andExpect(status().isNotFound());
	}

	@Test
	@Transactional
	void mechanicCanLogInWithHashedPasswordAndReadOwnSession() throws Exception {
		Mecanico mechanic = new Mecanico();
		mechanic.setCodigoMecanico("TEST-MECH");
		mechanic.setNombre("Mecánico de pruebas");
		mechanic.setPassword(passwordEncoder.encode("Test-Password-123"));
		mecanicoRepository.save(mechanic);

		MvcResult csrfResult = mockMvc.perform(get("/api/mechanics/auth/csrf"))
				.andExpect(status().isNoContent())
				.andReturn();
		Cookie csrfCookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");
		assertNotNull(csrfCookie);

		MvcResult loginResult = mockMvc.perform(post("/api/mechanics/auth/login")
				.cookie(csrfCookie)
				.header("X-XSRF-TOKEN", csrfCookie.getValue())
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"codigoMecanico\":\"TEST-MECH\",\"password\":\"Test-Password-123\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.codigoMecanico").value("TEST-MECH"))
				.andExpect(jsonPath("$.nombre").value("Mecánico de pruebas"))
				.andExpect(jsonPath("$.role").value("MECHANIC"))
				.andReturn();

		MockHttpSession mechanicSession = (MockHttpSession) loginResult.getRequest().getSession(false);
		assertNotNull(mechanicSession);
		mockMvc.perform(get("/api/mechanics/auth/me").session(mechanicSession))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.codigoMecanico").value("TEST-MECH"))
				.andExpect(jsonPath("$.role").value("MECHANIC"));
	}

	@Test
	@Transactional
	void adminCanLoginThroughWorkshopFormAndAccessAdministratorDashboardData() throws Exception {
		String adminUsername = "admin-test-" + UUID.randomUUID();
		Admin admin = new Admin();
		admin.setUsuario(adminUsername);
		admin.setPassword(passwordEncoder.encode("Admin-Password-123"));
		adminRepository.saveAndFlush(admin);

		MvcResult csrfResult = mockMvc.perform(get("/api/mechanics/auth/csrf"))
				.andExpect(status().isNoContent())
				.andReturn();
		Cookie csrfCookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");
		assertNotNull(csrfCookie);
		MvcResult loginResult = mockMvc.perform(post("/api/mechanics/auth/login")
				.cookie(csrfCookie)
				.header("X-XSRF-TOKEN", csrfCookie.getValue())
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"codigoMecanico\":\"" + adminUsername
						+ "\",\"password\":\"Admin-Password-123\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.codigoMecanico").value(adminUsername))
				.andExpect(jsonPath("$.nombre").value(adminUsername))
				.andExpect(jsonPath("$.role").value("ADMIN"))
				.andReturn();
		MockHttpSession adminSession = (MockHttpSession) loginResult.getRequest().getSession(false);
		assertNotNull(adminSession);

		mockMvc.perform(get("/api/mechanics/auth/me").session(adminSession))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.role").value("ADMIN"));
		mockMvc.perform(get("/api/mechanics/activity").session(adminSession))
				.andExpect(status().isOk());
		mockMvc.perform(get("/api/vehicles").session(adminSession))
				.andExpect(status().isOk());
		mockMvc.perform(get("/api/service-orders").session(adminSession))
				.andExpect(status().isOk());
	}

	@Test
	@Transactional
	void mechanicActionsAreSavedInRecentWorkshopActivity() throws Exception {
		Mecanico mechanic = new Mecanico();
		mechanic.setCodigoMecanico("ACTIVITY-MECH");
		mechanic.setNombre("Mecánico actividad");
		mechanic.setPassword(passwordEncoder.encode("Activity-Password-123"));
		mecanicoRepository.saveAndFlush(mechanic);

		MvcResult csrfResult = mockMvc.perform(get("/api/mechanics/auth/csrf"))
				.andExpect(status().isNoContent())
				.andReturn();
		Cookie csrfCookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");
		assertNotNull(csrfCookie);
		MvcResult loginResult = mockMvc.perform(post("/api/mechanics/auth/login")
				.cookie(csrfCookie)
				.header("X-XSRF-TOKEN", csrfCookie.getValue())
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"codigoMecanico\":\"ACTIVITY-MECH\",\"password\":\"Activity-Password-123\"}"))
				.andExpect(status().isOk())
				.andReturn();
		MockHttpSession mechanicSession = (MockHttpSession) loginResult.getRequest().getSession(false);
		assertNotNull(mechanicSession);

		Client client = new Client();
		client.setName("Cliente de actividad");
		client.setIdentificationNumber("ACTIVITY-CLIENT-123");
		client.setEmail("activity-test@example.com");
		client.setPhone("3000000001");
		clientRepository.saveAndFlush(client);

		Vehicle vehicle = new Vehicle();
		vehicle.setVehicleType("Automóvil");
		vehicle.setBrand("Toyota");
		vehicle.setModel("Corolla");
		vehicle.setPlate("ACT123");
		vehicle.setChassisNumber("ACTIVITY-TEST-VIN");
		vehicle.setVehicleYear(2024);
		vehicle.setClient(client);
		vehicleRepository.saveAndFlush(vehicle);

		String entryRequest = """
				{"entryDate":"2026-10-18","primaryReason":"Revisión general","currentMileage":1000,
				"status":"PENDIENTE","vehicle":{"id":%d},
				"tasks":[{"description":"Revisar frenos","completed":false}]}
				""".formatted(vehicle.getId());
		mockMvc.perform(post("/api/service-orders")
				.session(mechanicSession)
				.cookie(csrfCookie)
				.header("X-XSRF-TOKEN", csrfCookie.getValue())
				.contentType(MediaType.APPLICATION_JSON)
				.content(entryRequest))
				.andExpect(status().isCreated());
		long serviceOrderId = serviceOrderRepository
				.findFirstByVehicleIdOrderByEntryDateDescIdDesc(vehicle.getId())
				.orElseThrow()
				.getId();

		mockMvc.perform(get("/api/mechanics/activity").session(mechanicSession))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[?(@.plate == 'ACT123')]").value(hasSize(1)))
				.andExpect(jsonPath("$[?(@.plate == 'ACT123')].type")
						.value(hasItems("VEHICLE_RECEIVED")));

		String updateRequest = """
				{"entryDate":"2026-10-18","primaryReason":"Revisión general","currentMileage":1000,
				"status":"EN PROGRESO","vehicle":{"id":%d},
				"tasks":[{"description":"Revisar frenos","completed":true}]}
				""".formatted(vehicle.getId());
		mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
				.put("/api/service-orders/{id}", serviceOrderId)
				.session(mechanicSession)
				.cookie(csrfCookie)
				.header("X-XSRF-TOKEN", csrfCookie.getValue())
				.contentType(MediaType.APPLICATION_JSON)
				.content(updateRequest))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/mechanics/activity").session(mechanicSession))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[?(@.plate == 'ACT123')]").value(hasSize(3)))
				.andExpect(jsonPath("$[?(@.plate == 'ACT123')].type")
						.value(hasItems("STATUS_CHANGED", "TASK_COMPLETED", "VEHICLE_RECEIVED")))
				.andExpect(jsonPath("$[?(@.plate == 'ACT123')].detail")
						.value(hasItems("Trabajo completado: Revisar frenos")))
				.andExpect(jsonPath("$[?(@.plate == 'ACT123')].mechanicName")
						.value(hasItems("Mecánico actividad")));
	}

	@Test
	@Transactional
	void clientCanRecordOneSimulatedPaymentForTheirReadyServiceOrder() throws Exception {
		Client client = new Client();
		client.setName("Cliente de prueba");
		client.setIdentificationNumber("PAYMENT-TEST-123");
		client.setEmail("payment-test@example.com");
		client.setPhone("3000000000");
		clientRepository.saveAndFlush(client);

		Vehicle vehicle = new Vehicle();
		vehicle.setVehicleType("Automóvil");
		vehicle.setBrand("Toyota");
		vehicle.setModel("Corolla");
		vehicle.setPlate("TST123");
		vehicle.setChassisNumber("PAYMENT-TEST-VIN");
		vehicle.setVehicleYear(2024);
		vehicle.setClient(client);
		vehicleRepository.saveAndFlush(vehicle);

		ServiceOrder order = new ServiceOrder();
		order.setEntryDate(java.time.LocalDate.now());
		order.setPrimaryReason("Prueba de pago simulado");
		order.setCurrentMileage(1000);
		order.setStatus("LISTO");
		order.setVehicle(vehicle);
		ServicePart part = new ServicePart();
		part.setName("Repuesto");
		part.setPartNumber("P-1");
		part.setQuantity(1);
		part.setUnitPrice(new java.math.BigDecimal("100"));
		order.setParts(java.util.List.of(part));
		ServiceLabor labor = new ServiceLabor();
		labor.setDescription("Mano de obra");
		labor.setHours(new java.math.BigDecimal("1"));
		labor.setRate(new java.math.BigDecimal("50"));
		order.setLabor(java.util.List.of(labor));
		order = serviceOrderRepository.saveAndFlush(order);

		MvcResult csrfResult = mockMvc.perform(get("/api/mechanics/auth/csrf"))
				.andExpect(status().isNoContent())
				.andReturn();
		Cookie csrfCookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");
		assertNotNull(csrfCookie);

		String paymentRequest = """
				{"plate":"TST123","identificationNumber":"PAYMENT-TEST-123","paymentMethod":"TRANSFERENCIA"}
				""";
		mockMvc.perform(post("/api/service-orders/{id}/simulate-payment", order.getId())
				.cookie(csrfCookie)
				.header("X-XSRF-TOKEN", csrfCookie.getValue())
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"plate":"TST123","identificationNumber":"WRONG-DOCUMENT","paymentMethod":"TRANSFERENCIA"}
						"""))
				.andExpect(status().isNotFound());

		mockMvc.perform(post("/api/service-orders/{id}/simulate-payment", order.getId())
				.cookie(csrfCookie)
				.header("X-XSRF-TOKEN", csrfCookie.getValue())
				.contentType(MediaType.APPLICATION_JSON)
				.content(paymentRequest))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.paymentMethod").value("TRANSFERENCIA"))
				.andExpect(jsonPath("$.amount").value(150.0))
				.andExpect(jsonPath("$.paymentRecordedAt").isNotEmpty());

		mockMvc.perform(get("/api/service-orders/{id}", order.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.paymentMethod").value("TRANSFERENCIA"))
				.andExpect(jsonPath("$.paymentAmount").value(150.0))
				.andExpect(jsonPath("$.paymentRecordedAt").isNotEmpty());

		mockMvc.perform(get("/api/service-orders/vehicle/{vehicleId}", vehicle.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].paymentMethod").value("TRANSFERENCIA"))
				.andExpect(jsonPath("$[0].paymentAmount").value(150.0));

		mockMvc.perform(post("/api/service-orders/{id}/simulate-payment", order.getId())
				.cookie(csrfCookie)
				.header("X-XSRF-TOKEN", csrfCookie.getValue())
				.contentType(MediaType.APPLICATION_JSON)
				.content(paymentRequest))
				.andExpect(status().isConflict());

		ServiceOrder pendingOrder = new ServiceOrder();
		pendingOrder.setEntryDate(java.time.LocalDate.now());
		pendingOrder.setPrimaryReason("Servicio aún en proceso");
		pendingOrder.setCurrentMileage(1000);
		pendingOrder.setStatus("EN PROGRESO");
		pendingOrder.setVehicle(vehicle);
		pendingOrder.setParts(java.util.List.of(part));
		pendingOrder.setLabor(java.util.List.of(labor));
		pendingOrder = serviceOrderRepository.saveAndFlush(pendingOrder);
		mockMvc.perform(post("/api/service-orders/{id}/simulate-payment", pendingOrder.getId())
				.cookie(csrfCookie)
				.header("X-XSRF-TOKEN", csrfCookie.getValue())
				.contentType(MediaType.APPLICATION_JSON)
				.content(paymentRequest))
				.andExpect(status().isConflict());
	}
}
