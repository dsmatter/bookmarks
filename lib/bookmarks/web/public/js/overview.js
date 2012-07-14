var failColor = '#ff0000';
var successColor = '#00ff00';
var debug = 0;

function htmlDecode(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

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

var changeBookmark = function(element, newTitle, newUrl, oldHtml) {
  var bookmarkId = element.attr('id').replace('bookmark-', '');

  ajax(element, '/bookmark/' + bookmarkId, 'POST', { title: newTitle, url: newUrl }).done(function(bookmarkHtml) {
    element.replaceWith(bookmarkHtml);
    newElement = $('#bookmark-' + bookmarkId);
    setupMouseOverFor(newElement);
    setupBookmark(newElement);
  }).error(function() {
    element.html(oldHtml);
    setupBookmark(element);
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

  element.html('<input type="text" value="' + htmlDecode(text) + '" />');
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

var tagString = function(element) {
  result = ''
  element.find('.tags li').each(function() {
    result += ' ' + $(this).text();
  });
  return result;
};

var setupEditModeForBookmark = function(element) {  
  var oldTitle = element.find('a').text();
  var oldLUrl = element.find('a').attr('href');
  var oldHtml = element.html();
  var tags = tagString(element);
  element.find('.edit_bookmark').unbind('click');

  element.find('.link').html('<input class="title" type="text" value="' + htmlDecode(oldTitle) + htmlDecode(tags) + '" /><input class="url" type="text" value="' + htmlDecode(oldLUrl) + '" />');
  element.find('input').keypress(function(event) {
    if (event.which == 13) {
      var newTitle = element.find('input.title').attr('value');
      var newUrl = element.find('input.url').attr('value');
      changeBookmark(element, newTitle, newUrl, oldHtml);
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

  element.find('.edit').click(function() {
    // Get overlay content
    ajax($(this), '/lists/sharing/' + listId).done(function(overlayContent) {
      $('.overlay .centerbox').html(overlayContent);
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
      element.find('.bookmarks').find('ul').first().append(newBookmarkHtml);
      $('#nobookmarks-' + listId).hide();
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
    ajax($(this).closest('.user'), '/lists/sharing/' + listId + '/user/' + userId, 'DELETE').done(function() {
      element.fadeOut().remove();
      reloadList(listId);
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
        $('#email').select();
        reloadList(listId);
      }).error(function() {
        $('#adduser_form #email').select();
      });
    }
  });

  $('.user').each(function() {
    setupSharingUser($(this), listId);
  });
};

var reloadList = function(listId) {
  var listElement = $('#list-' + listId);
  ajax(listElement, '/list/' + listId).done(function(listHtml) {
    listElement.replaceWith(listHtml);

    // Get and setup new list element
    listElement = $('#list-' + listId);
    setupMouseOverFor(listElement);
    setupList(listElement);
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
      if (bookmarkLi.closest('ul').find('li').size() == 2) {
        bookmarkLi.closest('ul').find('li').first().removeClass('hidden').show();
      }
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
  setupUserForm($('#user_form'));

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
  $('.overlay').click(function() {
    hideOverlay();
  });
  $('.overlay .centerbox').click(function(e) {
    e.stopPropagation();
  });
};

var setupOverview = function() {
  setupOverlay();
  setupLists();
  setupAddList();
};

var setupQuickNew = function() {
  $('#title').select();
};

var setupRegister = function() {
  setupUserForm($('#registration_form'));
};

var setupUserForm = function(formElement) {
  var usernameElement = formElement.find('.username');
  var passphraseElement = formElement.find('.passphrase');
  var passphraseConfirmationElement = formElement.find('.passphrase_confirmation');
  var emailElement = formElement.find('.email');

  // Initial validation
  setInterval(function() {
    showValidation(usernameElement, validateUsername);
    showValidation(passphraseElement, validatePassphrase);
    showValidation(passphraseConfirmationElement, validatePassphraseConfirmation);
    showValidation(emailElement, validateEmail);
  }, 1000);

  usernameElement.find('input').keyup(function(e) {
    showValidation(usernameElement, validateUsername);
  });
  passphraseElement.find('input').keyup(function(e) {
    showValidation(passphraseElement, validatePassphrase);
  });
  passphraseConfirmationElement.find('input').keyup(function(e) { 
    showValidation(passphraseConfirmationElement, validatePassphraseConfirmation);
  });
  emailElement.find('input').keyup(function(e) {
    showValidation(emailElement, validateEmail);
  });

};

var showValidation = function(element, validator) {
  validator(element, function(ok) {
    changeValidation(element, ok);
  });
};

var validateUsername = function(element, callback) {
  var inputElement = element.find('input');
  var text = inputElement.val();

  if (text.length < 3 || text.length > 40) {
    callback(false);
    return;
  }
  callback(true);
};

var checkUsername = function(username, callback) {
  $.ajax({
    type: 'POST',
    url: '/api/username/check',
    data: { username: username }
  }).done(function() {
    callback(false);
  }).error(function() {
    callback(true);
  });
};

var validatePassphrase = function(element, callback) {
  var inputElement = element.find('input');
  var text = inputElement.val();

  if (text.length < 6 || text.length > 40) {
    callback(false);
    return;
  }
  callback(true);
};

var validatePassphraseConfirmation = function(element, callback) {
  var inputElement = element.find('input');
  var text = inputElement.val();
  var cmpText = element.closest('form').find('.passphrase input').val();

  callback(cmpText.length > 0 && text == cmpText);
};

var validateEmail = function(element, callback) {
  var inputElement = element.find('input');
  var text = inputElement.val();

  callback(text.length > 3 && text.match(/^\S+@\S+\.\w+$/));
};

var changeValidation = function(element, ok) {
  var statusElement = element.find('.status')
  if (ok) {
    statusElement.removeClass('fail').addClass('ok').text('ok');
  } else {
    statusElement.removeClass('ok').addClass('fail').text('✗');
  }
};

var setupLogin = function() {
  $('input[name=user]').select();
};

var setupCommon = function() {
  setupMouseOver();
  $('input').first().select();
};

$(document).ready(function() {
  setupCommon();

  if (window.location.pathname.match(/^\/$/)) {
    setupOverview();
  } else if (window.location.pathname.match(/^\/user/)) {
    setupUser();
  } else if (window.location.pathname.match(/quick_new/)) {
    setupQuickNew();
  } else if (window.location.pathname.match(/^\/register/)) {
    setupRegister();
  } else if (window.location.pathname.match(/^\/login/)) {
    setupLogin();
  }
});

