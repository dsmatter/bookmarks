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

var changeBookmark = function(element, newTitle, newUrl, oldTitle, oldUrl) {
  var bookmarkId = element.attr('id').replace('bookmark-', '');

  ajax(element, '/bookmark/' + bookmarkId, 'POST', { title: newTitle, url: newUrl }).done(function() {
    element.find('.link').html('<a href="' + newUrl + '">' + newTitle + '</a>');
    setupStandardModeForBookmark(element);
  }).error(function() {
    element.find('.link').html('<a href="' + oldUrl + '">' + oldTitle + '</a>');
    setupStandardModeForBookmark(element);
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
  element.find('input').blur(function() {
    changeListTitle(listElement, $(this).attr('value'), text);
  });
  element.find('input').select()
};

var setupStandardModeForTitle = function(element) {
  element.unbind('click');
  element.click(function() {
    setupEditModeForTitle(element);
  });
};

var setupEditModeForBookmark = function(element) {  
  var oldTitle = element.find('a').text();
  var oldLUrl = element.find('a').attr('href');
  element.find('.edit_bookmark').unbind('click');

  element.find('.link').html('<input class="title" type="text" value="' + oldTitle + '" /><input class="url" type="text" value="' + oldLUrl + '" />');
  element.find('input').keypress(function(event) {
    if (event.which == 13) {
      var newTitle = element.find('input.title').attr('value');
      var newUrl = element.find('input.url').attr('value');
      changeBookmark(element, newTitle, newUrl, oldTitle, oldLUrl);
    }
  });
  element.find('input.title').select();
};

var setupStandardModeForBookmark = function(element) {
  element.find('.edit_bookmark').unbind('click');
  element.find('.edit_bookmark').click(function() {
    setupEditModeForBookmark(element);
  }); 
};

var setupList = function(element) {
  var listId = element.attr('id').replace('list-', '');

  element.dblclick(function() {
    // Get overlay content
    ajax($(this), '/lists/sharing/' + listId).done(function(overlayContent) {
      $('.overlay').html(overlayContent);
      setupSharing(listId);
      showOverlay();
    });
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
      $('#nobookmarks').hide();
      setupLastBookmark(element);
    });
  });

  element.find('.bookmark').each(function() {
    setupBookmark($(this));
  });
}

var showUserMenu = function() {
  // TODO: show friends

  $('#adduser_form').removeClass('hidden').hide().fadeIn();
  $('#adduser_form #email').select();
};

var setupSharingUser = function(element, listId) {
  var userId = element.attr('id').replace('user-', '');

  element.find('.delete').click(function() {
    ajax($(this), '/lists/sharing/' + listId + '/user/' + userId, 'DELETE').done(function() {
      element.fadeOut().remove();
    });
  });
};

var setupSharing = function(listId) {
  $('#adduser').click(function() {
    showUserMenu();
  });

  $('#adduser_form').keypress(function(event) {
    if (event.which == 13) {
      ajax($(this), '/lists/sharing/' + listId + '/add', 'GET', { user_email: $(this).find('#email').attr('value')}).done(function(newUserHtml) {
        $('#users').append(newUserHtml);
        setupSharingUser($('.user').last(), listId);
      }).error(function() {
        $('#adduser_form #email').select();
      });
    }
  });

  $('.user').each(function() {
    setupSharingUser($(this), listId);
  });
};

var setupBookmark = function(element) {
  var bookmarkId = element.attr('id').replace('bookmark-', '');

  element.find('.edit_bookmark').click(function() {
    setupEditModeForBookmark($(this).closest('.bookmark'));
  });

  element.find('.delete_bookmark').click(function() {
    var bookmarkLi = $(this).closest('li');
    ajax($(this), '/bookmark/' + bookmarkId, 'DELETE').done(function() {
      bookmarkLi.fadeOut().remove();
    });
  });
};

var setupLastBookmark = function(list) {
  var lastBookmark = list.find('.bookmark').last();
  lastBookmark.hide().fadeIn();
  setupBookmark(lastBookmark);
  setupMouseOver(lastBookmark);
  setupEditModeForBookmark(lastBookmark);
};

var setupLastList = function() {
  var lastList = $('.list').last();
  lastList.hide().fadeIn();
  setupList(lastList);
  setupMouseOverFor(lastList);
  setupEditModeForTitle(lastList.find('.title'));
};

var setupLists = function() {
  $('.list').each(function() {
    setupList($(this));
  });
};

var setupToken = function(element) {
  var tokenId = element.attr('id').replace('token-', '');

  element.find('.delete').click(function() {
    ajax(element, '/tokens/' + tokenId, 'DELETE').done(function() {
      element.fadeOut().remove();
    });
  });
};

var setupUser = function() {
  $('#addtoken').click(function() {
    ajax($(this), '/tokens/new').done(function(newTokenHtml) {
      $('#tokens').append(newTokenHtml);
      setupToken($('.token').last());
    });
  });

  $('.token').each(function() {
    setupToken($(this));
  });
};

var hideOverlay = function() {
  $('.overlay').fadeOut();
};

var showOverlay = function() {
  setupMouseOverFor($('.overlay'));
  $('.overlay').removeClass('hidden').hide().fadeIn();
};

var setupOverlay = function() {
  $('.overlay').dblclick(function() {
    hideOverlay();
  });
};

var setupOverview = function() {
  setupOverlay();
  setupMouseOver();
  setupLists();
  setupAddList();
};

$(document).ready(function() {
  setupOverview();
  setupUser();

  if (window.location.pathname.match(/quick_new/)) {
    $('#title').select();
  }
});

