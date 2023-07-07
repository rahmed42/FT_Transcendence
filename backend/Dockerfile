# Utilisez une image de base appropriée pour votre application backend
FROM node

# Définir le répertoire de travail dans le conteneur
WORKDIR /app


# Copier le reste des fichiers de l'application dans le conteneur
COPY ./backend .

RUN npm install && npm update
# Exposer le port sur lequel votre application backend écoute
EXPOSE 3333

RUN npx prisma generate
# Définir la commande pour démarrer l'application backend
ENTRYPOINT ["/bin/bash", "-c", "npx prisma migrate deploy && npm run start:dev"]



