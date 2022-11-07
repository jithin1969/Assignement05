/*********************************************************************************
 *  WEB322 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name:JithinBiju Student ID:153532213 Date: 11-NOV-2022
 *
 *  Online (Cyclic) Link: 
 *
 ********************************************************************************/
 var express = require("express");
 var app = express();
 var path = require("path");
 const multer = require("multer");
 const fileUpload = multer();
 const cloudinary = require('cloudinary').v2
 const streamifier = require('streamifier')
 const exphbs = require('express-handlebars');
 const stripJs = require('strip-js');

 cloudinary.config({
  cloud_name: 'dexdo1qrk',
  api_key: '421526278881353 ',
  api_secret: 'gFHkoiGEm8gZ5kv0R9YACWalRYs',
      secure: true
  });

  app.engine('.hbs', exphbs.engine({ 
    extname: ".hbs", 
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>'; },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }           
    } 
}));

app.use(function(req,res,next) {
  let route = req.baseUrl+req.path;
  app.locals.activeRoute = (route == "/") ? "/":route.replace(/\/$/,"");
  next();
});

app.set('view engine', '.hbs');

  //adding path tp product-service.js module to interact with it
 var data = require("./product-service");
 
 var HTTP_PORT = process.env.PORT || 8080;

 function onHttpStart() {
   console.log("Express http server listening on: " + HTTP_PORT);
   return new Promise(function (res, req) {
     data
       .initialize()
       .then(function (data) {
         console.log(data);
       })
       .catch(function (err) {
         console.log(err);
       });
   });
 }
 app.use(express.static("public"));
 
 //setting up a defualt route for local host
 
 //home
app.get('/', (req, res) => {
  res.render(path.join(__dirname + "/views/home.hbs"));
});

//otherwise /home would return an error
app.get('/home', (req, res) => {
  res.render(path.join(__dirname + "/views/home.hbs"));
});

//route to products
 app.get("/products", function (req, res) {
   data
     .getPublishedProducts()
     .then(function (data) {
       res.json(data);
     })
     .catch(function (err) {
       res.json({ message: err });
     });
    
});
 
//route to demos
 app.get("/demos", (req, res) => {
  if (req.query.category) {
      data.getProductsByCategory(req.query.category).then((data) => {
        res.render("demos", {demos: data});
      }).catch((err) => {
        res.render("demos", {message: "no results"});
      })
  }
  else if (req.query.minDateStr) {
      data.getProductsByMinDate(req.query.minDateStr).then((data) => {
        res.render("demos", {demos: data});
      }).catch((err) => {
        res.render("demos", {message: "no results"});;
      })
  }
  
  else {
      data.getAllProducts().then((data) => {
        res.render("demos", {demos: data});
      }).catch((err) => {
        res.render("demos", {message: "no results"});
      })
  }
});

//route to categories
 app.get("/categories", function (req, res) {
   data
     .getCategories()
     .then(function (data) {
      res.render("categories", {categories: data});
     })
     .catch(function (err) {
      res.render("categories", {message: "no results"});
     });
 });

//route to Add Product
 app.get('/product/:value', (req,res) => {
  data.getProductById(req.params.value).then((data) => {
      res.json({data});
  }).catch((err) => {
      res.json({message: err});
  })
 });

 app.get('/products/add', (req, res) => {
  res.render(path.join(__dirname + "/views/addproducts.hbs"));
});
app.post('/upload', fileUpload.single('image'), function (req, res, next) {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
    }

    upload(req);
});

//if no route found show Page Not Found
 app.use(function (req, res) {
   res.status(404).sendFile(path.join(__dirname, "/views/error.html"));
 });
 
 app.listen(HTTP_PORT, onHttpStart)