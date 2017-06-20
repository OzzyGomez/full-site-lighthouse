function chrome(data) {
  // Load Dependences
  var async               = require('async');
  var eachSeries          = require('async/eachSeries');

  var parseString         = require('xml2js').parseString;
  var parser              = require('xml2js').Parser();
  
  const lighthouse        = require('lighthouse');
  const chromeLauncher    = require('chrome-launcher');

  var fs                  = require('fs');
  var Q                   = require('q');
  var ProgressBar         = require('progress');

  // Open A Stream to Write Json into
  var jsonStream = fs.createWriteStream("./output/audit.json");

  // Global Variable
  const flags = {output: 'json'};
  var urlset, size;
  var promises = [];
  var count = 0;
  var bar, ticks;

  parser.parseString(data, function (err, result) {
    urlset = result.urlset.url; // array on objects containing the loc/url
    size = Object.keys(urlset).length;
    bar = new ProgressBar('Generating Audit... [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: 100
    });

    ticks = 100/size;
    bar.tick(0);
    async.eachSeries(urlset, function(item, callback) {
      var currentURL = item.loc[0];
      launchChromeAndRunLighthouse(currentURL, flags).then(results => {
        callback();
      });
    }, function (err) {
      if (err) {
        console.log("Error");
      } else {
        Q.allSettled(promises).then(function (results) {
          jsonStream.write(JSON.stringify(promises, null, 4));
          console.log("\nAudit Complete! Results available in ./output/audit.json");
        }); // End allSettled
      }
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
          promises.push(results);
          bar.tick(ticks);
          return results;
        }).catch(err => console.log("Lighthouse Rejection: " + err) )
      );
    }).catch(err => console.log("Launch Rejection: " + err));
  }
}

module.exports = chrome;
