const sitemap = require('./lib/sitemap.js');
const chrome = require('./lib/chrome.js');

sitemap('http://www.jimmyjohns.com', function () {
  chrome();
});
