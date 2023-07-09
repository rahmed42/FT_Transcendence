# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: rahmed <rahmed@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/05/09 12:57:06 by rahmed            #+#    #+#              #
#    Updated: 2023/07/09 16:45:31 by rahmed           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

name = FT_Transcendance

db = ./db-data

# $(db)	:
# 	@echo "Folder $(db) does not exist, creating..."
# 	mkdir -p $@

#################### PROJECT Makers ####################
all	: project

clean	:	down
	@rm -rf $(db)
	@printf "Removing unused ${name} images...\n"
	@docker system prune -a
	@rm -rf ./backend/dist
	@rm -rf ./Frontend/dist ./Frontend/.parcel-cache

fclean	:
	@rm -rf ./backend/dist ./backend/node_modules
	@rm -rf ./Frontend/dist ./Frontend/node_modules ./Frontend/.parcel-cache
	@rm -rf $(db)
	@printf "Deep clean of docker\n"
	@make stop
	@docker system prune --all --force --volumes
	@docker network prune --force
	@docker volume prune --force

re	:
	@printf "Deep clean of docker\n"
	@make stop
	@printf "docker-compose up -d --build : Building ${name}'s Configuration...\n"
	@make project

#################### PROJECT LAUNCH ####################
project : check_docker_desktop
	@echo "${TXT_YELLOW}"
	@echo "~~~~~~~~~~ STARTING PROJECT ~~~~~~~~~~"
	@echo "${TXT_GREEN}"
	@printf "docker-compose up --build : Starting $(USER) project ${name}...\n"
	@echo "${FANCY_RESET}"
	@docker-compose up --build
	@make list

#################### PROJECT Updater ####################
update :
	@echo "${TXT_YELLOW}"
	@echo "~~~~~~~~~~ UPDATING ~~~~~~~~~~"
	@echo "${TXT_GREEN}"
	@printf "Updating Frontend npm ...\n"
	@echo "${FANCY_RESET}"
	cd Frontend && npm update && npm audit fix
	@echo "${TXT_GREEN}"
	@printf "Updating Backend npm ...\n"
	@echo "${FANCY_RESET}"
	cd backend && npm update && npm audit fix

######################## DOCKER COMPOSE ########################
check_docker_desktop:
	@docker info > /dev/null 2>&1 || (echo "Docker Desktop is not running. Please start Docker Desktop." && ./init_docker.sh && exit 1)

up	: check_docker_desktop
	@printf "docker-compose up -d : Starting $(USER) project ${name}...\n"
	@docker-compose up -d
	@make list

down	:
	@printf "docker-compose down : Shutdown project ${name}...\n"
	@docker-compose down

list 	:
	@printf "Listing containers :\n"
	docker-compose ps

logs	:
	@printf "Checking LOGs :\n"
	docker-compose logs

pause	:
	docker-compose pause

unpause	:
	docker-compose unpause

stop	:
	docker-compose stop

start	:
	docker-compose start

######################## DOCKER COMPOSE / local tests ########################
back :
	@echo "${TXT_YELLOW}"
	@echo "~~~~~~~~~~ BACKEND ~~~~~~~~~~"
	@echo "${TXT_GREEN}"
	@printf "Launching ${name} BACKEND...\n"
	@echo "${FANCY_RESET}"
	@make up
ifeq ($(USER),bryan) #FOR TIM
	cd backend && npm install && sudo npx prisma generate && npm run start:dev
else
	cd backend && npm install && npx prisma generate && npm run start:dev
endif

front :
	@echo "${TXT_YELLOW}"
	@echo "~~~~~~~~~~ FRONTEND ~~~~~~~~~~"
	@echo "${TXT_GREEN}"
	@printf "Launching ${name} Front...\n"
	@echo "${FANCY_RESET}"
	cd Frontend && npm install && npm run dev -- --open  --host

bgame :
	@echo "${TXT_YELLOW}"
	@echo "~~~~~~~~~~ GAME BACKEND ~~~~~~~~~~"
	@echo "${TXT_GREEN}"
	@printf "Launching ${name} Game back...\n"
	@echo "${FANCY_RESET}"
	cd backend && npm run startgame

fgame :
	@echo "${TXT_YELLOW}"
	@echo "~~~~~~~~~~ GAME FRONTEND ~~~~~~~~~~"
	@echo "${TXT_GREEN}"
	@printf "Launching ${name} Game front...\n"
	@echo "${FANCY_RESET}"
	cd Frontend && npm run startgame

db	:
	cd backend && npx prisma migrate dev && npx prisma studio

# check_docker_desktop:
# 	@docker info > /dev/null 2>&1 || (echo "Docker Desktop is not running. Please start Docker Desktop." && exit 1)

# up	: check_docker_desktop
# 	@printf "docker-compose up -d : Starting $(USER) project ${name}...\n"
# 	@docker-compose -f backend/docker-compose.yml --env-file backend/.env up -d
# 	@make list

# down	:
# 	@printf "docker-compose down : Shutdown project ${name}...\n"
# 	@docker-compose -f backend/docker-compose.yml --env-file backend/.env down

# list 	:
# 	@printf "Listing containers :\n"
# 	docker-compose -f backend/docker-compose.yml --env-file backend/.env ps

# logs	:
# 	@printf "Checking LOGs :\n"
# 	docker-compose -f backend/docker-compose.yml --env-file backend/.env logs

# pause	:
# 	docker-compose -f backend/docker-compose.yml --env-file backend/.env pause

# unpause	:
# 	docker-compose -f backend/docker-compose.yml --env-file backend/.env unpause

# stop	:
# 	docker-compose -f backend/docker-compose.yml --env-file backend/.env stop

# start	:
# 	docker-compose -f backend/docker-compose.yml --env-file backend/.env start

################################################################
#UTILS	:
#show databases;
#show grants for 'root'@'localhost';
#show grants for 'rahmed'@'%';
#SELECT User FROM db.user;

# 	docker exec -it postgres db -u root -p
# 	docker exec -it postgres db -u rahmed -p
# 	docker exec -it postgres ls
################################################################
# Set COLORS
TXT_RED		=	\033[1;31m
TXT_GREEN	=	\033[1;32m
TXT_YELLOW	=	\033[1;33m
TXT_BLUE	=	\033[1;34m
TXT_MAGENTA	=	\033[1;35m
TXT_CYAN	=	\033[1;36m
BCK_RED		=	\033[0;41m
BCK_GREEN	=	\033[0;42m
BCK_YELLOW	=	\033[0;43m
BCK_BLUE	=	\033[0;44m
BCK_MAGENTA	=	\033[0;45m
BCK_CYAN	=	\033[0;46m
FANCY_RESET	=	\033[0m

###########################################
.PHONY	:  all clean fclean re