// src/main/java/com/hms/hms_project/security/UserDetailsImpl.java
package com.example.hms.security;

import com.example.hms.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

public class UserDetailsImpl implements UserDetails {
    private Long id;
    private String username;
    private String password;
    private GrantedAuthority authority;

    private UserDetailsImpl(Long id, String username, String password, GrantedAuthority authority) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.authority = authority;
    }

    public static UserDetailsImpl build(User user) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(user.getRole().name());
        return new UserDetailsImpl(user.getId(), user.getUsername(), user.getPassword(), authority);
    }
    
    // Custom Getters for access in AuthController
    public Long getId() { return id; }
    public String getRole() { return authority.getAuthority(); }

    // Required UserDetails methods (Getters are the most important for now)
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(authority); }
    @Override public String getPassword() { return password; }
    @Override public String getUsername() { return username; }
    // Omitted: isAccountNonExpired, isAccountNonLocked, etc.
}
