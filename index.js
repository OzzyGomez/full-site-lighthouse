// Load Dependencies
var validator   = require('validator');
var path        = require('path');

// Custom Modules
const sitemap   = require('./lib/sitemap.js');
const chrome    = require('./lib/chrome.js');

if (process.argv[2]) {
  if (validator.isURL(process.argv[2])) {
    console.log("Generating Sitemap...");
    sitemap(process.argv[2], function () {
      console.log("Generating Audit...");
      chrome();
    });
  } else {
      console.error(process.argv[2] + " is not a valid URL, please use the full URL.");
  }
} else {
  console.log("\nUsage: node " + path.basename(__filename) + " [URL]\n");
}
