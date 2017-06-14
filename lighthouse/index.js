const lighthouse = require('lighthouse');
const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const log = require('lighthouse/lighthouse-core/lib/log');
const fs = require('fs')
const path = require('path')

const mkdirSync = function (dirPath) {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

let theURL = 'https://www.jimmyjohns.com';
var hours = (new Date()).getHours();
let folder = 'Audits-' + getDateTime();

mkdirSync(path.resolve(`./${folder}`));

let spawn = require("child_process").spawn,child;
child = spawn("powershell.exe", ["lighthouse " + theURL + ` --output-path=./${folder}/lighthouse-results.html` , "-"]);
child.stdout.on("data",function(data){
    console.log("Powershell Data: " + data);
});
child.stderr.on("data",function(data){
    console.log("Powershell Errors: " + data);
});
child.on("exit",function(){
    console.log("Powershell Script finished");
});
child.stdin.end(); //end input

//const jsdom = require("jsdom");
//const { JSDOM } = jsdom;
//global.document = new JSDOM(...);
//const $ = jquery(global.document.window);
/*
let window;  

function launchChromeAndRunLighthouse(url, flags, config = null) {
  return chromeLauncher.launch().then(chrome => {
    flags.port = chrome.port;
    return lighthouse(url, flags, config).then(results =>
      chrome.kill().then(() => results)
    );
  });
}
const flags = { output: 'json'};
//log.setLevel(flags.logLevel);
*/
/*
const dom = new JSDOM(`http://www.jimmyjohns.com`, {
  url: "http://www.jimmyjohns.com",
  contentType: "text/html",
  includeNodeLocations: true
});
*/

/*
JSDOM.fromURL('http://www.jimmyjohns.com').then(dom => {
    window = new JSDOM(dom.serialize(), {runScripts: "dangerously"});
    console.log(dom.window.document.querySelector("a").href);
    return window;
}).then(window => {
    //console.log(window.serialize());
    //let content = dom.serialize();
    console.log("ready to roll!");
});
*/

/*
launchChromeAndRunLighthouse(theURL, flags).then(results => {
console.log(results);
fs.writeFile('myjsonfile.json', json, 'utf8', callback);
});
*/



function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return day + "_" + month + "_" + year + "_" + hour + "-" + min;

}