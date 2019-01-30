// define our application and instantiate Express 
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// enables you to use jQuery to examine and transform HTML on Node.js
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

// generates MD5
var md5 = require('md5');

// empty directory everytime
var rimraf = require('rimraf');

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
app.use(express.static(path.join(__dirname, '/img')));
app.use(express.static(path.join(__dirname, '/views')));


app.set('view engine', 'html');
app.engine('html', hbs.__express);


// Loads the welcome page and waits for year to be entered
app.get('/', function(req, res) {

    // clear img directory - DOES NOT WORK
    var destpath = __dirname + '/public/img/photo*';
    rimraf(destpath, function() { console.log('done'); });

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
        + "&limit=" + 100 + "&apikey=" + publicKey + "&hash=" + md5hash;

        // check if year is within Marvel's range
        if ((year >= 1947) && (year <= (new Date()).getFullYear())) {

            // get JSON object from apiURL
            $.getJSON(apiURL, function(result) {

                console.log(result);

                // store in hits.json
                var filepath = __dirname + '/hits.json';
                fs.writeFileSync(filepath, JSON.stringify(result.data, undefined, 2));

                // number of comics in this search
                var hits = result.data.count;

                // contains all comic cover URLs in our hits
                var comicCovers = [];

                // contains all comic titles in our hits
                var comicTitles = [];

                // contains all the comic URLs in our hits
                var comicURLs = [];

                // store each comic's cover URLs in an array
                for (comic = 0; comic < hits; comic++) {
                    
                    var imageURL = result.data.results[comic].thumbnail.path + "." +
                                    result.data.results[comic].thumbnail.extension;

                    // if image not available
                    if (result.data.results[comic].thumbnail.path == 
                        "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available") {

                        var imageURL = "https://www.unesale.com/ProductImages/Large/notfound.png"

                    }
                    
                    // add the comic cover URLs to array
                    comicCovers.push(imageURL);
                    comicTitles.push(result.data.results[comic].title);
                    comicURLs.push(result.data.results[comic].urls[0].url);

                }

                res.render(__dirname + '/views/index.html', {
                       comicCovers: comicCovers,
                       comicTitles: comicTitles,
                       comicURLs: comicURLs
                });

                //result.data.results 
                //console.log(result.data.results);
            });



            /*
            request.onload = function() {

                console.log("RESPONSE");
                console.log("-----------------------------");
                console.log(this.responsecode);
                console.log(this.response);
                console.log("-----------------------------");

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
            */

            
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
