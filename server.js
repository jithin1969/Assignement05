/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name:JithinBiju Student ID:153532213 Date: 16 october,2022
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

 cloudinary.config({
  cloud_name: 'dexdo1qrk',
  api_key: '421526278881353 ',
  api_secret: 'gFHkoiGEm8gZ5kv0R9YACWalRYs',
      secure: true
  });

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
 
 app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});

app.get("/home", function (req, res) {
  res.sendFile(path.join(__dirname + "/views/index.html"));
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
          res.json({data});
      }).catch((err) => {
          res.json({message: err});
      })
  }
  else if (req.query.minDateStr) {
      data.getProductsByMinDate(req.query.minDateStr).then((data) => {
          res.json({data});
      }).catch((err) => {
          res.json({message: err});
      })
  }
  
  else {
      data.getAllProducts().then((data) => {
          res.json({data});
      }).catch((err) => {
          res.json({message: err});
      })
  }
});

//route to categories
 app.get("/categories", function (req, res) {
   data
     .getCategories()
     .then(function (data) {
       res.json(data);
     })
     .catch(function (err) {
       res.json({ message: err });
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

 app.get("/products/add", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/addProducts.html"));
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