FROM node:20

WORKDIR /usr/src/app

# Kopioi package.json ja + package-lock.json ensin (nopeampi cache npm installille)
COPY package*.json ./

# Aseta npm registry ja install riippuvuudet
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install

# Kopioidaan sovelluksen lähdekoodi
COPY . .

CMD ["npm", "start"]
