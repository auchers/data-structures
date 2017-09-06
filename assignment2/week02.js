// npm install cheerio

var fs = require('fs');
var cheerio = require('cheerio');
var content = fs.readFileSync('m04.txt');

var $ = cheerio.load(content);

//select the third table and then iterate through its rows
$('table').eq(2).find('tbody tr').each(function(i, elem) {
    
    //go to the first cell of each row and filter out the nodes that are text - pick the second
    var address = $(elem).find('td').eq(0).contents().filter(function(){ 
        return this.nodeType == 3;}).eq(2).text().trim();
        //nodeType == 3 is text
        
    console.log('this is element:' + i + ' and the element is:' + address);
});
