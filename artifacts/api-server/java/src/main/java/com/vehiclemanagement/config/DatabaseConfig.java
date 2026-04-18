package com.vehiclemanagement.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Bean
    public DataSource dataSource() {
        if (databaseUrl == null || databaseUrl.isBlank()) {
            throw new IllegalStateException("DATABASE_URL environment variable is not set");
        }
        try {
            String normalized = databaseUrl
                .replace("postgresql://", "http://")
                .replace("postgres://",   "http://");
            URI uri = new URI(normalized);

            String host  = uri.getHost();
            int    port  = uri.getPort() == -1 ? 5432 : uri.getPort();
            String db    = uri.getPath();
            String query = uri.getRawQuery() != null ? "?" + uri.getRawQuery() : "";

            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl("jdbc:postgresql://" + host + ":" + port + db + query);
            ds.setDriverClassName("org.postgresql.Driver");

            String info = uri.getUserInfo();
            if (info != null) {
                String[] parts = info.split(":", 2);
                ds.setUsername(parts[0]);
                if (parts.length == 2) ds.setPassword(parts[1]);
            }
            ds.setMaximumPoolSize(5);
            return ds;
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse DATABASE_URL: " + e.getMessage(), e);
        }
    }
}
