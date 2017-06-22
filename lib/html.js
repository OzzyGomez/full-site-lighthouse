function html(data) {
  var fs            = require('fs');
  var createHTML    = require('create-html');

  var runtimeConfigEnvironment = data.runtimeConfig.environment;
  var scoreByPage = data.scoreByPage;
  var progressiveWebApp = data.audit['progressive-web-app'];
  var performanceObj = data.audit['performance'];
  var accessibility = data.audit['accessibility'];
  var bestPractices = data.audit['best-practices'];

  /** Head info
    ******************************************************************/
  var head = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.99.0/css/materialize.min.css">'+
            '<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">' +
            '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.99.0/js/materialize.min.js"></script>'+
            '<style>@media only screen and (min-width: 735px) { ._fix {position: fixed; }} .menu-button {width: 100%;margin:5px 0px;}</style>';

  /** Header
    ******************************************************************/
  var header = '<div class="navbar-fixed"><nav class="nav-extended green">' +
    '<div class="nav-wrapper container">' +
      '<a href="#" class="brand-logo">Audit for '+ data.url +'</a>' +
      '<a href="#" data-activates="mobile-demo" class="button-collapse"><i class="material-icons">menu</i></a>' +
    '</div>' +
    '<div class="nav-content container">' +
      '<ul class="tabs tabs-transparent">' +
        '<li class="tab"><a class="active" href="#all">All</a></li>' +
        '<li class="tab"><a href="#progressive">Progressive Web App</a></li>' +
        '<li class="tab"><a href="#performance">Performance</a></li>' +
        '<li class="tab"><a href="#accessibility">accessibility</a></li>' +
        '<li class="tab"><a href="#practices">Best Practices</a></li>' +
      '</ul>' +
    '</div>' +
  '</nav></div>';

  /** All tab
    ******************************************************************/
  var all = '<ul id="entire-site-score" class="collection with-header"><li class="collection-header"><h5>Entire Site Score</h5></li><li class="collection-item">'+ data.overallScore +'</li></ul>'+
            '<ul id="audited-date" class="collection with-header"><li class="collection-header"><h5>Audited Date</h5></li><li class="collection-item">'+ data.startGeneratedTime +'</li></ul>'+
            '<ul id="number-of-audits" class="collection with-header"><li class="collection-header"><h5>Number of Audits</h5></li><li class="collection-item">'+ data.numberOfAudits +'</li></ul>'+
            '<ul id="user-agent" class="collection with-header"><li class="collection-header"><h5>User Agent</h5></li><li class="collection-item">'+ data.userAgent +'</li></ul>';
            if (runtimeConfigEnvironment) {
              all += '<ul id="runtime-config" class="collection with-header">'+
                    '<li class="collection-header"><h5>Runtime Config</h5></li>';
              runtimeConfigEnvironment.forEach(function (environment) {
                if (environment.enabled == true) {
                    all += '<li class="collection-item"><strong>'+ environment.name+'</strong><div class="secondary-content">'+environment.description +'</div></li>';
                }
              });
              all += '</ul>';
            }
 all += '<ul id="audit-score-overview" class="collection with-header">'+
          '<li class="collection-header"><h5>Audit Score Overview</h5><li>'+
          '<li class="collection-item"><strong>Progressive Web App</strong><div class="secondary-content">'+ data.audit['progressive-web-app'].overallScore +'</div></li>'+
          '<li class="collection-item"><strong>Performance</strong><div class="secondary-content">'+ data.audit['performance'].overallScore +'</div></li>'+
          '<li class="collection-item"><strong>accessibility</strong><div class="secondary-content">'+ data.audit['accessibility'].overallScore +'</div></li>'+
          '<li class="collection-item"><strong>Best Practices</strong><div class="secondary-content">'+ data.audit['best-practices'].overallScore +'</div></li>'+
        '</ul>';
        if (scoreByPage) {
          all += '<ul id="score-by-page" class="collection with-header">'+
                  '<li class="collection-header"><h5>Score By Page</h5></li>';
          for (var key in scoreByPage) {
            all += '<li class="collection-item"><strong>'+ key +'</strong><div class="secondary-content">'+ scoreByPage[key].pageScore +'</div></li>';
          }
          all += '</ul>';
        }
  var allSidebar = '<ul class="_fix">'+
                      '<li><a href="#entire-site-score" class="waves-effect waves-light btn menu-button">Site Score</a></li>'+
                      '<li><a href="#audited-date" class="waves-effect waves-light btn menu-button">Audit Date</a></li>'+
                      '<li><a href="#number-of-audits" class="waves-effect waves-light btn menu-button">NUmber of Audits</a></li>'+
                      '<li><a href="#user-agent" class="waves-effect waves-light btn menu-button">User Agent</a></li>'+
                      '<li><a href="#runtime-config" class="waves-effect waves-light btn menu-button">Runtime Config</a></li>'+
                      '<li><a href="#audit-score-overview" class="waves-effect waves-light btn menu-button">Score Overview</a></li>'+
                      '<li><a href="#score-by-page" class="waves-effect waves-light btn menu-button">Score by Page</a></li>'+
                    '</ul>';

  var progressiveTab = '<h3>Progressive Web App Audit</h3>' +
                       '<ul class="collection with-header"><li class="collection-header"><h5>Description</h5></li><li class="collection-item">'+ progressiveWebApp.description +'</li></ul>';

  var progressiveSideBar = '';

  var performanceTab = '<h3>Performance Audit</h3>' +
                       '<ul class="collection with-header"><li class="collection-header"><h5>Description</h5></li><li class="collection-item">'+ performanceObj.description +'</li></ul>';

/** content
  ******************************************************************/
  var content = '<div class="container" style="margin-top: 50px;">' +
    '<div class="row">' +
        '<div id="all" class="col s12">' +
          '<div class="col s12 m4 l3">' +
          allSidebar +
          '</div>' +
          '<div class="col s12 m8 l9">' +
          all +
          '</div>' +
        '</div>' +
        '<div id="progressive" class="col s12">' +
          '<div class="col s12 m4 l3">' +
          '</div>' +
          '<div class="col s12 m8 l9">' +
          progressiveTab+
          '</div>' +
        '</div>' +
        '<div id="performance" class="col s12">' +
          '<div class="col s12 m4 l3">' +
          '</div>' +
          '<div class="col s12 m8 l9">' +
          '</div>' +
        '</div>' +
        '<div id="accessibility" class="col s12">' +
          '<div class="col s12 m4 l3">' +
          '</div>' +
          '<div class="col s12 m8 l9">' +
          '</div>' +
        '</div>' +
        '<div id="practices" class="col s12">' +
          '<div class="col s12 m4 l3">' +
          '</div>' +
          '<div class="col s12 m8 l9">' +
          '</div>' +
        '</div>' +
    '</div>'  +
  '</div>' +
  '<script>' +
  '$(document).ready(function(){' +
    '$(".collapsible").collapsible();' +
  '});' +
  '</script>';

  var footer = '';

  var scripts = '<script>function offsetAnchor() {if (location.hash.length !== 0) {window.scrollTo(window.scrollX, window.scrollY - 125);}}' +
                '$(document).on("click", "a[href^=\'#\']", function(event) {window.setTimeout(function() {offsetAnchor();}, 0);});'+
                'window.setTimeout(offsetAnchor, 0);</script>';


  var body = header + content + footer + scripts;

  var html = createHTML({
    title: 'Audit',
    lang: 'en',
    head: head,
    body: body
  })

  fs.writeFile('./output/test.html', html, function (err) {
    if (err) console.log(err)
  })

}

module.exports = html;
