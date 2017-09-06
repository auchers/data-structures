// npm install cheerio

var fs = require('fs');
var cheerio = require('cheerio');

// load the thesis text file into a variable, `content`
var content = fs.readFileSync('m04.txt');

// load `content` into a cheerio object
// common practice to use $ for selections, but can use whatever
var $ = cheerio.load(content);

// print names of thesis students
// each requires function with iterator and element
$('table').eq(2).find('tbody').find('tr').each(function(i, elem) {
    var address = $(elem).find('td').eq(0).contents().filter(function(){ 
        return this.nodeType == 3;}).eq(2).text()
    console.log('this is element:' + i + ' and the element is:'+ address.trim() );
});

// print project titles
// looks first in class 'project' and then in class 'title'
// $('.project .title').each(function(i, elem) {
//     console.log($(elem).text());
// });

//helpful selectors in cheerio
//.eq( i ) -- can find nth number in list, find, 