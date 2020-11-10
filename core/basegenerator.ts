import { IConfig, IRelation, IColumn } from "./types";
import { Util } from "./util";

class BaseGenerator{
    config:IConfig;
    tables:Map<string,string>;
    relations:IRelation[];
    typeMap:object;
    /**
     * 字段映射
     */
    fieldTypes:any;

    constructor(config:IConfig){
        this.config = config;
        this.tables = new Map();
        let ds = require('fs').readFileSync('./config/' + this.config.product + '.json');
        this.typeMap = JSON.parse(ds); 
    }

    /**
     * 获取连接
     */
    async getConn(){}

    /**
     * 创建
     */
    async gen(){
        const pathMdl = require('path');
        const fsMdl = require('fs');

        //生成文件
        let path = pathMdl.resolve(this.config.output || '../');
        //创建目录
        if(!fsMdl.existsSync(path)){
            fsMdl.mkdirSync(path,{recursive:true});
        }

        let conn = await this.getConn();
        await this.genTables(conn);
        await this.genRelations(conn);
        for(let key of this.tables.keys()){
            let str = await this.genEntity(conn,key);
            fsMdl.writeFileSync(pathMdl.resolve(path,key.toLowerCase() + '.ts'),str);
        }
    }
    
    /**
     * 获取表名数组
     */
    async genTables(conn:any){}
    
     /**
     * 获取字段数组
     * @param conn          连接
     * @param tableName     表名
     * @returns             字段对象数组
     */
    async getFields(conn:any,tableName:string):Promise<IColumn[]>{
        return null;
    }

    /**
     * 处理关系
     * @param entityName 
     */
    async genRelations(conn:any){}

    /**
     * 写实体
     * @param entityName    实体名
     */
    async genEntity(conn:any,entityName:string):Promise<string>{
        let tn:string = this.tables.get(entityName);
        
        //引入relaen对象
        let relaenArr:string[] = ['BaseEntity','Entity','Column'];
        
        let entityArr:string[] = [];
        entityArr.push("@Entity(\"" + tn + "\",'"+ this.config.database +"')");
        entityArr.push("export class " + entityName + " extends BaseEntity{");
        //需要import的entity名
        let importEntities:string[] = [];
        let primaryKey:string;
        //字段集合 
        let fieldArr:IColumn[] = await this.getFields(conn,tn); 
        for(let r of fieldArr){
            this.updType(r);
            //id
            if(r.isPri){
                entityArr.push("\t@Id()");
                primaryKey = r.field;
                if(!relaenArr.includes('Id')){
                    relaenArr.push('Id');
                }
            }
            let relObj:IRelation = this.getRelation(entityName,r.field);
            
            //默认字符串
            let type:string;
            //varchar长度
            let length:number;
            
            if(relObj){ //关系字段
                type = relObj.refEntity;
            }else{
                type = r.tsType
            }
            
            //字段名
            let fn:string;
            if(relObj){ //引用字段
                if(relObj.refEntity !== entityName && !importEntities.includes(relObj.refEntity)){
                    importEntities.push(relObj.refEntity);
                }
                if(!relaenArr.includes('ManyToOne')){
                    relaenArr.push('ManyToOne');
                }
                if(!relaenArr.includes('JoinColumn')){
                    relaenArr.push('JoinColumn');
                }
                entityArr.push("\t@ManyToOne({entity:" + relObj.entity + ",lazyFetch:true})");
                entityArr.push("\t@JoinColumn({name:'" + r.field + "',refName:'" + relObj.column + "'})");
                fn = relObj.refName;
            }else{
                entityArr.push("\t@Column({");
                let colArr:string[] = [];
                colArr.push("\t\tname:'" + r.field + "'");
                colArr.push("\t\ttype:'" + r.type + "'");
                colArr.push("\t\tnullable:" + r.nullable);
                if(length){
                    colArr.push("\t\tlength:" + length)
                }
                entityArr.push(colArr.join("," + Util.getLineChar()));
                entityArr.push("\t})");
                fn = this.genName(r.field,this.config.columnSplit,this.config.columnStart,1);
            }
            entityArr.push("\t" + fn + ":" + type + ";");
            //加空白行
            entityArr.push("");
        }
        
        //one to many
        if(primaryKey){
            let arr:IRelation[] = this.getRefered(entityName,primaryKey);
            if(arr.length>0){
                if(!relaenArr.includes('OneToMany')){
                    relaenArr.push('OneToMany');
                }
                if(!relaenArr.includes('EFkConstraint')){
                    relaenArr.push('EFkConstraint');
                }
                for(let a of arr){
                    entityArr.push("\t@OneToMany({entity:'" + a.entity + "',onDelete:EFkConstaint." + 
                        a.delete + ",onUpdate:EFkConstraint." + a.update + ",mappedBy:'" + a.refName + "'" +
                        ",lazyFetch:true})");
                    entityArr.push("\t" + a.referedName + ':Array<' + a.entity + ">;");
                    entityArr.push("");
                    if(a.entity!==entityName && !importEntities.includes(a.entity)){
                        importEntities.push(a.entity);
                    }
                }
            }
        }

        entityArr.push("}");

        entityArr.unshift("");
        //插入import entities
        for(let i=importEntities.length-1;i>=0;i--){
            entityArr.unshift("import {" + importEntities[i] + "} from './" + importEntities[i].toLowerCase() + "'"); 
        }
        entityArr.unshift("import {" + relaenArr.join(',') + "} from 'relaen';")
        
        return entityArr.join(Util.getLineChar());
    }

    /**
     * 生成表名或字段名
     * @param name      源名
     * @param sp        分隔符
     * @param st        开始段
     * @param stUpcase  大写开始序号
     */
    genName(name:string,sp:string,st:number,stUpcase:number):string{
        let arrNames = [];
        if(sp){
            arrNames = name.split(sp);
            if(st>0){
                arrNames.splice(0,st);
            }
        }else{
            arrNames = [name];
        }
        //首字母大写
        for(let i=stUpcase;i<arrNames.length;i++){
            arrNames[i] = arrNames[i].substr(0,1).toUpperCase() + arrNames[i].substr(1);
        }
        return arrNames.join("");
    }
    
    /**
     * 通过tblname获取entityname
     * @param tblName   表名
     */
    getEntityByTbl(tblName:string):string{
        for(let o of this.tables){
            if(o[1] === tblName){
                return o[0];
            }
        }
    }

    getRelation(entity:string,column:string):IRelation{
        return this.relations.find(item=>{
            return item.entity === entity && item.column === column;
        });
    }
    
    /**
     * 获取被引用
     */
    getRefered(entity:string,column:string){
        return this.relations.filter((item)=>{
            return item.refEntity === entity && item.refColumn === column;
        });
    }

    /**
     * 更新类型，修改为ts类型并为字符串增加长度
     * @param column 
     */
    updType(column:IColumn){
        let co;
        for(let o in this.typeMap){
            if(column.type.indexOf(o) !== -1){
                co = this.typeMap[o];
                break;
            }
        }
        if(co){
            column.type = co.js;
            column.tsType = co.ts;
            if(co.length){
                column.length = co.length;
            }
        }else{ //默认字符串
            column.tsType = 'string';
            column.type = 'string';
        }
        if(column.type === 'string' && !column.length){
            let ind = column.type.indexOf('(');
            if(ind !== -1){
                let ind1 = column.type.indexOf(')');
                if(ind<ind1-1){
                    let s = column.type.substring(ind+1,ind1).trim();
                    if(s!==''){
                        column.length = parseInt(s);
                    }
                }
            }
        }
    }
}

export{BaseGenerator}