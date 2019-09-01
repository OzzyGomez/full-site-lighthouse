# full-site-lighthouse
An automated way to run Google's Lighthouse Auditing System on an entire site.
The script generates a sitemap of your site and runs Google Lighthouse on each page one by one.
Depending on the number of pages your site contains, running this script asynchronously won't work, since the event listeners will get overloaded.

## WARNING:
If your sitemap is long, the script will take a long time to give back a combined evaluation, since each page has to go through the lighthouse auditing system one by one.

## Requirements
- NodeJS
- NPM

## To Run
#### Install Dependencies (Required before first run)
```shell
npm install
```

#### Run Script
```shell
node index.js [LANDING PAGE URL]
```
include `http://` or `https://`

## Outputs
Outputs will be in the /output/ directory under the directory with a timestamp in milliseconds.
