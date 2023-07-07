# Utilisez une image de base appropriée pour votre application frontend
FROM node

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le reste des fichiers de l'application dans le conteneur
COPY ./Frontend .

# Installer les dépendances de l'application
RUN npm install

# Exposer le port sur lequel votre application frontend écoute (le même que dans le fichier docker-compose.yml)
EXPOSE 5173

# Définir la commande pour démarrer l'application frontend
CMD ["npm", "run", "dev", "--", "--host"]
