FROM node:12.15.0 as builder 
WORKDIR /usr/src/build/
COPY ./build/ ./build/
RUN mkdir ./client/
RUN mkdir ./client/css
RUN mkdir ./client/js
WORKDIR /usr/src/build/build/
RUN npm i
RUN node client.js --prod

FROM nginx:alpine
COPY --from=0 /usr/src/build/client/ /usr/share/nginx/html/

