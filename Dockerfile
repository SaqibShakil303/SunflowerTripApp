FROM node:18

WORKDIR /app

# Copy root package.json and install dependencies
COPY package.json .
RUN npm install

# Copy and build client
COPY client ./client
RUN cd client && npm install && npm run build

# Copy and install server
COPY server ./server
RUN cd server && npm install

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]