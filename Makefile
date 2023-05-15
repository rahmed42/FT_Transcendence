# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: rahmed <rahmed@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/05/09 12:57:06 by rahmed            #+#    #+#              #
#    Updated: 2023/05/15 21:50:47 by rahmed           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

name = FT_Transcendance

# data = ~/data
# db = ~/data/postgreSQL

front :
	@echo "${TXT_YELLOW}"
	@echo "~~~~~~~~~~ FRONTEND ~~~~~~~~~~"
	@echo "${TXT_GREEN}"
	@printf "Launching ${name} Front...\n"
	@echo "${FANCY_RESET}"
	cd Frontend && npm install && npm run dev -- --open
#	make fgame

fgame :
	@echo "${TXT_YELLOW}"
	@echo "~~~~~~~~~~ GAME FRONTEND ~~~~~~~~~~"
	@echo "${TXT_GREEN}"
	@printf "Launching ${name} Game front...\n"
	@echo "${FANCY_RESET}"
	cd Frontend && npm run startgame

back :
	@echo "${TXT_YELLOW}"
	@echo "~~~~~~~~~~ BACKEND ~~~~~~~~~~"
	@echo "${TXT_GREEN}"
	@printf "Launching ${name} BACKEND...\n"
	@echo "${FANCY_RESET}"
	@make up
	cd Backend && npm install && npx prisma generate && npm run start:dev
#	make bgame

bgame :
	@echo "${TXT_YELLOW}"
	@echo "~~~~~~~~~~ GAME BACKEND ~~~~~~~~~~"
	@echo "${TXT_GREEN}"
	@printf "Launching ${name} Game back...\n"
	@echo "${FANCY_RESET}"
	cd Backend && npm run startgame
	@open http://localhost:2567/colyseus/

all	:
#	docker-compose up dev-db -d
	@make back
	@make front
	@make bgame
	@make fgame

# all	: | $(data) $(db)
# 	@make up

# $(data)	:
# 	@echo "Folder $(data) does not exist, creating..."
# 	mkdir -p $@

# $(db)	:
# 	@echo "Folder $(db) does not exist, creating..."
# 	mkdir -p $@

clean	:	down
	@printf "Removing unused ${name} images...\n"
	@docker system prune -a
#	@sudo rm -rf $(db)

fclean	:
	@printf "Deep clean of docker\n"
	@make stop
	@docker system prune --all --force --volumes
	@docker network prune --force
	@docker volume prune --force
#	@sudo rm -rf $(db)

# re	: | $(data) $(db)
# 	@printf "docker-compose up -d --build : Building ${name}'s Configuration...\n"
# 	@docker-compose -f backend/docker-compose.yml --env-file backend/.env up -d --build
# 	@make list

# build	:	re


up	:
	@printf "docker-compose up -d : Starting project ${name}...\n"
	@docker-compose -f backend/docker-compose.yml --env-file backend/.env up -d
	@make list

down	:
	@printf "docker-compose down : Shutdown project ${name}...\n"
	@docker-compose -f backend/docker-compose.yml --env-file backend/.env down

list 	:
	@printf "Listing containers :\n"
	docker-compose -f backend/docker-compose.yml --env-file backend/.env ps

logs	:
	@printf "Checking LOGs :\n"
	docker-compose -f backend/docker-compose.yml --env-file backend/.env logs

pause	:
	docker-compose -f backend/docker-compose.yml --env-file backend/.env pause

unpause	:
	docker-compose -f backend/docker-compose.yml --env-file backend/.env unpause

stop	:
	docker-compose -f backend/docker-compose.yml --env-file backend/.env stop

start	:
	docker-compose -f backend/docker-compose.yml --env-file backend/.env start

#UTILS	:
#show databases;
#show grants for 'root'@'localhost';
#show grants for 'rahmed'@'%';
#SELECT User FROM mysql.user;

db	:
	cd backend && npx prisma studio
# 	docker exec -it postgres mysql -u root -p

# dbuser	:
# 	docker exec -it postgres mysql -u rahmed -p

# dblist	:
# 	docker exec -it postgres ls

.PHONY	: front back dbroot dbuser dblist all clean fclean re build up down list logs pause unpause stop start

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
