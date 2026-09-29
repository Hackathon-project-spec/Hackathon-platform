package com.raptors.gateway.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * Reads Keycloak's realm_access.roles claim and turns each role into a
 * Spring Security authority (ROLE_PARTICIPANT, ROLE_JUDGE, ROLE_ORGANIZER, ROLE_ADMIN).
 *
 * This is a convenience for gateway-level route filtering only. Each downstream
 * service independently re-validates the JWT and re-derives roles — the gateway
 * is not the sole point of authorization enforcement (see ARCHITECTURE.md).
 */
public class KeycloakRoleConverter implements Converter<Jwt, reactor.core.publisher.Mono<org.springframework.security.authentication.AbstractAuthenticationToken>> {

    private final JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public Mono<AbstractAuthenticationToken> convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = new ArrayList<>(defaultConverter.convert(jwt));

        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.get("roles") instanceof List<?> roles) {
            for (Object role : roles) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toString().toUpperCase()));
            }
        }

        return Mono.just(new org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken(jwt, authorities));
    }
}
