
function renderContest(data) {
  var maxSize = 10;
  var source   = $("#contest-template").html();
  var template = Handlebars.compile(source);
  var info = {contests : []}; //: [{contest : data.contest}, {contest : data.contest}]};
  var cur = {contest: []};
  for (var i = 0; i < data.contest.length; ++i) {
    if (cur.contest.length > maxSize) {
      info.contests.push(cur);
      cur = {contest: []};
    }
    cur.contest.push(data.contest[i]);
  }

  if (cur.contest.length > 0)
      info.contests.push(cur);

  var html = template(info);
  $("#contest").html(html);
  $(document).ready(function(){
    $('.collapsible').collapsible({
      accordion : false
    });
  });
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
    scoreboard.push({
      name: f.name,
      score: score,
      profile_CF: f.profile_CF,
      score_CF: f.score_CF
    });
  }

  scoreboard.sort(function(a, b) {
    if (b.score == a.score) {
      var bb = (typeof b.score_CF == 'number') ? b.score_CF : 0;
      var aa = (typeof a.score_CF == 'number') ? a.score_CF : 0;
      return bb - aa;
    }
    return b.score - a.score;
  });

  var source = $("#scoreboard-template").html();
  var template = Handlebars.compile(source);
  var html = template({scoreboard: scoreboard});
  $("#scoreboard").html(html);
}

function fetchRatingCF(data, next) {
  var handles = data.people.map(function(it) {
    return /http\:\/\/codeforces\.com\/profile\/(.+)/
      .exec(it.profile_CF)[1];
  });
  var query = 'http://codeforces.com/api/user.info?handles='
  var reverse = {}
  var first = true;
  for (var i = 0; i < handles.length; ++i) {
    //console.log(handles[i]);
    if (handles[i] !== '-') {
      if (!first) query += ';';
      query += handles[i];
      reverse[handles[i].toLowerCase()] = i;
      first = false;
    }
  }

  $.getJSON(query).done(function(ans) {
    for (var i = 0; i < ans.result.length; ++i) {
      var cur = ans.result[i];
      console.log(cur.handle);
      data.people[reverse[cur.handle.toLowerCase()]].score_CF = cur.rating || 'unrated';
    }
    next(data);
  })
}


function renderCumulativeScore(data) {
  var a = document.getElementById('cumulativeScore');
  var t = 'https://a2oj.com/showcumulative?IDs=';
  var first = true;
  for (var i = 0; i < data.length; ++i) {
    var m = /.*ID=([0-9]+)/.exec(data[i].scoreboard);
    if (m) {
      if (!first) t += '%2C+';
      first = false;
      t += m[1];
    }
  }
  //console.log(data);
  a.href = t;
}

function loadData() {
  $.getJSON('data.json').fail(function (e) {
    alert('Error: ' + JSON.stringify(e));
  }).done(function (data) {
    if (/rules\.html$/.test(document.location.pathname)) {
      renderRules(data.rules);
    } else {
      renderContest(data);
      fetchRatingCF(data, renderScore);
      renderCumulativeScore(data.contest);
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
