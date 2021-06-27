#!/usr/bin/env node
process.title = 'relaencli';
const program = require('commander');
let version = require('./package').version;
program
    .version(version, '', 'show version')
    .option('-i, --init', 'init config.json file')
    .option('-g, --generate', 'generate entity files');
program.helpOption('', 'show help');
program.parse(process.argv);
if (program.init) { //初始化配置文件
    initConfig();
}
else if (program.generate) { //生成entities
    require('./dist/core/generator').Generator.gen('config.json');
}
/**
 * 初始化配置文件
 */
function initConfig() {
    require('fs').writeFileSync('config.json', `{
            "dialect":"mysql",
            "options":{
                "host":"localhost",
                "port":3306,
                "user":"root",
                "password":"your parssword",
                "database":"your database",
                "schema":""    
            },
            
            "output":"out",
            "tableSplit":"_",
            "tableStart":1,
            "columnSplit":"_",
            "columnStart":0
        }`);
}
//# sourceMappingURL=index.js.map