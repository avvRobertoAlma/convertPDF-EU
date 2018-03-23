const fs = require('fs');
const path = require('path');
const extract = require('pdf-text-extract');

const SOURCE = './source';
const OUTPUT = './output';

Array.prototype.delayedForEach = function(callback, timeout, thisArg){
    var i = 0,
      l = this.length,
      self = this,
      caller = function(){
        callback.call(thisArg || self, self[i], i, self);
        (++i < l) && setTimeout(caller, timeout);
      };
    caller();
  };

fs.readdir(SOURCE, (err, list)=>{
    if(err){
       return console.log(err);
    }
    console.log(list);
    let processed = 0;
    list.delayedForEach((file)=>{
        const fileToConvertPath = path.join(SOURCE, file);
        extract(fileToConvertPath, {splitPages: false}, function(err, data){
            if(err){
                console.log(err);
            } else {
                const name = file.split('.pdf')[0];
                const newName = `${name}.txt`;
                const txtPath = path.join(OUTPUT, newName);
                fs.writeFile(txtPath, data, (err)=>{
                    if (err){
                        console.log(err);
                    }
                processed ++;
                console.log(`convertiti ${processed} files`);
                });
            }
        })
    }, 50);
})




