package com.autocare.crm.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        System.out.println("🔍 Incoming URI: " + path);

        // ✅ Skip authentication for /api/auth/**
        if (path.startsWith("/api/auth/") || path.startsWith("/api/public/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // ✅ No token → public or unauthenticated request
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String username;

        System.out.println("🛡️ Incoming token: " + token);

        try {
            username = jwtUtil.extractUsername(token);
            System.out.println("🛡️ Username extracted: " + username);
        } catch (Exception ex) {
            System.out.println("❌ Error parsing token: " + ex.getMessage());
            filterChain.doFilter(request, response);
            return;
        }


        // ✅ Authenticate only if no current authentication exists
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(token, userDetails)) {

                // ✅ Fetch "authorities" from claims — expects List<Map<String, String>>
                @SuppressWarnings("unchecked")
                List<Map<String, String>> rawAuthorities =
                        jwtUtil.extractAllClaims(token).get("authorities", List.class);

                System.out.println("🛡️ Raw authorities from token: " + rawAuthorities);

                if (rawAuthorities == null || rawAuthorities.isEmpty()) {
                    System.out.println("🚫 No authorities in token.");
                    filterChain.doFilter(request, response);
                    return;
                }

                // ✅ Convert JSON objects -> SimpleGrantedAuthority
                List<SimpleGrantedAuthority> authorities =
                        rawAuthorities.stream()
                                .map(entry -> new SimpleGrantedAuthority(entry.get("authority")))
                                .toList();

                System.out.println("✅ Final authorities list: " + authorities);

                // ✅ Build authentication
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                authorities
                        );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // ✅ Save into SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);

                System.out.println("🛡️ SecurityContext updated: "
                        + SecurityContextHolder.getContext().getAuthentication());
            } else {
                System.out.println("❌ Token validation failed for: " + username);
            }
        }

        filterChain.doFilter(request, response);
    }
}
