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
        "/api/auth/**" // Excludes login, register, and password reset endpoints
    };

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    /**
     * Determines if the filter should skip execution for the current request path.
     * This prevents the filter from blocking the initial login request.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // Skips the filter if the request path matches the exclusion list.
        return Arrays.stream(EXCLUDE_PATHS)
                     .anyMatch(path -> pathMatcher.match(path, request.getServletPath()));
    }
    // --- END CRITICAL FIX ---


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // This code only runs if shouldNotFilter() was FALSE (meaning a JWT is expected)
        try {
            String jwt = parseJwt(request); 
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                // Create authenticated token object
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                // Set the security context, allowing access to protected resources
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // FIX: Pass the exception object 'e' correctly to the logger
            logger.error("Error setting user authentication:", e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // Removes "Bearer " prefix
        }
        return null;
    }
}
