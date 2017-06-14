// Load Dependencies
var SitemapGenerator  = require('sitemap-generator');
var parseString       = require('xml2js').parseString;

// Create Site Generator to Obtain all Site URLs
var generator = new SitemapGenerator('https://www.jimmyjohns.com');

// Register event listeners to retrieve URLs once generator has finished
generator.on('done', function (sitemaps) {
  var xml = sitemaps[0]; // => array of generated sitemaps
  parseString(xml, function (err, result) {
    var urlset = result.urlset.url; // array on objects containing the loc/url
    urlset.forEach(function(item) {
      var currentURL = item.loc[0];
      
    });
  });
});

// start the crawler
generator.start();
