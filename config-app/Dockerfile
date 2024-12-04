#############################################
##       Get dependencies and build        ##
#############################################
FROM node:22-slim AS build

RUN corepack enable

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm run build

#############################################
##                Serve App                ##
#############################################
FROM nginx:1.26-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]