const fs = require('fs');
const path = require('path');
const extract = require('pdf-text-extract');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));

const SOURCE = config.SOURCE
const OUTPUT = config.OUTPUT

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

  /**
 * Find all files inside a dir, recursively.
 * @function getAllFiles
 * @param  {string} dir Dir path string.
 * @return {string[]} Array with all file names that are inside the directory.
 */
const getAllFiles = dir =>
fs.readdirSync(dir).reduce((files, file) => {
  const name = path.join(dir, file);
  const isDirectory = fs.statSync(name).isDirectory();
  return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
}, []);


const files = getAllFiles(SOURCE)



const pdfs = listPdfs(files)





let processed = 0;
pdfs.delayedForEach((file)=>{
    try {
        extract(file, {splitPages: false}, function(err, data){
            if(err){
                console.log(`errore sul file: ${file}`)
                console.log(err);
            } else {
                if (typeof(data) == 'object'){
                    data = data.join('');
                }
                const splitted = file.split('/')
                const name = splitted[splitted.length-1].split('.pdf')[0];
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
    } catch (err) {
        console.log(`errore sul file: ${file}`)
        console.log(err);
    }
    
}, 0.02);




function listPdfs(list){
    const newList = list.filter((element)=>{
        const splitted = element.split('.')
        const extName = splitted[splitted.length-1]
        return extName == 'pdf'
    })
    return newList
}