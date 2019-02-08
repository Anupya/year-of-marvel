// define our application and instantiate Express 
var express = require('express');
var app = express();

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

        // if year is within Marvel's range
        if ((year >= 1947) && (year <= (new Date()).getFullYear())) { 

            var offset = 0;
            var total = 0;

            var apiURL = "http://gateway.marvel.com/v1/public/comics?dateRange=" 
            + year + "-01-01%2C" + year + "-12-31&ts=" + timestamp 
            + "&limit=" + 100 + "&offset=" + offset + "&apikey=" + publicKey + "&hash=" + md5hash;

            // contains pageNumber and URL of each page
            var allPageInfo = { page: [ ], year };

            var pageNumber = 1;

            allPageInfo.year = year;
            allPageInfo.page.push({
                pageNumber: pageNumber, 
                url: apiURL,
                curPage: true
            });

            // get total number of results
            $.getJSON(apiURL).done(function(result) {

                var total = result.data.total;
                
                // put all apiURLs in apiurlarray
                while (total > (offset+100)) {

                    offset += 100;
                    pageNumber += 1;

                    var apiURL = "http://gateway.marvel.com/v1/public/comics?dateRange=" 
                    + year + "-01-01%2C" + year + "-12-31&ts=" + timestamp 
                    + "&limit=" + 100 + "&offset=" + offset + "&apikey=" + publicKey + "&hash=" + md5hash;

                    allPageInfo.page.push({
                        pageNumber: pageNumber,
                        url: apiURL,
                        curPage: false
                    });

                }

                // store in hits.json
                var filepath = __dirname + '/hits' + '.json';
                fs.writeFileSync(filepath, JSON.stringify(result.data, undefined, 2));

                // number of comics in this search
                var hits = result.data.count;

                // create structure that contains everything
                var allComicInfo = { comics: [ ] };

                // store each comic's cover URLs in an array
                for (comic = 0; comic < hits; comic++) {

                    // Note: for some reason 2019 has some undefined comics in the API
                    // this is the workaround for that

                    if (result.data.results[comic] != undefined) {
                        
                        // store only the data we need in separate variables
                        var imageURL = result.data.results[comic].thumbnail.path + "." +
                                        result.data.results[comic].thumbnail.extension;

                        var title = result.data.results[comic].title;
                        var description = result.data.results[comic].description;
                        var url = result.data.results[comic].urls[0].url;
                        var month = result.data.results[comic].dates[0].date.slice(5,7);
                        var date = result.data.results[comic].dates[0].date.slice(8,10);

                        // if image not available
                        if (result.data.results[comic].thumbnail.path == 
                            "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available") {

                            var imageURL = "http://static1.squarespace.com/static/51b3dc8ee4b051b96ceb10de/51ce6099e4b0d911b4489b79/5283aa6fe4b043b800f05a32/1384381259739/marvel-studios-releases-new-credits-logo-preview.jpg?format=1500w"

                        }

                        // if description not available
                        if (description == null) {
                            description = "No description available."
                        }

                        // add to structure
                        allComicInfo.comics.push({
                            cover: imageURL,
                            title: title,
                            description: description,
                            url: url,
                            month: month,
                            date: date,
                        }) 
                    }  
                }

                res.render(__dirname + '/views/index.html', {
                       allComicInfo: allComicInfo,
                       allPageInfo: allPageInfo
                });

            });
        }

        else {
            res.render(__dirname + '/views/index.html', {
                       
            });
        } 
    }

})

// request a different page with the same year
app.get('/page-changed', function(req, res) {

    // get year and page from URL
    var year = req.query.year;
    var page = req.query.page;

    // calculate offset based on page
    var offset = 100*(page-1);

    // Create apiURL
    var timestamp = Date.now();
    var publicKey = "a090825504ad5c202bbe5a728a8d051d";
    var privateKey = "2aa7212be76cf50d10a1e3ba1665f6b34f334363";
    
    var md5base = timestamp + privateKey + publicKey;
    var md5hash = md5(md5base);

    var apiURL = "http://gateway.marvel.com/v1/public/comics?dateRange=" 
            + year + "-01-01%2C" + year + "-12-31&ts=" + timestamp 
            + "&limit=" + 100 + "&offset=" + offset + "&apikey=" + publicKey + "&hash=" + md5hash;

    // contains pageNumber and URL of each page
    var allPageInfo = { page: [ ], year };
    
    // get JSON object from apiURL
    $.getJSON(apiURL, function(result) {

        var total = result.data.total;
        
        var offset = 0;
        var pageNumber = 1;

        allPageInfo.year = year;

        while (total > offset) {

            var apiURL = "http://gateway.marvel.com/v1/public/comics?dateRange=" 
            + year + "-01-01%2C" + year + "-12-31&ts=" + timestamp 
            + "&limit=" + 100 + "&offset=" + offset + "&apikey=" + publicKey + "&hash=" + md5hash;

            if (pageNumber == page) {
                allPageInfo.page.push({
                    pageNumber: pageNumber,
                    url: apiURL,
                    curPage: true
                });
            }
            else {
                allPageInfo.page.push({
                    pageNumber: pageNumber,
                    url: apiURL,
                    curPage: false
                });
            }
            

            offset += 100;
            pageNumber += 1;
        }

        // number of comics in this search
        var hits = result.data.count;

        // create structure that contains everything
        var allComicInfo = { comics: [ ] };

        // store each comic's cover URLs in an array
        for (comic = 0; comic < hits; comic++) {
            
            // store only the data we need in separate variables
            var imageURL = result.data.results[comic].thumbnail.path + "." +
                            result.data.results[comic].thumbnail.extension;

            var title = result.data.results[comic].title;
            var description = result.data.results[comic].description;
            var url = result.data.results[comic].urls[0].url;
            var month = result.data.results[comic].dates[0].date.slice(5,7);
            var date = result.data.results[comic].dates[0].date.slice(8,10);

            // if image not available
            if (result.data.results[comic].thumbnail.path == 
                "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available") {

                var imageURL = "http://static1.squarespace.com/static/51b3dc8ee4b051b96ceb10de/51ce6099e4b0d911b4489b79/5283aa6fe4b043b800f05a32/1384381259739/marvel-studios-releases-new-credits-logo-preview.jpg?format=1500w"

            }

            // if description not available
            if (description == null) {
                description = "No description available."
            }

            // add to structure
            allComicInfo.comics.push({
                cover: imageURL,
                title: title,
                description: description,
                url: url,
                month: month,
                date: date,
            })

        }

        res.render(__dirname + '/views/index.html', {
               allComicInfo: allComicInfo,
               allPageInfo: allPageInfo
        });
        
    })
});

module.exports = app;

// host the website
http.listen(process.env.PORT || 3000, function() {
  console.log("Running on", http.address().port);
});
