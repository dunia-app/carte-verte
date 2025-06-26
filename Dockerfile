# Use an official Node runtime as a parent image
FROM node:22

# Set the working directory
WORKDIR /app

# Bundle app source
COPY . .

# Install dependencies
RUN yarn install

# Build the application
RUN yarn build

# Ensure permissions are set correctly for all scripts
RUN chmod 755 /app/dist/src/main.js
RUN chmod -R +x /app/scripts

# Set the entrypoint to the script
ENTRYPOINT ["/app/scripts/entrypoint.sh"]

# Expose the port the app runs on
EXPOSE 5001

# Run the Node.js application
CMD ["node", "dist/src/main.js"]
