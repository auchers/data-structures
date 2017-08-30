var request = require('request');
var fs = require('fs');
var base_url = 'http://visualizedata.github.io/datastructures/data/';

var file = ['m01','m02','m03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10'];

file.forEach (function(f,i) {
    // console.log('in for loop for '+f);
    request(base_url+f+'.html', function (error, response, body) {
        // console.log('past request for '+ f);
      if (!error && response.statusCode == 200) {
        // console.log('writing file for '+ f);
        fs.writeFileSync('/home/ubuntu/workspace/assignment1/data/'+f+'.txt', body);
        // console.log('done writing file '+ f);
      }
      else {console.error('request failed')};
    });
});
    