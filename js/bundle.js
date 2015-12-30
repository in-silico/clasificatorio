
function renderContest(data) {
  var source   = $("#contest-template").html();
  var template = Handlebars.compile(source);
  var html = template(data);
  $("#contest").html(html);
}

function renderScore(data) {
  var people  = data.people,
      contest = data.contest;

  var scoreboard = [];
  for (var i = 0, f; f = people[i]; ++i) {
    var score = 0;
    for (var j = 0, p; j < f.contests.length; ++j) {
      p = f.contests[j];
      score += contest[p].points;
    }
    scoreboard.push({name: f.name, score: score});
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
    renderContest(data);
    renderScore(data);
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
