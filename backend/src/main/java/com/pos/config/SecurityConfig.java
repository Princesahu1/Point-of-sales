package com.pos.config;

import com.pos.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/auth/forgot-password",
                                 "/api/auth/verify-otp",
                                 "/api/auth/reset-password").permitAll()

                // Swagger / OpenAPI UI — always public
                .requestMatchers(
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/v3/api-docs.yaml"
                ).permitAll()

                // CASHIER: can create sales
                .requestMatchers(HttpMethod.POST, "/api/sales", "/api/sales/**").hasAnyRole("CASHIER", "STORE_MANAGER", "ADMIN")

                // CASHIER: read-only inventory access (for POS stock checking)
                .requestMatchers(HttpMethod.GET, "/api/inventory", "/api/inventory/**").hasAnyRole("CASHIER", "STORE_MANAGER", "INVENTORY_CLERK", "ADMIN")
                // STORE_MANAGER & INVENTORY_CLERK: manage inventory (write)
                .requestMatchers(HttpMethod.PUT, "/api/inventory", "/api/inventory/**").hasAnyRole("STORE_MANAGER", "INVENTORY_CLERK", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/inventory", "/api/inventory/**").hasAnyRole("STORE_MANAGER", "INVENTORY_CLERK", "ADMIN")

                // BUSINESS_ANALYST: reports only
                .requestMatchers("/api/reports", "/api/reports/**").hasAnyRole("BUSINESS_ANALYST", "STORE_MANAGER", "ADMIN")

                // Product management
                .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").hasAnyRole("CASHIER", "STORE_MANAGER", "INVENTORY_CLERK", "BUSINESS_ANALYST", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/products", "/api/products/**").hasAnyRole("STORE_MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products", "/api/products/**").hasAnyRole("STORE_MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products", "/api/products/**").hasAnyRole("ADMIN")

                // Sale queries — CASHIER can read their own sales history (Bills page)
                .requestMatchers(HttpMethod.GET, "/api/sales", "/api/sales/**").hasAnyRole("CASHIER", "STORE_MANAGER", "BUSINESS_ANALYST", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/sales/*/refund").hasAnyRole("STORE_MANAGER", "ADMIN")

                // Admin has full access
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
