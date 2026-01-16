# Base image for building the application
FROM node:20-slim AS build

WORKDIR /app/medusa

# Set backend URL and add it to environment variables
ARG MEDUSA_BACKEND_URL=http://localhost:9000
ENV MEDUSA_BACKEND_URL=$MEDUSA_BACKEND_URL

# Copy necessary files for dependency installation
COPY package.json ./
COPY yarn.lock ./

# Install dependencies required for Yarn
RUN apt-get update && apt-get install -y curl \
    && curl -o- -L https://yarnpkg.com/install.sh | bash \
    && apt-get clean

ENV PATH="/root/.yarn/bin:/root/.config/yarn/global/node_modules/.bin:${PATH}"

# Install project dependencies
RUN yarn install --frozen-lockfile
# yarn 3.2.1 use --immutable flag instead of --frozen-lockfile 

# Install Medusa CLI globally
RUN yarn global add @medusajs/cli@rc

# Copy all project files
COPY . .

# Build the project
RUN yarn build

# Base image for running the application
FROM node:20-slim AS run

WORKDIR /app/medusa

# Copy built files from the build stage
COPY --from=build /app/medusa/.medusa/server .
COPY ./src/assets ./src/assets
COPY tsconfig.json ./

# Install dependencies required for Yarn
RUN apt-get update && apt-get install -y curl \
    && curl -o- -L https://yarnpkg.com/install.sh | bash \
    && apt-get clean

ENV PATH="/root/.yarn/bin:/root/.config/yarn/global/node_modules/.bin:${PATH}"

# Install production dependencies
RUN yarn install --frozen-lockfile --production

# Ensure proper permissions for the application folder
RUN chown -R 1000:3000 /app/medusa

# Set user to a non-root user
USER 1000:3000

# Start the application
CMD ["sh", "-c", "yarn migrations && yarn start"]