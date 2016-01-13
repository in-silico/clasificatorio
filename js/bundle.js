
function renderContest(data) {
  var source   = $("#contest-template").html();
  var template = Handlebars.compile(source);
  var html = template(data);
  $("#contest").html(html);
}

function renderRules(data) {
  var source   = $("#rules-template").html();
  var template = Handlebars.compile(source);
  var html = template(data);
  $("#theRules").html(html);
}

function renderScore(data) {
  var people  = data.people,
      contest = data.contest;

  var scoreboard = [];
  for (var i = 0, f; f = people[i]; ++i) {
    var score = 0;
    for (var j = 0, p; j < f.contests.length; ++j) {
      p = f.contests[j];
      if (typeof (p) == 'number')
        score += contest[p].points;
      else {
        var weight = 1;
        if (p.pos <= 3) weight = 3;
        else if (p.pos <= 6) weight = 2;
        score += contest[p.id].points * weight;
      }
    }
    scoreboard.push({name: f.name, score: score, profile_CF: f.profile_CF});
  }
  scoreboard.sort(function(a, b) {
    return b.score - a.score;
  });

  var source = $("#scoreboard-template").html();
  var template = Handlebars.compile(source);
  var html = template({scoreboard: scoreboard});
  $("#scoreboard").html(html);
}

function loadData() {
  $.getJSON('data.json').fail(function (e) {
    alert('Error: ' + JSON.stringify(e));
  }).done(function (data) {
    if (/rules\.html$/.test(document.location.pathname)) {
      renderRules(data.rules);
    } else {
      renderContest(data);
      renderScore(data);
    }
  });
}

function start() {
  loadTemplates(loadData);
}

function loadTemplates(next) {
  $.get("templates.html").done(function (data) {
    $("body").append('<div id="templates_container" style="display:none"></div>');
    $("#templates_container").html(data);
    next();
  });
}

document.addEventListener( 'DOMContentLoaded', start);
