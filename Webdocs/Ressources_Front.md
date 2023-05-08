******* Learning TypeScript *******
- Site officiel :
https://www.typescriptlang.org/docs/
Infos : https://www.typescriptlang.org/fr/docs/handbook/typescript-in-5-minutes.html
Compiler options : https://www.typescriptlang.org/docs/handbook/compiler-options.html
Set target option : https://www.typescriptlang.org/tsconfig#target

- Formation Typescript en FR : https://grafikart.fr/formations/typescript

- TypeScript REFERENCE :
https://www.typescriptlang.org/docs/handbook/utility-types.html

- NPM packages info : https://www.npmjs.com

- Bases sur Openclassroom :
https://openclassrooms.com/fr/courses/8039116-decouvrez-typescript
-> Bases JavaScript : https://openclassrooms.com/fr/courses/6175841-apprenez-a-programmer-avec-javascript

Cheetsheet : https://doabledanny.gumroad.com/l/typescript-cheat-sheet-pdf

- Utilisation :
Installation NodeJS : https://nodejs.org/en
verifier son installation : node -v
A la racine du projet : npm init -y

Install Typescript :
npm install typescript --save-dev
(--save-dev > installe en tant que devDependencies en local au projet )
Pour l'installer globallement : npm install -g typescript
tsc --init > créer un fichier tsconfig.json de base

Compiler un fichier TS : npx tsc src/my-file.ts --outDir dist
(ou directement tsc my-file.ts si en global)
npx > utilitaire NodeJS pour lancer les outils
tsc > compilateur TS
--outDir > dossier de sortie des fichiers compilés JS

definir les fichiers dans tscconfig.json :
"compilerOptions": {
	"outDir": "./dist",
	"rootDir": "./src",
	"target": "es2016",
	"noEmitOnError": true,
	"strict": true,
  },

Compiler tous les fichiers TS en mode watch : npx tsc --watch

TS error translator : https://ts-error-translator.vercel.app
TS online editor : https://www.typescriptlang.org/fr/play

- S'il n’y a pas de fichier .d.ts dans le projet de librairie JS, il faut installer une déclaration de type on peut les importer des librairies @types/... ou les créer soi-même (dans ce cas, il faut les placer dans un dossier 'types' à la racine du projet) :
npm install @types/NOM_DE_LA_LIBRAIRIE

******* Svelte *******
## Creating
npm create svelte@latest Front
cd Front

## Developing
`npm install`

#### start a development server ####
`npm run dev`

# or start the server and open the app in a new browser tab
`npm run dev -- --open`

## Building
To create a production version of your app:
`npm run build`
You can preview the production build with `npm run preview`.

- Site Officiel :
https://svelte.dev/
- Tutorial :
https://svelte.dev/tutorial/basics
- Svelte Mastery (vidéos de cours par thèmes)
https://www.youtube.com/@SvelteMastery/videos
- Svelte Tutorial de Net Ninja (cours complet) :
https://www.youtube.com/watch?v=ujbE0mzX-CU&list=PL4cUxeGkcC9hlbrVO_2QFVqVPhlZmz7tO

- Manipulate svelte component :
https://www.twilio.com/blog/svelte-stores-share-data-between-components


**** Front tips ****
Add particles
https://dev.to/tsparticles/tsparticles-easily-add-highly-customizable-particles-animations-to-your-website-3l2g

Official particles configurator
https://particles.js.org

RGB Code chart
https://www.rapidtables.com/web/color/RGB_Color.html

colyseus : https://docs.colyseus.io/

Pong Game in JS tutorial :
For beginners > https://www.youtube.com/watch?v=nl0KXCa5pJk&ab_channel=freeCodeCamp.org
Other tips : https://www.youtube.com/watch?v=AiFqApeurqI

Phaser - HTML5 Game Framework :
https://www.npmjs.com/package/phaser

