// define our application and instantiate Express 
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<!DOCTYPE html>`);
const $ = require('jquery')(window);

// pass our app into http
var http = require('http').Server(app);

// install Handlebars
var hbs = require('hbs');

// define a route to handle form post
var path = require('path');

// store responses using FileSystem
var fs = require('fs');
var formidable = require('formidable');
var rimraf = require('rimraf');
var FileAPI = require('file-api');
var File = FileAPI.file;
var FileList = FileAPI.FileList;
var FileReader = FileAPI.FileReader;

var JSAlert = require("js-alert");

app.use(bodyParser.urlencoded({extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/images')));
app.use(express.static(path.join(__dirname, '/views')));


app.set('view engine', 'html');
app.engine('html', hbs.__express);


// Loads the welcome page and waits for year to be entered
app.get('/', function(req, res) {

    console.log("app.get /");

    res.render(__dirname + '/views/index.html'), {
        
    };
})

// Calls the API and loads all the comics
app.get('/year-entered', function(req, res) {

    var year = req.query.year;

    // req.query.year has the year
    if (year == "") {
        
        console.log("YEAR IS NULL"); 

        res.render(__dirname + '/views/index.html', {
            
        });

        return;
    }

    else {

        console.log("YEAR IS A NUMBER");

        // check if year is within Marvel's range
        if ((year >= 1947) && (year <= (new Date()).getFullYear())) {

            console.log("YEAR IS VALID");

            // probably do this in a different app.get
            res.render(__dirname + '/views/index.html'), {
               'year': year
            };

        }

        // if not in range, post error message
        else {

            res.render(__dirname + '/views/index.html', {
                
            });

            return;
        }
    } 

})

module.exports = app;

// host the website
http.listen(process.env.PORT || 3000, function() {
  console.log("Running on", http.address().port);
});
