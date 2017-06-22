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

  var jsonDate = (new Date()).toJSON();
  var timeInMs = Date.now();
  // Open A Stream to Write Json into
  var jsonStream = fs.createWriteStream("./output/audit_"+timeInMs+".json");

  // Global Variable
  const flags = {output: 'json'};
  var urlset, size;
  var promises = [];
  var count = 0;
  var bar, ticks;

  var array = [
    'https://www.jimmyjohns.com/',
    'https://www.jimmyjohns.com/find-a-jjs/',
    'https://www.jimmyjohns.com/about-us/our-food/'
  ];

  parser.parseString(data, function (err, result) {
    urlset = result.urlset.url; // array on objects containing the loc/url
    size = Object.keys(urlset).length;
    bar = new ProgressBar('Progress [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 50,
      total: 100
    });

    ticks = 100/array.length;
    bar.tick(0);
    async.eachSeries(array, function(item, callback) {
      //var currentURL = item.loc[0];
      launchChromeAndRunLighthouse(item, flags).then(results => {
        callback();
      });
    }, function (err) {
      if (err) {
        console.log("Error");
      } else {
        Q.allSettled(promises).then(function (results) {
          var json = {
            "userAgent": "",
            "lighthouseVersion": "",
            "startGeneratedTime": "",
            "overallScore": 0,
            "runtimeConfig": "",
            "audit": {},
            "scoreByPage": {}
          }
          var objCount = 0;
          var lighthouseTotalScore = 0;

          promises.forEach(function(lighthouse) {
            var lighthouseUrl = lighthouse.url;
            var lighthouseScore = lighthouse.score;
            var lighthouseUserAgent = lighthouse.userAgent;
            var lighthouseVersion = lighthouse.lighthouseVersion;
            var lighthouseGeneratedTime = lighthouse.generatedTime;
            var lighthouseRuntimeConfig = lighthouse.runtimeConfig;
            var lighthouseReportCategories = lighthouse.reportCategories;       // array of object

            // for scoreByPage
            json.scoreByPage[lighthouseUrl] = {};
            json.scoreByPage[lighthouseUrl].pageScore = lighthouseScore;

            // for first only, insert basic/same information
            if (objCount == 0) {
              json.userAgent = lighthouseUserAgent;
              json.lighthouseVersion = lighthouseVersion;
              json.startGeneratedTime = lighthouseGeneratedTime;
              json.runtimeConfig = lighthouseRuntimeConfig;
            }

            // for total average score of entire site combined
            lighthouseTotalScore += lighthouseScore;

            lighthouseReportCategories.forEach(function (report) {
              var reportName = report.name;                                     // report category (e.i. progressive)
              reportName = reportName.toLowerCase().replace(/ /g, "-");
              var reportScore = report.score;                                   // score for report category
              var reportAudit = report.audits;                                  // Get audit array for particular report category

              // Create report category under url under scoreByPage if doesn't
              // exist
              if (!json.scoreByPage[lighthouseUrl][reportName]) {
                  json.scoreByPage[lighthouseUrl][reportName] = {};
              }
              json.scoreByPage[lighthouseUrl][reportName].score = reportScore;  // Insert score info report category under score in scoreByPage

              // Create object under reportName (reportCategory) under audit if
              // doesn't exist
              if (!json.audit[reportName]) {
                  json.audit[reportName] = {};
              }

              // Add universal description for reportName (reportCategory)
              json.audit[reportName].description = report.description;

              // add up all score from reportCategories
              if (!json.audit[reportName].overallScore) {
                json.audit[reportName].overallScore = 0;
              }
              json.audit[reportName].overallScore += (reportScore / array.length);              // CHANGE FOR PRODUCTION

              // if results object doesn't already exist under the certain report name, create one
              if (!json.audit[reportName].results) {
                  json.audit[reportName].results = {};
              }

              reportAudit.forEach(function (info) {
                // Assign variables to important object keys
                var infoName = info.id;
                var infoGroup = info.group;
                var infoWeight = info.weight;
                var infoResults = info.result;
                var infoScore = info.score;

                // Create section is one doesn't already exists
                if (!json.audit[reportName].results[infoName]) {
                    json.audit[reportName].results[infoName] = {};
                }

                // Initalize overallScore for current section if key doesn't already exist
                if (!json.audit[reportName].results[infoName].overallScore) {
                    json.audit[reportName].results[infoName].overallScore = 0;
                }

                // add report section universal information group and weight
                json.audit[reportName].results[infoName].group = infoGroup;
                json.audit[reportName].results[infoName].weight = infoWeight;

                // Create pages object under report section if one doesn't exist
                if (!json.audit[reportName].results[infoName].pages) {
                  json.audit[reportName].results[infoName].pages = {}
                }

                // Create url object under pages under report section if one doesn't exist
                if (!json.audit[reportName].results[infoName].pages[lighthouseUrl]) {
                    json.audit[reportName].results[infoName].pages[lighthouseUrl] = {};
                }

                // Add results for current url under current url under current section under results under report category
                json.audit[reportName].results[infoName].pages[lighthouseUrl] = infoResults;

                // Add overallScore for report section and take average
                json.audit[reportName].results[infoName].overallScore += (infoScore/array.length);   // CHANGE FOR PRODUCTION
              });
            });
            objCount++;
          });
          // average score of all the pages over all score
          json.overallScore = lighthouseTotalScore/array.length;                // CHANGE FOR PRODUCTION

          jsonStream.write(JSON.stringify(json, null, 4));
          console.log("\nAudit Complete! Results available in ./output/audit_"+timeInMs+".json");
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
          delete results.artifacts;
          delete results.timing;
          delete results.audits;
          delete results.reportGroups;
          delete results.initialUrl;
          promises.push(results);
          bar.tick(ticks);
          return results;
        }).catch(err => console.log("Lighthouse Rejection: " + err) )
      );
    }).catch(err => console.log("Launch Rejection: " + err));
  }
}

module.exports = chrome;
