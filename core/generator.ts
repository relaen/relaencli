import { BaseGenerator } from "./basegenerator";
import { MysqlGenerator } from "./dialect/mysqlgenerator";
import { OracleGenerator } from "./dialect/oracleGenerator";
import { PostgresGennerator } from "./dialect/postgresgenerator";
import { MssqlGenerator } from "./dialect/mssqlgenerator";
import { SqliteGenerator } from "./dialect/sqlitegenerator";
import { MariadbGenerator } from "./dialect/mariadbgenerator";

class Generator {
    static async gen(configPath?: string) {
        configPath = configPath || 'config.json';
        //读文件
        const fs = require('fs');
        let data = fs.readFileSync(configPath, 'utf8');
        if (!data) {
            throw "file not exist";
        }
        let configObj: any;
        try {
            configObj = JSON.parse(data);
        } catch (e) {
            throw e;
        }
        let g: BaseGenerator;
        console.log('Relaen is generating entities...')
        switch (configObj.dialect) {
            case "oracle":
                g = new OracleGenerator(configObj);
                break;
            case "mssql":
                g = new MssqlGenerator(configObj);
                break;
            case "postgres":
                g = new PostgresGennerator(configObj);
                break;
            case "sqlite":
                g = new SqliteGenerator(configObj);
                break;
            case "mariadb":
                g = new MariadbGenerator(configObj);
                break;
            default: //mysql
                g = new MysqlGenerator(configObj);
        }
        await g.gen();
        console.log('Relaen has generated entities successfully!')
    }
}

export { Generator };