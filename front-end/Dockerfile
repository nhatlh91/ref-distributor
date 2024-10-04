#FROM node:12.11.1-alpine as build
#WORKDIR /app
#
#RUN npm install -g @angular/cli@9.0.7
#
#COPY ./package.json .
#RUN npm install
#COPY . .
#RUN ng build
#
#FROM nginx as runtime
#COPY --from=build /app/dist/project /usr/share/nginx/html


# use the latest version of the official nginx image as the base image
FROM nginx:latest
# copy the custom nginx configuration file to the container in the
# default location
COPY nginx.conf /etc/nginx/nginx.conf
# copy the built Angular app files to the default nginx html directory
COPY /dist/project-beta-angular/ /usr/share/nginx/html

# the paths are relative from the Docker file
