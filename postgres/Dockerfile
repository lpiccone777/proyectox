FROM postgis/postgis:15-3.3-alpine

# Install additional extensions if needed
RUN apk add --no-cache postgresql-contrib

# Copy initialization scripts
COPY ./init-scripts/ /docker-entrypoint-initdb.d/

# Set proper permissions
RUN chmod -R 755 /docker-entrypoint-initdb.d/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD pg_isready -U ${POSTGRES_USER:-postgres} || exit 1