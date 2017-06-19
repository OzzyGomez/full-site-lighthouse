//import each from 'async/each';
//import eachOfSeries from 'async/eachOfSeries';

function chrome() {
  // Load Dependences
  var async               = require('async');
  var each                = require('async/each');
  var eachSeries          = require('async/eachSeries');
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

  // For Test
  var array = [
    'http://dev01-jjw.jimmyjohns.com/',
    'http://dev01-jjw.jimmyjohns.com/find-a-jjs/',
    'http://dev01-jjw.jimmyjohns.com/menu/',
    'http://dev01-jjw.jimmyjohns.com/jj-store/',
    'http://dev01-jjw.jimmyjohns.com/about-us/jimmy-fresh/'
  ];

  // Read XML from file for URL
  fs.readFile('./output/sitemap.xml', (err, data) => {
    if (err) throw err;
    parser.parseString(data, function (err, result) {
      urlset = result.urlset.url; // array on objects containing the loc/url
      size = Object.keys(urlset).length;
      // FOR PRODUCTION
      // for (item of urlset) {
      //   var currentURL = item.loc[0];
      //   promises.push(launchChromeAndRunLighthouse(currentURL, flags));
      // }

      // For Test
      async.eachSeries(array, function (item) {
        promises.push(launchChromeAndRunLighthouse(item, flags));
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
