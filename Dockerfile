#Fetching the latest node image on alpine linux
FROM node:alpine AS builder

#DEclering env
ENV NODE_ENV production

#Working directory
WORKDIR /app

#Dependencies
COPY ./package.json ./
RUN npm install

#Copying files from project
COPY . .

#Building process
RUN npm run build -s

#Fetching nginx image
FROM nginx

#Copying builder project to nginx
COPY --from=builder /app/build /usr/share/nginx/html

#Copying nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf