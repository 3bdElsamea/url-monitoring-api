#Node alpine Image
FROM node:14-alpine
#Working directory
WORKDIR /app
#Copy package.json and package-lock.json
COPY package*.json ./
#Install dependencies
RUN npm install
#Copy all files
COPY . .
#Expose port 3000
EXPOSE 3000
#Run the app
CMD ["npm", "start"]
