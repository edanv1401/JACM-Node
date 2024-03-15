FROM node:latest

WORKDIR /usr/src/backend

COPY package*.json ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt install libgtk-3-0

RUN npm i


RUN npm ci --only=production

COPY . .

RUN cd /usr/src/backend/node_modules/html-pdf-node/node_modules/puppeteer && npm run install

CMD ["npm", "start", "google-chrome-stable"]



