// npm install cheerio

var fs = require('fs');
var cheerio = require('cheerio');
var content = fs.readFileSync('m04.txt');

var $ = cheerio.load(content);

//select the third table and then iterate through its rows
$('table').eq(2).find('tbody tr').each(function(i, elem) {
    
    var address = $(elem).find('td')
                        .eq(0) // first cell in each row
                        .contents() //get all the cell contents
                        // .filter(function(){ return this.nodeType == 3;})  // filter out only text nodes
                        .eq(6) //select the 6th one
                        .text()
                        .trim()
                        .replace(/\n/g, "") //remove line break
                        .replace(/\t/g, ""); 
        
    console.log('address # ' + i + ' is: ' + address);
});
