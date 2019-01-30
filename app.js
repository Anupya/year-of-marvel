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

// install Handlebars {{title}}
var hbs = require('hbs');

// define a route to handle form post
var path = require('path');

// define XMLHttpRequest is a built-in object in web browsers
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// generates MD5
var md5 = require('md5');

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

    res.render(__dirname + '/views/index.html'), {
        
    };
})

// Calls the API and loads all the comics
app.get('/year-entered', function(req, res) {

    var year = req.query.year;

    // req.query.year has the year
    if (year == "") { 

        res.render(__dirname + '/views/index.html', {
            
        });

        return;
    }

    else {

        // Create apiURL
        var timestamp = Date.now();
        var publicKey = "a090825504ad5c202bbe5a728a8d051d";
        var privateKey = "2aa7212be76cf50d10a1e3ba1665f6b34f334363";
        
        var md5base = timestamp + privateKey + publicKey;
        var md5hash = md5(md5base);
        var apiURL = "http://gateway.marvel.com/v1/public/comics?dateRange=" 
        + year + "-01-01%2C" + year + "-12-31&ts=" + timestamp 
        + "&apikey=" + publicKey + "&hash=" + md5hash;

        console.log(apiURL);

        // check if year is within Marvel's range
        if ((year >= 1947) && (year <= (new Date()).getFullYear())) {

            var request = new XMLHttpRequest();
            request.open('GET', apiURL, true);

            request.onload = function() {

                var data = JSON.parse(this.response);

                if (request.status >= 200 && request.status < 400) {
                    data.forEach(results => {
                        console.log(results.title);
                    });
                }
                else {
                    console.log('error');
                }
            }

            request.send();
            /*
            URL url = new URL(apiURL); 
            HttpURLConnection conn = (HttpURLConnection)url.openConnection(); 
            conn.setRequestMethod(“GET”); 
            conn.connect(); 
            int responsecode = conn.getResponseCode(); 

            if(responsecode != 200) {
                throw new RuntimeException(“HttpResponseCode: “ +responsecode);
            }   
            else
            {
                
                Scanner sc = new Scanner(url.openStream());
                while(sc.hasNext())
                {
                inline+=sc.nextLine();
                }
                System.out.println(“\nJSON data in string format”);
                System.out.println(inline);
                sc.close();
            }

            // Declare instance of JSON parser
            JSONParser parse = new JSONParser();

            // Convert string objects into JSON objects
            JSONObject jobj = (JSONObject)parse.parse(inline); 

            // Convert JSON object into JSONArray object
            JSONArray jsonarr_1 = (JSONArray) jobj.get(“results”); 

            */
            // API Call
            res.redirect(
                "http://gateway.marvel.com/v1/public/comics?dateRange=" +
                year + "-01-01%2C" + year + 
                "-12-31&ts=1&apikey=a090825504ad5c202bbe5a728a8d051d&hash=92e64523a61d250fee6c53f1fc8519e6"
                );

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
