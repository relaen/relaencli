import { MysqlGenerator } from "./mysqlgenerator";

class Generator{
    static async gen(configPath?:string){
        configPath = configPath || 'config.json';
        //读文件
        const fs = require('fs');
        let data = fs.readFileSync(configPath,'utf8');
        if(!data){
            throw "file not exist";
        }
        let configObj:any;
        try{
            configObj = JSON.parse(data);
        }catch(e){
            throw e;
        }
        switch(configObj){
            case "oracle":

            break;
            case "mssql":
                break;

            default: //mysql
                let g = new MysqlGenerator(configObj);
                console.log('Relaen is generating entities...')
                await g.gen();
                console.log('Relaen has generated entities successfully!')
        }
    }
}

export {Generator};
