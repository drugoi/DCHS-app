angular.module('dchs.services', [])
.filter('getById', function() {
  return function(input, id) {
    var i=0, len=input.length;
    for (; i<len; i++) {
      if (+input[i].id == +id) {
        return input[i];
      }
    }
    return null;
  }
}).filter('articles', function() {
  return function(arr, start, end) {
    return (arr || []).slice(start, end);
  }
}).factory('category', function() {
  return {};
});
