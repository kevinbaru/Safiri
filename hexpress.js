"use strict";

const http = require('http');
const querystring = require('querystring');
var fs = require('fs');
var path2 = require('path');
var _ = require('underscore');
var Handlebars = require('handlebars')

module.exports = function () {
  let routes = [];

  const server = http.createServer(function(req,res) {
    const splitURL = req.url.split(['?']);
    let path = splitURL[0];
    const queries = splitURL[1];

    req.query = {};
    req.params = {};

    // route/:param/asgrd/:ewaif
    //:param
    //asgrd
    //:ew
    const checkPath= function(path, route){
     console.log('ddhhdhdhdh')
     if(route.url===path){
       return true
     }

     let pm= path.split('/');
     let rt= route.url.split('/');
     rt.forEach((r,ind) => {
       if(r === pm[ind]){

       }else{
         if(r[0]!== ':'){
           return false
         }else{
           let p=r.substring(1,r.length)
           req.params[p]=pm[ind]
         }

       }
     })

     return true
   }



    if (queries){
      req.query = querystring.parse(queries)
    }


    res.send = function(sendingString) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(sendingString);
    }

    res.json = function(sendJson) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(sendJson));
    }

    res.render = function(hbsFile, data) {

      var filePath = path2.resolve('views',hbsFile);

      fs.readFile(filePath, 'utf8', function(err,resp) {
        if (err) {
          res.writeHead(500);
          res.end(`cannot read file ${filePath}`);
        } else {
          var template = Handlebars.compile(resp);
          res.writeHead(200,{'Content-Type':'text/html'});
          res.end(template(data));
        }
      })
    }


    var i = 0;
    function next() {
      while (i < routes.length) {
        var route = routes[i];
        i++;
        if (path.endsWith('/')) {
          path = path.substring(0, path.length - 1);
        }
        //getParams(path,route)

        let ckd= checkPath(path, route)


        if ((route.method !== 'USE' && route.method === req.method && ckd) ||
            (route.method === 'USE' && path.startsWith(route.url))
          ) {
          if (req.method === 'POST' || route.method === 'USE') {
            var body = '';
            req.on('readable', function() {
              var chunk = req.read();
              if (chunk){
                body += chunk
              };
            });

            req.on('end', function() {
              req.body = querystring.parse(body);
              route.cb(req, res, next);
            });
          } else {

            route.cb(req, res, next);
          }
          return;
        }
      }
      res.writeHead(404);
      res.end(`Cannot ${req.method} path ${req.url}`);
    }

    next();
  });

  return {
    get: function(url, callback) {
      let exist = false;
      routes.map(route => {
        if (route.url === url && route.method === 'GET') {
          exist = true;
        }
      });

      routes.push({ url: url, method: 'GET', cb: callback });

    },
    post: function(url, callback) {
      let exist = false;
      routes.map(route=>{
        if (routes.url === url && routes.method ==='POST') {
          exist = true;
        }
      });

        routes.push({ url: url, method: 'POST', cb: callback });

    },
    use: function(routePrefix, callback) {
      let exist=false;
      if (typeof routePrefix === 'function') {
        callback = routePrefix;
        routePrefix = '/';
      }
      routes.map(route => {
        if (routes.url === routePrefix && routes.method === 'USE') {
          exist = true;
        } else {
          exist = false;
        }
      });

        routes.push({ url: routePrefix, method: 'USE', cb: callback });

    },
    listen: function(port, callback) {
      
      server.listen(port,function() {
        if (callback) {
          callback();
        }
      });
    }
  };
};
