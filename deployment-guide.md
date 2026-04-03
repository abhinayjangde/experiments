# Ultimate Guide: Deploying a Next.js App to AWS EC2 using Docker and GitHub Actions

This guide explains how to deploy a Next.js application to an AWS EC2 instance. It mirrors a professional CI/CD pipeline using **Docker Compose** and **GitHub Actions**, with **Nginx** acting as a reverse proxy for the application.

## 🏗 Architecture

1. **GitHub Actions**: Builds and deploys the app automatically on `push` to the `main` branch.
2. **EC2 Instance**: Hosts the application using Docker.
3. **Docker Compose**: Manages the Next.js container (and optionally databases).
4. **Nginx**: Listens to public traffic (Ports 80/443) and routes it to the Docker container (Port 3000).

---

## Step 1: Dockerize Your Next.js Application

In the root of your Next.js project, create a `Dockerfile`. The recommended approach is a multi-stage build to keep the image size small.

### `Dockerfile`
```dockerfile
FROM node:18-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Omit --frozen-lockfile if using npm
RUN npm ci

COPY . .
# Next.js telemetry is disabled
ENV NEXT_TELEMETRY_DISABLED 1

# Build the app
RUN npm run build

# Step 2. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
```

> **Note:** To use `standalone` output, make sure `output: 'standalone'` is in your `next.config.js`.

### `docker-compose.yml`
```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - DATABASE_URL=${DATABASE_URL}
    restart: always
```

---

## Step 2: Prepare the EC2 Instance

1. SSH into your EC2 instance.
2. Install Docker and Docker Compose.
3. Add the `ubuntu` user to the `docker` group so GitHub Actions doesn't require `sudo`:
   ```bash
   sudo usermod -aG docker ubuntu
   ```
   *(Log out and log back in for this to take effect).*
4. Clone your repository for the first time:
   ```bash
   cd /home/ubuntu
   git clone https://github.com/your-username/your-repo.git
   ```

---

## Step 3: Setup GitHub Secrets

Go to your repository on GitHub: **Settings -> Secrets and Variables -> Actions** and add the following:

- `EC2_HOST`: The public IP or domain of your EC2 instance.
- `EC2_USER`: Usually `ubuntu` or `ec2-user`.
- `EC2_SSH_KEY`: Your `.pem` file contents used to connect to the EC2.
- `NEXT_PUBLIC_API_URL`: Any environment variable your app needs.
- `DATABASE_URL`: Your database connection string.

---

## Step 4: GitHub Actions CI/CD Pipeline

In your repository, create the deployment workflow file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy Next.js to EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2 via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/your-repo

            # Securely create the .env file from GitHub Secrets
            cat > .env << EOF
            NEXT_PUBLIC_API_URL=${{ secrets.NEXT_PUBLIC_API_URL }}
            DATABASE_URL=${{ secrets.DATABASE_URL }}
            EOF
            
            # Pull latest changes from the main branch
            git pull origin main
            
            # Rebuild and restart the Docker container
            docker compose down
            docker compose up -d --build
            
            # Clean up old/dangling Docker images to save disk space
            docker image prune -f
```

---

## Step 5: Setup Nginx Reverse Proxy

Nginx acts as a gatekeeper, listening on port 80 and forwarding traffic to your Docker container running on port 3000.

1. Install Nginx:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```
2. Create a new site config:
   ```bash
   sudo nano /etc/nginx/sites-available/next-app
   ```
3. Add the following configuration (replace `yourdomain.com`):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
4. Enable the configuration and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/next-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## Step 6: Secure with SSL / HTTPS (Let's Encrypt)

Once your DNS points correctly to the EC2's IP and HTTP works:

1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```
2. Obtain and configure the SSL certificate automatically:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
   *Follow the prompts, and Certbot will automatically redirect HTTP traffic to HTTPS.*

## You're done! 🎉
Now every time you push to the `main` branch, your Next.js application will be automatically built and securely deployed to your EC2 instance!