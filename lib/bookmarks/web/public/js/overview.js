var failColor = '#ff0000';
var successColor = '#00ff00';

var ajax = function(element, url, method) {
  method = method || 'GET';
  element.showLoading();

  var result = $.ajax({
    type: method,
    url: url
  });
  result.error(function() {
    element.hideLoading();
    failAnimation(element);
  });
  result.done(function() {
    element.hideLoading();
    succesAnimation(element);
  });
  return result;
};

var colorAnimation = function(element, color) {
  var oldColor = element.css('color');
  element.animate({
    color: color
  }, 500, function() {
    element.animate({
      color: oldColor
    }, 500);
  });
}

var failAnimation = function(element) {
  colorAnimation(element, failColor);
};

var succesAnimation = function(element) {
  colorAnimation(element, successColor);
};

var setupMouseOver = function() {
  var hoverElements = ['div', 'li', 'h2'];

  hoverElements.forEach(function(element) {
    $(element).hover(function() {
      $(this).addClass('selected');
    }, function() {
      $(this).removeClass('selected');
    });
  });
};

var setupFunctions = function() {
  $('.function h2').click(function() {
    $(this).parent().find('ul').toggle();
  });

  $('.function h2').each(function() {
    var text = $(this).text();
    $(this).text('↪ ' + text);
  });

  $('.function').each(function() {
    var controller = $(this).attr('id');

    $(this).find('li').click(function() {
      var method = $(this).attr('id');
      var path = '/api/' + controller + '/' + method;
      ajax($(this), path);
    });
  })
};

var setupOverview = function() {
  setupMouseOver();
  setupFunctions();
};

$(document).ready(function() {
  setupOverview();
});

