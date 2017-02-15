//An array of strings
var days = {};
var array = ["2017-01-20", "2017-02-14"];

array.forEach(function(elm) {
  days[elm] = 10;
});

console.log(days);