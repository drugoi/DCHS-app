var helpers = {
	translit: function(text) {
		var rus = "щ   ш  ч  ц  ю  я  ё  ж  ъ  ы  э  а б в г д е з и й к л м н о п р с т у ф х ь".split(/ +/g);
		var eng = "shh sh ch cz yu ya yo zh `` y' e` a b v g d e z i j k l m n o p r s t u f x `".split(/ +/g);
		var x;
		var engToRus = false;
		for (x = 0; x < rus.length; x++) {
			text = text.split(rus[x]).join(eng[x]);
			text = text.split(rus[x].toUpperCase()).join(eng[x].toUpperCase());
		}
		return text;
	},
	apiUrl: function(apiObj) {
		// apiObj = type, count, category, start, id
		var apiRequest = 'http://sos-dchs.kz/api.php?get=';
		switch (apiObj.type) {
		case 'newscount':
			apiRequest += 'newscount';
			break;
		case 'news':
			apiRequest += 'news';
			break;
		case 'articles':
			apiRequest += 'articles';
			break;
		case 'categories':
			apiRequest += 'categories';
			break;
		}
		if (apiObj.id) apiRequest += '&id=' + apiObj.id;
		if (apiObj.count) apiRequest += '&count=' + apiObj.count;
		if (apiObj.start) apiRequest += '&start=' + apiObj.start;
		if (apiObj.category) apiRequest += '&category=' + apiObj.category;
		return apiRequest;
	}
};
if (window.localStorage.phones) {
	var phoneNumbers = JSON.parse(window.localStorage.phones);
} else {
	var phoneNumbers = [];
}
if (!window.localStorage.last_newscount) window.localStorage.last_newscount = '0';
if (!window.localStorage.sos__message) window.localStorage.sos__message = 'Помогите, я попал в беду!';
if (!window.localStorage.sos__flash) window.localStorage.sos__flash = 'true';
if (!window.localStorage.sos__gps) window.localStorage.sos__gps = 'true';
angular.module('dchs', ['ionic', 'dchs.controllers', 'dchs.services']).run(function($ionicPlatform, $http) {
	$ionicPlatform.ready(function() {
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			StatusBar.styleDefault();
		}
		// ! get newsCount
		var getNewsCount = function() {
				$http.get(helpers.apiUrl({
					type: 'newscount'
				})).then(function(resp) {
					window.localStorage.newscount = resp.data.response;
					if (window.localStorage.last_newscount === '0') {
						window.localStorage.last_newscount = window.localStorage.newscount;
					} else if (window.localStorage.last_newscount !== window.localStorage.newscount) {
						window.localStorage.last_newscount = window.localStorage.newscount;
						// ! get last news
						getNews(window.localStorage.newscount);
					}
				}, function(err) {
					console.error('ERR', err.status);
				});
			};
		// ! get last news function
		var getNews = function(count) {
				$http.get(helpers.apiUrl({
					type: 'news',
					count: count
				})).then(function(resp) {
					window.localStorage.news = JSON.stringify(resp.data.response);
				}, function(err) {
					console.error('ERR', err.status);
				});
			};
		// ! get last news
		$http.get(helpers.apiUrl({
			type: 'newscount'
		})).then(function(resp) {
			window.localStorage.newscount = resp.data.response;
			if (window.localStorage.last_newscount === '0') {
				window.localStorage.last_newscount = window.localStorage.newscount;
			}
			getNews(window.localStorage.newscount);
		});
		// ! get categories
		$http.get(helpers.apiUrl({
			type: 'categories'
		})).then(function(resp) {
			window.localStorage.categories = JSON.stringify(resp.data.response);
			// ! get articles by category
			angular.forEach(resp.data.response, function(value) {
				var _this = value;
				$http.get(helpers.apiUrl({
					type: 'articles',
					category: _this.id,
					count: _this.articles
				})).then(function(resp) {
					var category = 'category_' + _this.id;
					window.localStorage[category] = JSON.stringify(resp.data.response);
				}, function(err) {
					console.error('ERR', err.status);
				});
			});
		}, function(err) {
			console.error('ERR', err.status);
		});
		var onSuccess = function(position) {
			window.localStorage.sos__location = ' Moi koordinaty: ' + position.coords.latitude + ', ' + position.coords.longitude;
		};
		var onError = function(error) {
			console.error('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
		};
		navigator.geolocation.getCurrentPosition(onSuccess, onError);
		var locationWatch = navigator.geolocation.watchPosition(onSuccess, onError);
		document.addEventListener('resume', getNewsCount, false);
	});
}).config(function($stateProvider, $urlRouterProvider) {
	$stateProvider.state('welcome', {
		url: '/intro-welcome',
		templateUrl: 'views/intro/intro-welcome.html',
		controller: 'IntroWelcome'
	}).state('welcome-settings', {
		url: '/intro-settings',
		templateUrl: 'views/intro/intro-settings.html',
		controller: 'IntroSettings'
	}).state('settings', {
		url: '/settings',
		templateUrl: 'views/templates/settings.html',
		controller: 'SettingsCtrl'
	}).state('info', {
		url: '/info',
		templateUrl: 'views/info.html',
		controller: 'InfoCtrl'
	}).state('sosphones', {
		url: '/phones',
		templateUrl: 'views/sos_phones.html',
		controller: 'SosPhonesCtrl'
	}).state('tab', {
		url: '/tab',
		abstract: true,
		templateUrl: 'views/templates/tabs.html'
	}).state('tab.sos', {
		url: '/sos',
		views: {
			'tab-sos': {
				templateUrl: 'views/templates/tab-sos.html',
				controller: 'SosCtrl'
			}
		}
	}).state('tab.news', {
		url: '/news',
		views: {
			'tab-news': {
				templateUrl: 'views/templates/tab-news.html',
				controller: 'NewsCtrl'
			}
		}
	}).state('tab.info', {
		url: '/info',
		views: {
			'tab-info': {
				templateUrl: 'views/templates/tab-info.html',
				controller: 'ArticlesCtrl'
			}
		}
	}).state('news', {
		url: '/news',
		abstract: true,
		templateUrl: 'views/news/news.html'
	}).state('news.item', {
		url: '/{newsId:[0-9]{1,4}}',
		views: {
			'tab-news': {
				templateUrl: 'views/news/news-item.html',
				controller: 'NewsItemCtrl'
			}
		}
	}).state('articles', {
		url: '/articles',
		abstract: true,
		templateUrl: 'views/articles/articles.html'
	}).state('articles.item', {
		url: '/:catId/{articleId:[0-9]{1,4}}',
		views: {
			'tab-info': {
				templateUrl: 'views/articles/articles-item.html',
				controller: 'ArticleItemCtrl'
			}
		}
	});
	if (!window.localStorage.intro) {
		$urlRouterProvider.otherwise('/intro-welcome');
	} else {
		$urlRouterProvider.otherwise('/tab/sos');
	}
});