// Load Dependencies
var Q                   = require('q');
var SitemapGenerator    = require('sitemap-generator');
var parseString         = require('xml2js').parseString;
const lighthouse        = require('lighthouse');
const chromeLauncher    = require('lighthouse/chrome-launcher/chrome-launcher');

// Global Variables
const flags = {output: 'json'};
var promise = [];

// FOR TEST
var array = ['https://www.jimmyjohns.com', 'https://www.google.com'];

// Create Site Generator to Obtain all Site URLs
var generator = new SitemapGenerator('https://www.jimmyjohns.com');

// start the crawler
generator.start();

// Register event listeners to retrieve URLs once generator has finished
generator.on('done', function (sitemaps) {
  var xml = sitemaps[0]; // => array of generated sitemaps
  parseString(xml, function (err, result) {
    var urlset = result.urlset.url; // array on objects containing the loc/url
    var size = Object.keys(urlset).length;
    console.log("Number of Urls: " + size);
    // FOR PRODUCTION
    // urlset.forEach(function(item) {
    //   var currentURL = item.loc[0];
    //   launchChromeAndRunLighthouse(item, flags).then(results => {
    //     if (results) {
    //       console.log("results");
    //     }
    //   });
    // });

    // FOR TEST
    array.forEach(function(item) {
      launchChromeAndRunLighthouse(item, flags).then(results => {
          console.log("results");
          return results;
      }).catch(function () {
          console.log("array promise rejected");
      });
    });
  });
});

function launchChromeAndRunLighthouse(url, flags, config = null) {
  return chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu']
  }).then(chrome => {
    flags.port = chrome.port;
    return lighthouse(url, flags, config).then(results =>
      chrome.kill().then(() => results)
    );
  }).catch(function () {
    console.log("Promise Rejected");
  });
}
