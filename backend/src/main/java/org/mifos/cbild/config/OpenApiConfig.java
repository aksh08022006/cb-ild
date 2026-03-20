package org.mifos.cbild.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public io.swagger.v3.oas.models.OpenAPI openAPI() {
        return new io.swagger.v3.oas.models.OpenAPI()
            .info(new io.swagger.v3.oas.models.info.Info()
                .title("Mifos CB-ILD API")
                .description("Credit Bureau Information Lifecycle Dashboard — GSoC 2026")
                .version("1.0.0")
                .contact(new io.swagger.v3.oas.models.info.Contact()
                    .name("aksh08022006")
                    .url("https://github.com/aksh08022006")))
            .addSecurityItem(new io.swagger.v3.oas.models.security.SecurityRequirement().addList("bearerAuth"))
            .components(new io.swagger.v3.oas.models.Components()
                .addSecuritySchemes("bearerAuth",
                    new io.swagger.v3.oas.models.security.SecurityScheme()
                        .type(io.swagger.v3.oas.models.security.SecurityScheme.Type.HTTP)
                        .scheme("bearer").bearerFormat("JWT")));
    }
}
