// Load Dependencies
var SitemapGenerator  = require('sitemap-generator');
var parseString       = require('xml2js').parseString;
const lighthouse        = require('lighthouse');
const chromeLauncher    = require('lighthouse/chrome-launcher/chrome-launcher');
const flags = {output: 'json'};

function launchChromeAndRunLighthouse(url, flags, config = null) {
  return chromeLauncher.launch().then(chrome => {
    flags.port = chrome.port;
    return lighthouse(url, flags, config).then(results =>
      chrome.kill().then(() => results)
    );
  });
}

// Create Site Generator to Obtain all Site URLs
var generator = new SitemapGenerator('https://www.jimmyjohns.com');

// Register event listeners to retrieve URLs once generator has finished
generator.on('done', function (sitemaps) {
  var xml = sitemaps[0]; // => array of generated sitemaps
  parseString(xml, function (err, result) {
    var urlset = result.urlset.url; // array on objects containing the loc/url
    urlset.forEach(function(item) {
      var currentURL = item.loc[0];
      // Use lighthouse on the URL
      launchChromeAndRunLighthouse(currentURL, flags).then(results => {
        // Use results!
        console.log(results);
      });
    });
  });
});

// start the crawler
generator.start();
