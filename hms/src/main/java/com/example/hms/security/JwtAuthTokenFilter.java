package com.example.hms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.AntPathMatcher; // Required for path matching
import java.io.IOException;
import java.util.Arrays; // Required for Arrays.stream

@Component
public class JwtAuthTokenFilter extends OncePerRequestFilter {

    @Autowired private JwtUtils jwtUtils;
    @Autowired private UserDetailsServiceImpl userDetailsService;

    // --- CRITICAL FIX: Define public paths to exclude from filtering ---
    private static final String[] EXCLUDE_PATHS = {
        "/api/auth/**" // Excludes /api/auth/login, /api/auth/register, /api/auth/password/**
    };

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    /**
     * Determines if the filter should skip execution for the current request path.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // Skips the filter if the request path matches any path in the EXCLUDE_PATHS array.
        return Arrays.stream(EXCLUDE_PATHS)
                     .anyMatch(path -> pathMatcher.match(path, request.getServletPath()));
    }
    // --- END CRITICAL FIX ---


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // doFilterInternal logic will only run if shouldNotFilter() returns FALSE (i.e., token is expected)
        try {
            String jwt = parseJwt(request); 
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // Removes "Bearer "
        }
        return null;
    }
}
