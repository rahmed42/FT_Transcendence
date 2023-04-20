**** BASICS ****
- Install latest version of nodeJS
https://nodejs.org/en
- Install nestJS
https://docs.nestjs.com/

**** DOCKER ****
- Start Docker
⚠️	At the scool computers, you have to run docker with this script ⚠️
https://github.com/alexandregv/42toolbox
sh init_docker.sh
- Start the Database
docker-compose up dev-db -d

**** PRISMA ***** (Query Model for the DB)
https://www.prisma.io/
- Initialisation
yarn add -D prisma
yarn add @prisma/client
npx prisma init
- Migrate models to the database
npx prisma migrate dev
(this command also run npx prisma generate, wich create typescript types for the schemas)
- Explore the database to the browser
npx prisma studio

**** INSOMNIA **** 
Intall it with the Managed Software Center
This application is used to build POST, GET... requests to the server (Postman do the same stuff)

- Manage pipes on DTO (pipes are used to transform types like string to int)
yarn add class-validator class-transformer
(allow to use decorator @IsEmail(), @IsString(), @IsNotEmpty()... in the DTO class that stores User variables)

yarn add @nestjs/config
