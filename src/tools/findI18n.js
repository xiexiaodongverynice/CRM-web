/**
 * 查找多语言code
 * require node > V9.3
 * node src/tools/findI18n.js src/
 */
import consoleUtil from '../utils/consoleUtil';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const  _ = require('lodash');

const args = process.argv;

const dir = _.last(args);
if(!fs.lstatSync(dir).isDirectory()){
  consoleUtil.warn(`${dir} is not a directory!`);
}

// 匹配模式
const template = /(crmIntlUtil.)?fmtStr\('([\w|\d|\.]+)'(\s*,\s*'([\u4e00-\u9fa5|\w|\d]+)')?\)/i;

// 递归遍历文件夹内的所有文件
const listFiles = (dir, collections) => {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const fullPath = `${dir}/${f}`;
    const stat = fs.lstatSync(fullPath);
    if(stat.isDirectory()){
      listFiles(fullPath, collections);
    }else{
      if(path.extname(fullPath) === '.js'){
        collections.push(fullPath);
      }
    }
  });
  return collections;
};

// 文件集合
const fileCollections = listFiles(dir, []);

// 按行读取文件并取得匹配的字符
const readFilesByLine = (fileCollections) => {
  return Promise.all(fileCollections.map(f => {
    return new Promise((resolve, reject)=>{
      const codes = new Set();
      const rl = readline.createInterface({
        input: fs.createReadStream(f),
        crlfDelay: Infinity
      });

      rl.on('line', (line) => {
        if(template.test(line)){
          const matches = line.match(template);
          if(_.isArray(matches)){
            // 只取code
            const code = _.get(matches, '[2]');
            if(!_.isUndefined(code)){
              codes.add(`${code}`);
            }
          }
        }
      });
      rl.on('close', () => {
        resolve(codes);
      })
    });
  }));
}

// 打印输出
const printCodes = async () => {
  let temp = new Set();
  const codes = await readFilesByLine(fileCollections);
  codes.forEach(item => {
    item.forEach(k => {
      temp.add(k);
    })
  });
  let result = []
  temp.forEach(item => {
    result.push(item);
  })
  consoleUtil.info(`

  Found below:

  `);

  result.sort().forEach(item => {
    consoleUtil.info(item)
  })

  consoleUtil.info(`

  Total: ${result.length}

  `);
}

printCodes();
