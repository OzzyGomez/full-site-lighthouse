function getSitemap(url, jsonDate, callback) {
  // Load Dependencies
  var SitemapGenerator    = require('sitemap-generator');
  var parseString         = require('xml2js').parseString;
  var fs                  = require('fs');

  // Global Variable
  const flags = {output: 'json'};
  var urlset, size;
  var urlArray = [];

  // Create Site Generator to Obtain all Site URLs
  var generator = new SitemapGenerator(url);

  // start the crawler
  generator.start();

  //Register event listeners to retrieve URLs once generator has finished
  generator.on('done', function (sitemaps) {
    // get XML from array
    var xml = sitemaps[0]; // array of generated sitemaps
    // Write XML to array
    fs.writeFile('./output/'+jsonDate+'/sitemap.xml', xml, (err) => {
      if (err) throw err;
      console.log("Sitemap has been saved under ./output/sitemap.xml\n");
      callback(xml);
    });
  });
}

module.exports = getSitemap;
