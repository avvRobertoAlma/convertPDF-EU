const fs = require('fs');
const path = require('path');
const extract = require('pdf-text-extract');

const SOURCE = process.argv[2]
const OUTPUT = process.argv[3]

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
console.log(pdfs)




let processed = 0;
pdfs.delayedForEach((file)=>{
    extract(file, {splitPages: false}, function(err, data){
        if(err){
            console.log(err);
        } else {
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
}, 0.5);




function listPdfs(list){
    const newList = list.filter((element)=>{
        const splitted = element.split('.')
        const extName = splitted[splitted.length-1]
        return extName == 'pdf'
    })
    return newList
}