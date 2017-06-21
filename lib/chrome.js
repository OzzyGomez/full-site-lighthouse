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
  //var jsonStream = fs.createWriteStream("./output/audit_"+timeInMs+".json");
  var jsonStream = fs.createWriteStream("./output/audit_11111.json");

  // Global Variable
  const flags = {output: 'json'};
  var urlset, size;
  var promises = [];
  var count = 0;
  var bar, ticks;

  var array = [
    'https://www.jimmyjohns.com/',
    'https://www.jimmyjohns.com/find-a-jjs/'
    // 'https://www.jimmyjohns.com/about-us/our-food/'
  ];

  parser.parseString(data, function (err, result) {
    urlset = result.urlset.url; // array on objects containing the loc/url
    size = Object.keys(urlset).length;
    bar = new ProgressBar('Generating Audit... [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
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
          // New Json Variable to be returned
          var json = {
            "userAgent": "",
            "lighthouseVersion": "",
            "startGeneratedTime": "",
            "overallScore": 0,
            "runtimeConfig": "",
            "audit": {},
            "scoreByPage": {}
          }

          // semi global variables
          var objCount = 0;
          var totalScore = 0;

          // loop through each sites audit
          promises.forEach(function (item) {
            // initialize url variable and object
            var url = item.url;
            json.scoreByPage[url] = {};
            json.scoreByPage[url].pageScore = item.score;

            // for first only, insert basic/same information
            if (objCount == 0) {
              json.userAgent = item.userAgent;
              json.lighthouseVersion = item.lighthouseVersion;
              json.startGeneratedTime = item.generatedTime;
              json.runtimeConfig = item.runtimeConfig;
            }
            // calculation total score for averaging later
            totalScore += item.score;

            // get reportCategories array and init overallScore
            var reportCategories = item.reportCategories;
            var reportOverallScore = 0;
            reportCategories.forEach(function (report) {
              var reportName = report.name;
              reportName = reportName.toLowerCase();
              var reportScore = report.score;

              // calculate report overall score for averaging
              reportOverallScore += reportScore;

              // insert into json object
              if (!json.scoreByPage[url][reportName]) {
                  json.scoreByPage[url][reportName] = {};
              }
              json.scoreByPage[url][reportName].score = reportScore;
              if (!json.audit[reportName]) {
                  json.audit[reportName] = {};
              }
              json.audit[reportName].description = report.description;
              json.audit[reportName].overallScore = 0;
              if (!json.audit[reportName].results) {
                  json.audit[reportName].results = {};
              }

              // get audit array and init total score variables;
              var reportAudit = report.audits;
              var infoOverallScore = 0;
              reportAudit.forEach(function (info) {
                var infoName = info.id;
                var infoGroup = info.group;
                var infoWeight = info.weight;
                var infoResults = info.result;
                var infoScore = info.score;
                var infoResultsScore = info.result.score;

                infoOverallScore += infoScore;

                if (!json.audit[reportName].results[infoName]) {
                    json.audit[reportName].results[infoName] = {};
                }
                if (!json.audit[reportName].results[infoName].overallScore) {
                    json.audit[reportName].results[infoName].overallScore = 0;
                }
                json.audit[reportName].results[infoName].group = infoGroup;
                json.audit[reportName].results[infoName].weight = infoWeight;
                if (!json.audit[reportName].results[infoName].pages) {
                  json.audit[reportName].results[infoName].pages = {}
                }
                if (!json.audit[reportName].results[infoName].pages[url]) {
                    json.audit[reportName].results[infoName].pages[url] = {};
                }
                json.audit[reportName].results[infoName].pages[url] = infoResults;
                json.audit[reportName].results[infoName].overallScore += (infoScore/array.length);

              });
              // json.audit[reportName].results[infoName].overallScore /= infoOverallCount;
              // json.audit[reportName].results[infoName].overallScore *= 100;
              // var infoAverageScore = (infoScore/infoOverallCount)*100;
              //json.audit[reportName].results[infoName].overallScore = 999999999;
              var average = infoOverallScore/reportAudit.length;
              json.audit[reportName].overallScore = average;
            });

            objCount++;
          });
          json.overallScore = totalScore/array.length;

          jsonStream.write(JSON.stringify(json, null, 4));
          // console.log("\nAudit Complete! Results available in ./output/audit.json");
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
