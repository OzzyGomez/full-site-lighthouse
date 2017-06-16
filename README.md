# full-site-lighthouse

An automated way to run Google lighthouse on an entire site
The script generates a sitemap of your site and runs Google Lighthouse on them.

WARNING: If sitemap if long, script may take a long time to run as it must evaluate each site via Google Lighthouse Asynchronously

## Requirements
- NodeJS

## To Run
#### Install Dependencies (Required before first run)
```shell
npm install
```

#### Run Script
```shell
node index.js [LANDING PAGE URL]
```
include http:// or https://

## Outputs
Outputs will be in the /output/ directory
