import express from "express";
import http from "http";
import { getNftMetadata } from "./getNftMetadata";

export const runServer = (port: number) => {
  const app = express();

  app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    //Trim and redirect multiple slashes in URL
    if(req.url.match(/[/]{2,}/g)) {
      req.url = req.url.replace(/[/]+/g, '/');
      res.redirect(req.url);
      return;
    } 

    if (req.method === 'OPTIONS') {
      res.send(200);
    } else {
      console.log("Request: " + req.method + " " + req.url);
      next();
    }
  });

  app.get('/api/nft/:id', async (req, res) => {
    const nftId = req.params.id;

    res.json(getNftMetadata(nftId));
  });

  app.get("/", async (req, res) => {
    res.send("Hello world!");
  });

  const server = http.createServer({}, app);
  
  server.listen(port, function(){
    console.log(`HTTP server started at http://localhost:${port}` );
  });
};