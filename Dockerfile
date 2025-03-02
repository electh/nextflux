# Stage 1: Build the React application
# Specify the version to ensure consistent builds
FROM node:22-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies using npm
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the project
RUN npm run build

# Stage 2: Run the server using Caddy
# Specify the version for consistency
FROM caddy:2-alpine

# Install additional dependencies
RUN apk add --no-cache jq

# Copy built assets from the builder stage
COPY --from=build /app/dist /srv

# Caddy will pick up the Caddyfile automatically
COPY Caddyfile /etc/caddy/Caddyfile

# Custom entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Declare additional environment variables
ENV NEXTFLUX_DEFAULT_SERVER_URL=''
ENV NEXTFLUX_SINGLE_SERVER_MODE='false'

# Expose the port Caddy listens on
EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]