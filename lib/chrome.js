function chrome() {
  // Load Dependencies
  var parseString         = require('xml2js').parseString;
  var parser              = require('xml2js').Parser();
  const lighthouse        = require('lighthouse');
  const chromeLauncher    = require('chrome-launcher');
  var fs                  = require('fs');
  var Q                   = require('q');

  // Open A Stream to Write Json into
  var jsonStream = fs.createWriteStream("./output/audit.json");

  // Global Variable
  const flags = {output: 'json'};
  var urlset, size;
  var json = [];
  var promises = [];
  var count = 0;

  // Read XML from file for URL
  fs.readFile('./output/sitemap.xml', (err, data) => {
    if (err) throw err;
    parser.parseString(data, function (err, result) {
      urlset = result.urlset.url; // array on objects containing the loc/url
      size = Object.keys(urlset).length;
      // FOR PRODUCTION
      urlset.forEach(function(item) {
        var currentURL = item.loc[0];
        promises.push(launchChromeAndRunLighthouse(currentURL, flags));
      });

      Q.allSettled(promises).then(function (results) {
        jsonStream.write(JSON.stringify(json, null, 4));
        console.log("Audit Complete! Results available in ./output/audit.json");
      }); // End allSettled
    });
  });

  function launchChromeAndRunLighthouse(url, flags, config = null) {
    count++;
    return chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu']
    }).then(chrome => {
      flags.port = chrome.port;
      return lighthouse(url, flags, config).then(results =>
        chrome.kill().then(() => {
          json.push(results);
          return results;
        }).catch(err => console.log("Lighthouse Rejection: " + err) )
      );
    }).catch(err => console.log("Launch Rejection: " + err));
  }
}

module.exports = chrome;
