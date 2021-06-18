import { IConfig, IRelation, IColumn } from "./types";
import { Util } from "./util";
import { Dbtype } from "./dbtype";

/**
 * 基础生成器
 */
abstract class BaseGenerator {
    /**
     * 数据库配置，从config.json中获取
     */
    config: IConfig;
    /**
     * 表map {实体名:表名}
     */
    tables: Map<string, string>;

    /**
     * 外键关联数组
     */
    relations: IRelation[];
    /**
     * 数据库类型与js,ts类型关系
     */
    typeMap: object;

    constructor(config: IConfig) {
        this.config = config;
        this.tables = new Map();
        //读取数据库类型对象
        this.typeMap = Dbtype[this.config.dialect];
    }

    /**
     * 获取连接
     */
    abstract getConn();

    /**
     * 生成实体,表名map
     * @param conn          数据库连接对象
     */
    abstract genTables(conn: any);

    /**
    * 获取字段数组
    * @param conn          连接
    * @param tableName     表名
    * @returns             字段对象数组
    */
    abstract getFields(conn: any, tableName: string): Promise<IColumn[]>;

    /**
     * 生成外键关系
     * @param conn          数据库连接对象
     */
    abstract genRelations(conn: any);

    /**
     * 创建所有实体
     */
    async gen() {
        const pathMdl = require('path');
        const fsMdl = require('fs');

        //生成文件
        let path = pathMdl.resolve(this.config.output || '../');
        //创建目录
        if (!fsMdl.existsSync(path)) {
            fsMdl.mkdirSync(path, { recursive: true });
        }

        let conn = await this.getConn();
        //生成实体，表映射
        await this.genTables(conn);
        //生成外键关系
        await this.genRelations(conn);
        //生成并写实体文件
        for (let key of this.tables.keys()) {
            let str = await this.genEntity(conn, key);
            fsMdl.writeFileSync(pathMdl.resolve(path, key.toLowerCase() + '.ts'), str);
        }
    }

    /**
     * 写实体
     * @param entityName    实体名
     */
    async genEntity(conn: any, entityName: string): Promise<string> {
        let tn: string = this.tables.get(entityName);

        //引入relaen对象
        let relaenArr: string[] = ['BaseEntity', 'Entity', 'Column'];
        //设置get和set的字段数组{fn:字段名,type:类型,ref:是否外键}
        let getterFieldArr: object[] = [];
        let entityArr: string[] = [];
        entityArr.push(`@Entity("${tn}"` + (this.config.schema ? `,"${this.config.schema}"` : '') + ')');
        entityArr.push("export class " + entityName + " extends BaseEntity{");
        //需要import的entity名
        let importEntities: string[] = [];
        //主键字段
        let primaryKey: string;

        //主键字段对应属性
        let primaryProp: string;
        //主键类型
        let primaryType: string;
        //字段集合 
        let fieldArr: IColumn[] = await this.getFields(conn, tn);
        for (let r of fieldArr) {
            this.updType(r);
            //id
            if (r.isPri) {
                entityArr.push("\t@Id()");
                primaryKey = r.field;
                if (!relaenArr.includes('Id')) {
                    relaenArr.push('Id');
                }
            }
            let relObj: IRelation = this.getRelation(entityName, r.field);

            //默认字符串
            let type: string;

            //字段名
            let fn: string;
            //非引用字段或主键，外键作为主键，需要设置主键字段和引用对象(即设置两次)
            if (!relObj || r.isPri) {
                type = r.tsType
                entityArr.push("\t@Column({");
                let arr: string[] = [];
                arr.push("\t\tname:'" + r.field + "'");
                arr.push("\t\ttype:'" + r.type + "'");
                arr.push("\t\tnullable:" + r.nullable);
                if (r.type === 'string' && r.length && r.length > 0) {
                    arr.push("\t\tlength:" + r.length)
                }
                if (r.identity && typeof r.identity == 'boolean') {
                    arr.push("\t\tidentity:" + r.identity);
                }
                entityArr.push(arr.join("," + Util.getLineChar()));
                entityArr.push("\t})");
                fn = this.genName(r.field, this.config.columnSplit, this.config.columnStart, 1);
                //加入getter数组
                getterFieldArr.push({ fn: fn, type: type });
                entityArr.push("\tpublic " + fn + ":" + type + ";");
                //加空白行
                entityArr.push("");
                //如果是主键，则处理主键属性名和类型
                if (r.isPri) {
                    primaryProp = fn;
                    primaryType = type;
                }
            }
            if (relObj) { //引用字段
                type = relObj.refEntity;
                if (relObj.refEntity !== entityName && !importEntities.includes(relObj.refEntity)) {
                    importEntities.push(relObj.refEntity);
                }

                if (!relaenArr.includes('JoinColumn')) {
                    relaenArr.push('JoinColumn');
                }
                //关系名，如果为主键，则为OneToOne否则为ManyToOne
                let relName: string = r.isPri ? 'OneToOne' : 'ManyToOne';
                if (r.isPri) {
                    entityArr.push("\t@OneToOne({entity:'" + relObj.refEntity + "'})");
                } else {
                    entityArr.push("\t@ManyToOne({entity:'" + relObj.refEntity + "'})");
                }

                if (!relaenArr.includes(relName)) {
                    relaenArr.push(relName);
                }

                entityArr.push("\t@JoinColumn({");
                let arr: string[] = [];
                arr.push("\t\tname:'" + r.field + "'");
                arr.push("\t\trefName:'" + relObj.refColumn + "'");
                //如果外键为主键，则nullable为true，因为主键已经处理为nullable为false
                arr.push("\t\tnullable:" + (r.isPri ? true : r.nullable));
                entityArr.push(arr.join(',' + Util.getLineChar()));
                entityArr.push("\t})");
                fn = relObj.refName1;
                //加入getter数组
                getterFieldArr.push({ fn: fn, type: type, ref: relObj !== undefined });
                entityArr.push("\tpublic " + fn + ":" + type + ";");
                //加空白行
                entityArr.push("");
            }
        }

        //one to many
        if (primaryKey) {
            let arr: IRelation[] = this.getRefered(entityName, primaryKey);
            if (arr.length > 0) {
                if (!relaenArr.includes('OneToMany')) {
                    relaenArr.push('OneToMany');
                }
                // if(!relaenArr.includes('EFkConstraint')){
                //     relaenArr.push('EFkConstraint');
                // }
                for (let a of arr) {
                    entityArr.push("\t@OneToMany({");
                    let arr: string[] = [];
                    arr.push("\t\tentity:'" + a.entity + "'");
                    arr.push("\t\tmappedBy:'" + a.refName1 + "'");
                    // colArr.push("\t\tonDelete:EFkConstraint." + a.delete);
                    // colArr.push("\t\tonUpdate:EFkConstraint." + a.update);
                    entityArr.push(arr.join(',' + Util.getLineChar()));
                    entityArr.push("\t})");
                    //加入getter数组
                    let tp: string = 'Array<' + a.entity + ">";
                    getterFieldArr.push({ fn: a.refName2, type: tp, ref: true });
                    entityArr.push("\tpublic " + a.refName2 + ':' + tp + ';');
                    entityArr.push("");
                    if (a.entity !== entityName && !importEntities.includes(a.entity)) {
                        importEntities.push(a.entity);
                    }
                }
            }
        }

        //增加构造函数
        entityArr.push("\tconstructor(" + (primaryKey ? "idValue?:" + primaryType : "") + "){");
        // entityArr.push("\tconstructor(idValue?:" + primaryType + "){");
        entityArr.push("\t\tsuper();")
        if (primaryKey) {
            entityArr.push("\t\tthis." + primaryProp + " = idValue;");
        }
        entityArr.push("\t}");

        //添加set和get方法
        for (let a of getterFieldArr) {
            let fn = a['fn'];
            let type = a['type'];
            //首字母大写
            let bigP: string = fn.substr(0, 1).toUpperCase() + fn.substr(1);
            //getter方法

            if (a['ref']) {
                if (!relaenArr.includes('EntityProxy')) {
                    relaenArr.push('EntityProxy');
                }
                entityArr.push("\tpublic async get" + bigP + "():Promise<" + type + ">{");
                // entityArr.push("\t\tif(this['"+ fn +"'])return this['" + fn + "'];");
                entityArr.push("\t\treturn this['" + fn + "']?this['" + fn + "']:await EntityProxy.get(this,'" + fn + "');");
                entityArr.push("\t}");
            }
            else {  //非外键
                // entityArr.push("\tpublic get" + bigP + "():" + type + "{");
                // entityArr.push("\t\treturn this." + fn + ";");
                // entityArr.push("\t}");
            }

            // setter方法
            // entityArr.push("\tpublic set" + bigP + "(value:" + type + "){");
            // entityArr.push("\t\tthis." + fn + " = value;");
            // entityArr.push("\t}");
            // entityArr.push("");
        }
        //实体结束
        entityArr.push("}");
        //添加空行
        entityArr.unshift("");
        //插入import entities
        for (let i = importEntities.length - 1; i >= 0; i--) {
            entityArr.unshift("import {" + importEntities[i] + "} from './" + importEntities[i].toLowerCase() + "';");
        }

        // 引入relaen
        // 测试用
        // entityArr.unshift("import {" + relaenArr.join(',') + "} from '../..';")
        // 发布用
        entityArr.unshift("import {" + relaenArr.join(',') + "} from 'relaen';")
        return entityArr.join(Util.getLineChar());
    }

    /**
     * 处理relation为标准relation
     * @param relArr    关联数组
     */
    handleRelation(relArr: IRelation[]) {
        let map: Map<string, IRelation[]> = new Map();
        //1 按ref entity归类
        for (let o of relArr) {
            let key = o.refEntity + ',' + o.entity;
            if (!map.has(key)) {
                map.set(key, [o]);
            } else {
                map.get(key).push(o);
            }
        }

        //2 设置被引用名
        for (let o of map) {
            if (o[1].length > 1) {
                for (let o1 of o[1]) {
                    let cn: string = this.genName(o1.column, this.config.columnSplit, this.config.columnStart, 0);
                    //many to one 引用名
                    o1.refName1 = o1.refEntity.substr(0, 1).toLowerCase() + o1.refEntity.substr(1) + 'For' + cn;
                    //one to many mapped name
                    o1.refName2 = o1.entity.substr(0, 1).toLowerCase() + o1.entity.substr(1) + 'For' + cn + 's';
                }
            } else {
                o[1][0].refName1 = o[1][0].refEntity.substr(0, 1).toLowerCase() + o[1][0].refEntity.substr(1);
                o[1][0].refName2 = o[1][0].entity.substr(0, 1).toLowerCase() + o[1][0].entity.substr(1) + 's';
            }
        }
        this.relations = relArr;
    }
    /**
     * 生成实体名或字段属性名
     * @remarks         实体名为每个单词首字母大写，字段属性名为驼峰标识
     * @param name      源名
     * @param sp        分隔符
     * @param st        开始段
     * @param stUpcase  大写开始序号
     * @returns         生成的实体或字段属性名
     */
    genName(name: string, sp: string, st: number, stUpcase: number): string {
        let arrNames = [];
        if (sp) {
            arrNames = name.split(sp);
            if (st > 0) {
                arrNames.splice(0, st);
            }
        } else {
            arrNames = [name];
        }
        //首字母大写
        for (let i = stUpcase; i < arrNames.length; i++) {
            arrNames[i] = arrNames[i].substr(0, 1).toUpperCase() + arrNames[i].substr(1).toLowerCase();
        }
        // 保证字段名是小写开头的驼峰命名，oracle 
        if (stUpcase > 0) {
            arrNames[0] = arrNames[0].toLowerCase();
        }
        return arrNames.join("");
    }

    /**
     * 通过tblname获取entityname
     * @param tblName   表名
     * @returns         实体名
     */
    getEntityByTbl(tblName: string): string {
        for (let o of this.tables) {
            if (o[1] === tblName) {
                return o[0];
            }
        }
    }

    /**
     * 获取字段对应关系
     * @param entity    实体名
     * @param column    字段名
     * @returns         关系对象
     */
    getRelation(entity: string, column: string): IRelation {
        return this.relations.find(item => {
            return item.entity === entity && item.column === column;
        });
    }

    /**
     * 获取被引用
     */
    getRefered(entity: string, column: string) {
        return this.relations.filter((item) => {
            return item.refEntity === entity && item.refColumn === column;
        });
    }

    /**
     * 更新类型，修改为ts类型并为字符串增加长度
     * @param column 
     */
    updType(column: IColumn) {
        let co;
        for (let o in this.typeMap) {
            if (column.type.indexOf(o) !== -1) {
                co = this.typeMap[o];
                let ind1: number = column.type.indexOf('(');
                //针对char和varchar，如果带长度，则处理长度
                if (ind1 > 0) {
                    let ind2 = column.type.indexOf(')');
                    if (ind2 > ind1 + 1) {
                        let len = column.type.substring(ind1 + 1, ind2);
                        column.length = parseInt(len);
                    }
                }
                break;
            }
        }
        if (co) {
            column.type = co.js;
            column.tsType = co.ts;
        } else { //默认字符串
            column.tsType = 'string';
            column.type = 'string';
        }
    }
}

export { BaseGenerator }