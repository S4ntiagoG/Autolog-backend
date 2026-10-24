package com.autolog.backend.security;

import java.util.function.Supplier;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.SessionFixationProtectionStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

@Configuration
public class MechanicSecurityConfig {

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new SessionFixationProtectionStrategy();
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SecurityContextRepository securityContextRepository) throws Exception {
        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfTokenRepository.setCookieCustomizer(cookie -> cookie.sameSite("Lax"));

        http
                .securityContext(context -> context.securityContextRepository(securityContextRepository))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository)
                        .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler()))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/mechanics/auth/csrf", "/api/mechanics/auth/login").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/workshop-settings")
                        .hasRole("ADMIN")
                        .requestMatchers("/api/mechanics/auth/me", "/api/mechanics/auth/logout",
                                "/api/mechanics/activity")
                        .hasAnyRole("MECHANIC", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/mechanics", "/api/mechanics/*")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/mechanics")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/mechanics/*")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/mechanics/*")
                        .hasRole("ADMIN")
                        .requestMatchers("/api/mechanics/**").hasRole("MECHANIC")
                        .requestMatchers(HttpMethod.GET,
                                "/api/service-orders/*",
                                "/api/service-orders/vehicle/**",
                                "/api/service-orders/*/evidence/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/service-orders/*/simulate-payment")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/clients/**", "/api/vehicles/**", "/api/service-orders")
                        .hasAnyRole("MECHANIC", "ADMIN")
                        .requestMatchers(HttpMethod.POST,
                                "/api/clients", "/api/vehicles", "/api/service-orders",
                                "/api/service-orders/*/evidence")
                        .hasAnyRole("MECHANIC", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/clients/**", "/api/vehicles/**", "/api/service-orders/**")
                        .hasAnyRole("MECHANIC", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/clients/**", "/api/vehicles/**", "/api/service-orders/**")
                        .hasAnyRole("MECHANIC", "ADMIN")
                        .anyRequest().permitAll())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, error) -> response.sendError(401)))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);

        return http.build();
    }

    private static final class SpaCsrfTokenRequestHandler implements CsrfTokenRequestHandler {
        private final CsrfTokenRequestHandler plain = new CsrfTokenRequestAttributeHandler();
        private final CsrfTokenRequestHandler xor = new XorCsrfTokenRequestAttributeHandler();

        @Override
        public void handle(
                HttpServletRequest request,
                HttpServletResponse response,
                Supplier<CsrfToken> deferredCsrfToken) {
            xor.handle(request, response, deferredCsrfToken);
        }

        @Override
        public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
            String headerValue = request.getHeader(csrfToken.getHeaderName());
            return headerValue == null
                    ? xor.resolveCsrfTokenValue(request, csrfToken)
                    : plain.resolveCsrfTokenValue(request, csrfToken);
        }
    }
}
