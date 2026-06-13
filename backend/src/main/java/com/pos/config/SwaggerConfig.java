package com.pos.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger / OpenAPI 3.0 configuration.
 * Access UI at: http://localhost:8080/swagger-ui/index.html
 */
@Configuration
public class SwaggerConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI posOpenAPI() {
        return new OpenAPI()
                // API Info
                .info(new Info()
                        .title("POS & Inventory Management API")
                        .description(
                                "Production-ready REST API for a Retail Point of Sale " +
                                "and Inventory Management System. " +
                                "Authenticate via POST /api/auth/login and use the returned JWT token " +
                                "in the 'Authorize' button above."
                        )
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("POS Dev Team")
                                .email("dev@pos-system.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT"))
                )
                // Register JWT Bearer auth scheme
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME,
                                new SecurityScheme()
                                        .name(BEARER_SCHEME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token (without 'Bearer' prefix)")
                        )
                )
                // Apply JWT auth globally to all operations
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME));
    }
}
