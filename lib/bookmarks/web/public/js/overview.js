var failColor = '#ff0000';
var successColor = '#00ff00';
var debug = 0;

var ajax = function(element, url, method, data) {
  method = method || 'GET';
  element.showLoading();

  var result = $.ajax({
    type: method,
    url: url,
    data: data
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
    }, 500, function() {
      element.css('color', '');
    });
  });
}

var failAnimation = function(element) {
  colorAnimation(element, failColor);
};

var succesAnimation = function(element) {
  colorAnimation(element, successColor);
};

var deleteList = function(element) {
  var listId = element.attr('id').replace('list-', '');
  ajax(element.find('.delete'), '/list/' + listId, 'DELETE').done(function() {
    element.fadeOut(function() {
      element.remove();

      if ($('.list').length == 0) {
        $('#nolists').removeClass('hidden');
      }
    });
  });
};

var changeListTitle = function(element, newTitle, oldTitle) {
  var titleElement = element.find('.title');
  var listId = element.attr('id').replace('list-', '');

  ajax(element.find('.title'), '/list/' + listId, 'POST', { title: newTitle }).done(function() {
    titleElement.text(newTitle);
    setupStandardModeForTitle(titleElement);
  }).error(function() {
    titleElement.text(oldTitle);
    setupStandardModeForTitle(titleElement);
  });
};

var setupMouseOverFor = function(element) {
  $(element).hover(function() {
    $(this).addClass('selected');
  }, function() {
    $(this).removeClass('selected');
  });

  $(element).children().each(function() {
    setupMouseOverFor($(this));
  });
};

var setupMouseOver = function() {
  var hoverElements = ['div'];

  hoverElements.forEach(function(element) {
    setupMouseOverFor(element);
  });
};

var setupAddList = function() {
  $('#addlist').click(function() {
    ajax($(this), '/new_list').done(function(newListHtml) {
      $('#lists').append(newListHtml);
      setupLastList();
      $('#nolists').addClass('hidden');
    });
  });
};

var setupDeleteModeForList = function(element) {
  var confirm = element.find('.confirm');
  var cancel = element.find('.cancel');

  confirm.unbind('click');
  confirm.text('really?');
  confirm.click(function() {
    deleteList(element);
  });
  cancel.removeClass('hidden');
};

var setupStandardModeForList = function(element, text) {
  var confirm = element.find('.confirm');
  var cancel = element.find('.cancel');

  confirm.unbind('click');
  confirm.text(text);
  confirm.click(function() {
    setupDeleteModeForList(element);
  });
  element.find('.cancel').addClass('hidden');
};

var setupEditModeForTitle = function(element) {
  var text = element.text();
  var listElement = element.closest('.list');
  element.unbind('click');

  element.html('<input type="text" value="' + text + '" />');
  element.find('input').keypress(function(event) {
    if (event.which == 13) {
      changeListTitle(listElement, $(this).attr('value'), text);
    }
  });
  element.find('input').select();
};

var setupStandardModeForTitle = function(element) {
  element.unbind('click');
  element.click(function() {
    setupEditModeForTitle(element);
  });
};

var setupList = function(element) {
  var listId = element.attr('id').replace('list-', '');

  element.find('.title').click(function() {
    // $(this).parent().parent().find('.bookmarks').toggle('fast');
  });

  element.find('.title').click(function() {
    setupEditModeForTitle($(this));
  });

  var oldText = element.find('.confirm').text();
  element.find('.confirm').click(function() {
    setupDeleteModeForList(element);
  });
  element.find('.cancel').click(function() {
    setupStandardModeForList(element, oldText);
  });

  element.find('.addbookmark').click(function() {
    ajax($(this), '/bookmark/new', 'POST', { list: listId }).done(function(newBookmarkHtml) {
      element.find('.bookmarks ul').append(newBookmarkHtml);
    });
  });

  element.find('.bookmark').each(function() {
    var bookmarkId = $(this).attr('id').replace('bookmark-', '');

    $(this).find('.delete_bookmark').click(function() {
      var bookmarkLi = $(this).closest('li');
      ajax($(this), '/bookmark/' + bookmarkId, 'DELETE').done(function() {
        bookmarkLi.fadeOut().remove();
      });
    });
  });
}

var setupLastList = function() {
  var lastList = $('.list').last();
  lastList.hide();
  lastList.fadeIn();
  setupList(lastList);
  setupMouseOverFor(lastList);
  setupEditModeForTitle(lastList.find('.title'));
};

var setupLists = function() {
  $('.list').each(function() {
    setupList($(this));
  });
};

var setupOverview = function() {
  setupMouseOver();
  setupLists();
  setupAddList();
};

$(document).ready(function() {
  setupOverview();
});

