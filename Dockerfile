# Build stage
FROM node:20-alpine as build
WORKDIR /app

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the application
RUN ng build --configuration production

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist/*/browser /usr/share/nginx/html

# Configure nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]