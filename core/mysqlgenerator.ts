import { IConfig,IRelation, IColumn } from "./types";
import { Util } from "./util";
import { BaseGenerator } from "./basegenerator";


class MysqlGenerator extends BaseGenerator{
    
    constructor(config:IConfig){
        super(config);
    }

    async getConn(){
        const db = require('mysql');
        return await db.createConnection(this.config.options);
    }

    
    /**
     * 获取表名数组
     */
    async genTables(conn:any){
        await this.changeDb(conn,this.config.database);
        let results:Array<any> = await new Promise((resolve,reject)=>{
            conn.query("show tables",
            (error,results,fields)=>{
                if(error){
                    reject(error);
                }
                resolve(results);
            });
        });
        
        for(let r of results){
            let props = Object.getOwnPropertyNames(r);
            let tn = r[props[0]];
            //entity name
            let en:string = this.genName(tn,this.config.tableSplit,this.config.tableStart,0);
            this.tables.set(en,tn);
        }
    }

    /**
     * 获取字段数组
     * @param conn          连接
     * @param tableName     表名
     * @returns             字段对象数组
     */
    async getFields(conn:any,tableName:string):Promise<IColumn[]>{
        let results:Array<any> = await new Promise((resolve,reject)=>{
            conn.query("desc " + tableName,
            (error,results,fields)=>{
                if(error){
                    reject(error);
                }
                resolve(results);
            });
        });

        let arr:IColumn[] = [];
        for(let r of results){
            arr.push({
                field:r.Field,
                isPri:r.Key === 'PRI',
                type:r.Type,
                nullable:r.Null === 'YES'
            })
        }
        return arr;
    }

    /**
     * 处理关系
     * @param entityName 
     */
    async genRelations(conn:any){
        await this.changeDb(conn,"information_schema");

        let sql:string = "select constraint_name,table_name,column_name,referenced_table_name,referenced_column_name from key_column_usage "+
            "where referenced_column_name is not null and table_schema='"+ this.config.database + "'";
        let results:Array<any> = await new Promise((resolve,reject)=>{
            conn.query(sql,
            (error,results,fields)=>{
                if(error){
                    reject(error);
                }
                resolve(results);
            });
        });
        let relArr:IRelation[] = [];
        for(let r of results){
            //外键delete和update规则
            let constraintName:string = r.constraint_name;
            sql = "select update_rule,delete_rule from referential_constraints "+
            "where UNIQUE_CONSTRAINT_SCHEMA='" + this.config.database + "' and CONSTRAINT_NAME='" + constraintName + "'";
            let results1:Array<any> = await new Promise((resolve,reject)=>{
                conn.query(sql,
                (error,results,fields)=>{
                    if(error){
                        reject(error);
                    }
                    resolve(results);
                });
            });
            if(results1.length>0){
                let r1 = results1[0];
                relArr.push({
                    column:r.column_name, //字段名
                    refColumn:r.referenced_column_name,//引用字段名
                    delete:Util.getConstraintRule(r1.delete_rule),
                    update:Util.getConstraintRule(r1.update_rule),
                    entity:this.getEntityByTbl(r.table_name),
                    refEntity:this.getEntityByTbl(r.referenced_table_name)
                });
            }
        }

        let map:Map<string,IRelation[]> = new Map();
        //1 按ref entity归类
        for(let o of relArr){
            let key = o.refEntity + ',' + o.entity;
            if(!map.has(key)){
                map.set(key,[o]);
            }else{
                map.get(key).push(o);
            }
        }

        //2 设置被引用名
        for(let o of map){
            if(o[1].length>1){
                for(let o1 of o[1]){
                    let cn:string = this.genName(o1.column,this.config.columnSplit,this.config.columnStart,0);
                    //many to one 引用名
                    o1.refName = o1.refEntity.substr(0,1).toLowerCase() + o1.refEntity.substr(1) + 'For' + cn;
                    //one to many mapped name
                    o1.referedName = o1.entity.substr(0,1).toLowerCase() + o1.entity.substr(1) + 'For' + cn + 's';
                }
            }else{
                o[1][0].refName = o[1][0].refEntity.substr(0,1).toLowerCase() + o[1][0].refEntity.substr(1);
                o[1][0].referedName = o[1][0].entity.substr(0,1).toLowerCase() + o[1][0].entity.substr(1) + 's';
            }
        }
        this.relations = relArr;
        await this.changeDb(conn,this.config.database);
    }


    

    /**
     * 切换数据库
     * @param db 数据库名
     */
    async changeDb(conn:any,db:string){
        await new Promise((resolve,reject)=>{
            conn.query("use " + db,
            (error,results,fields)=>{
                if(error){
                    reject(error);
                }
                resolve(results);
            });
        });
    }
}

export {MysqlGenerator};