# Build stage
FROM node:22-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json from my-app directory
COPY my-app/package*.json ./

# Install dependencies
RUN npm install

# Copy source code from my-app directory
COPY my-app/ .

# Build arguments for environment variables
ARG REACT_APP_API_URL=http://localhost:5000/api
ARG REACT_APP_PAYPAL_CLIENT_ID

# Set environment variables for build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_PAYPAL_CLIENT_ID=$REACT_APP_PAYPAL_CLIENT_ID

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Copy built application from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
