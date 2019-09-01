// Load Dependencies
require('babel-register');

var validator   = require('validator');
var path        = require('path');
var fs          = require('fs');

// Custom Modules
const sitemap   = require('./lib/sitemap.js');
const chrome    = require('./lib/chrome.js');

var jsonDate, timeInMs, dir;

// Check if Argument exists and is Valid URL
if (process.argv[2]) {
  if (validator.isURL(process.argv[2])) {
    timeInMs = Date.now();
    jsonDate = timeInMs;
    dir = './output/'+jsonDate+'/';
    // Create Directory
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    // If true, call sitemap module to generate sitemap
    console.log("Generating Sitemap...\n");
    sitemap(process.argv[2], jsonDate, function (data) {
      // Once sitemap has been created, Perform Full Site Audit
      console.log("Generating Audit...\n");
      console.log("Depending on the amount of pages you have, this may take a while.\n");
      chrome(data, jsonDate);
    });
  } else {
    // Error: Url is not valid
    console.error(process.argv[2] + " is not a valid URL. Please use the full URL.");
  }
} else {
  // Error: Script Usage is incorrect
  console.log("\nUsage: node " + path.basename(__filename) + " [URL]\n");
}
