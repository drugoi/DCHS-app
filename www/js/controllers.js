angular.module('dchs.controllers', []).controller('IntroWelcome', function($scope) {}).controller('IntroSettings', function($scope, $window) {
    $scope.phones = phoneNumbers;
    $scope.phonesCount = phoneNumbers.length;
    $scope.sosMessage = '';
    $scope.sos__placeholder = window.localStorage.sos__message;
    $scope.addContact = function() {
      var isPhoneExist = function(phone) {
        var exist = false;
        if (phoneNumbers.length) {
          for (var i = 0; i < phoneNumbers.length; i++) {
            if (phoneNumbers[i].phone == phone) {
              exist = true;
            }
          }
        }
        return exist;
      }
      navigator.contacts.pickContact(function(contact) {
        if (contact.phoneNumbers === null) {
          alert('У этого контакта нет номера телефона.')
        } else if (contact.phoneNumbers[0].value) {
          var phone = JSON.stringify(contact.phoneNumbers[0].value).replace('+7', '8');
          if (isPhoneExist(phone)) {
            alert('Этот контакт уже существует.');
          } else {
            phoneNumbers.push({
              name: contact.displayName,
              phone: phone
            });
            window.localStorage.phones = JSON.stringify(phoneNumbers);
            $scope.$apply(function() {
              $scope.phones = phoneNumbers;
              $scope.phonesCount = phoneNumbers.length;
            });
          }
        }
      }, function(err) {
          console.error('Error: ' + err);
      });
    };
    $scope.removeContact = function(id) {
        if ($window.confirm('Вы действительно хотите удалить данный контакт из списка рассылки?')) {
            phoneNumbers.splice(id, 1);
            $scope.phonesCount = phoneNumbers.length;
            window.localStorage.phones = JSON.stringify(phoneNumbers);
        }
    };
    $scope.saveMessage = function(text) {
        window.localStorage.sos__message = '';
        window.localStorage.sos__message = text;
    };
    $scope.saveIntro = function() {
        window.localStorage.intro = true;
    };
}).controller('SosCtrl', function($scope) {
    var updateInt, flashingInt, startflashInt, progressInt;
    var startUpdate = 0;
    var $sos__button = $('.sos');
    var progressUtils = {
        startProgress: function() {
          $sos__button.addClass('_pressed');
          setTimeout(progressUtils.startCount, 100);
        },
        startCount: function() {
            if ($sos__button.hasClass('_pressed')) {
                progressInt = setInterval(progressUtils.incrementProgress, 60);
            }
        },
        incrementProgress: function() {
            if (startUpdate === 60) {
                console.info();
                clearInterval(updateInt);
                clearInterval(progressInt);
                $sos__button.addClass('_flashing _pressed');
                if (window.localStorage.sos__flash === 'true') flashUtils.start();
                smsUtils.collect();
            } else {
                $sos__button.css('background-image', 'url(img/sos/' + startUpdate + '.png)');
                startUpdate += 1;
            }
        },
        clearAll: function() {
            startUpdate = 0;
            clearTimeout(startflashInt);
            clearInterval(updateInt);
            clearInterval(flashingInt);
            clearInterval(progressInt);
            $sos__button.removeClass('_flashing _pressed').css('background-image', 'url(img/sos/0.png)');
            window.plugins.flashlight.switchOff();
        }
    };
    var buttonUtils = {
        releaseButton: function() {
            if (startUpdate !== 60) progressUtils.clearAll();
        }
    };
    var smsUtils = {
        collect: function() {
            if (window.localStorage.sos__gps === 'true') {
              if (window.localStorage.sos__location === undefined) {
                var smsMessage = helpers.translit(window.localStorage.sos__message)
              } else {
                var smsMessage = helpers.translit(window.localStorage.sos__message) + window.localStorage.sos__location;
              }
            } else {
                var smsMessage = helpers.translit(window.localStorage.sos__message);
            }
            console.info(smsMessage);
            for (var i = 0; i < phoneNumbers.length; i++) {
                var currentPhone = phoneNumbers[i].phone;
                var messageInfo = {
                    phoneNumber: currentPhone,
                    textMessage: smsMessage
                };
                smsUtils.send(messageInfo);
            }
        },
        send: function(messageInfo) {
          var smsPhone = messageInfo.phoneNumber.replace(/ /g, '').replace(/['"]+/g, '');
          var smsText = messageInfo.textMessage;
          SMS.sendSMS(smsPhone, smsText, function() {}, function(str) {
            console.info(str);
          });
        }
    };
    var flashUtils = {
        start: function() {
          flashingInt = setInterval(flashUtils.flash, 100);
        },
        flash: function() {
          window.plugins.flashlight.switchOn();
          window.plugins.flashlight.switchOff();
        }
    };
    $sos__button.on('touch tap', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if ($sos__button.hasClass('_flashing') || $sos__button.hasClass('_pressed')) {
            progressUtils.clearAll();
        } else {
            progressUtils.startProgress();
        }
    });
    $sos__button.on('release', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if ($sos__button.hasClass('_pressed')) buttonUtils.releaseButton();
    });
/*
  $sos__button.on('tap', function(event) {
    console.info(event.type);
    event.preventDefault();
    event.stopImmediatePropagation();
    if ($sos__button.hasClass('_flashing') || $sos__button.hasClass('_pressed')) progressUtils.clearAll();
  });
*/
}).controller('SosPhonesCtrl', function($scope) {
    var emergencyСalls = [{
        number: '112',
        title: 'ДЧС г. Алматы'
    }, {
        number: '101',
        title: 'Пожарная служба'
    }, {
        number: '102',
        title: 'Полиция'
    }, {
        number: '103',
        title: 'Скорая помощь'
    }, {
        number: '104',
        title: 'Служба газа'
    }, {
        number: '109',
        title: 'Служба спасения'
    }];
    $scope.phones = emergencyСalls;
}).controller('SettingsCtrl', function($scope, $ionicNavBarDelegate, $window) {
    // ! Settings Controller
    $scope.sos__gps = window.localStorage.sos__gps;
    $scope.sos__flash = window.localStorage.sos__flash;
    $scope.sosMessage = window.localStorage.sos__message;
    $scope.sos__message = window.localStorage.sos__message;
    $scope.phones = phoneNumbers;
    $scope.phonesCount = phoneNumbers.length;
    $scope.goBack = function() {
      $ionicNavBarDelegate.back();
    };
    $scope.addContact = function() {
      var isPhoneExist = function(phone) {
        var exist = false;
        if (phoneNumbers.length) {
          for (var i = 0; i < phoneNumbers.length; i++) {
            if (phoneNumbers[i].phone == phone) {
              exist = true;
            }
          }
        }
        return exist;
      }
      navigator.contacts.pickContact(function(contact) {
        if (contact.phoneNumbers === null) {
          alert('У этого контакта нет номера телефона.')
        } else if (contact.phoneNumbers[0].value) {
          var phone = JSON.stringify(contact.phoneNumbers[0].value).replace('+7', '8');
          if (isPhoneExist(phone)) {
            alert('Этот контакт уже существует.');
          } else {
            phoneNumbers.push({
              name: contact.displayName,
              phone: phone
            });
            window.localStorage.phones = JSON.stringify(phoneNumbers);
            $scope.$apply(function() {
              $scope.phones = phoneNumbers;
              $scope.phonesCount = phoneNumbers.length;
            });
          }
        }
      }, function(err) {
          console.error('Error: ' + err);
      });
    };
    $scope.removeContact = function(id) {
      var ask = $window.confirm('Вы действительно хотите удалить данный контакт из списка рассылки?');
      if (ask) {
        phoneNumbers.splice(id, 1);
        $scope.phonesCount = phoneNumbers.length;
        window.localStorage.phones = JSON.stringify(phoneNumbers);
      }
    };
    $scope.saveMessage = function(message) {
        window.localStorage.sos__message = '';
        window.localStorage.sos__message = message;
    };
    $scope.changeOptions = function(type, state) {
      window.localStorage[type] = state;
    };
}).controller('InfoCtrl', function($scope, $ionicNavBarDelegate) {
    // ! Settings Controller
    $scope.goBack = function() {
        $ionicNavBarDelegate.back();
    };
}).controller('NewsCtrl', function($scope) {
  $scope.news = JSON.parse(window.localStorage.news);
}).controller('NewsItemCtrl', function($scope, $stateParams, $filter) {
  var newsItems = JSON.parse(window.localStorage.news);
  var found = $filter('getById')(newsItems, $stateParams.newsId);
  $scope.news_title = found.title;
  $scope.news_content = found.content;
}).controller('ArticlesCtrl', function($scope, $ionicScrollDelegate, $filter, category) {
  // ! create articles category html
  $scope.openCategory = category;
  var categories = JSON.parse(window.localStorage.categories);
  $scope.articlesCats = categories;
  for (var i = 1; i <= categories.length; i++) {
    var articleItem = 'articles_' + i;
    var catItem = 'category_' + i;
    $scope[articleItem] = JSON.parse(window.localStorage[catItem]);
  }
}).controller('ArticlesCategoryCtrl', function($scope, $filter, $ionicScrollDelegate, category) {
  $scope.openCategory = category;
  $scope.showMore = true;
  $scope.itemStart = 0;
  $scope.itemEnd = 3;
  $scope.init = function(id) {
    var opened = 'category_' + id;
    if ($scope.openCategory[opened]) {
      $scope.showMore = false;
      $scope.itemEnd = $scope.openCategory[opened];
    }
  }
  $scope.getCategory = function(id) {
    var articlesItems = 'articles_' + id;
    return $scope[articlesItems];
  };
  $scope.getAllArticles = function(count, id) {
    var opened = 'category_' + id;
    $scope.openCategory[opened] = count;
    $scope.itemEnd = count;
    $scope.showMore = false;
    $ionicScrollDelegate.resize();
    console.info($scope.openCategory);
  }
}).controller('ArticleItemCtrl', function($scope, $stateParams, $filter) {
  var articles = JSON.parse(window.localStorage['category_' + $stateParams.catId]);
  var found = $filter('getById')(articles, $stateParams.articleId);
  $scope.article_title = found.title;
  $scope.article_content = found.content;
}).controller('TabController', function($scope, $ionicNavBarDelegate) {
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
  };
});