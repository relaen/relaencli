import { BaseGenerator } from "../basegenerator";
import { IColumn, IRelation } from "../types";

/**
 * sqlite 生成器
 */
class SqliteGenerator extends BaseGenerator {

    /**
     * 获取连接
     * @returns 数据库连接对象 
     */
    async getConn() {
        const db = require("sqlite3");
        return await new Promise((resolve, reject) => {
            new db.Database(this.config.options.database, function(err) {
                if (err) return reject(err);
                resolve(this);
            });
        });
    }

    /**
     * 关闭连接
     * @param conn 数据库连接对象
     */
    async closeConn(conn:any) {
        return new Promise((resolve, reject) => {
            conn.close((err) => {
                if (err) {
                    return reject(err);
                }
                resolve(null);
            });
        });
    }

    /**
     * 生成表实体
     * @param conn  数据库连接对象
     */
    async genTables(conn: any) {
        let results: Array<any> = await new Promise((resolve, reject) => {
            conn.all("SELECT tbl_name FROM sqlite_master WHERE type = 'table' AND name != 'sqlite_sequence'", (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });

        for (let r of results) {
            let props = Object.getOwnPropertyNames(r);
            let tn = r[props[0]];
            //entity name
            let en: string = this.genName(tn, this.config.tableSplit, this.config.tableStart, 0);
            this.tables.set(en, tn);
        }
    }

    /**
     * 获取字段数组
     * @param conn          连接
     * @param tableName     表名
     * @returns             字段对象数组
     */
    async getFields(conn: any, tableName: string): Promise<IColumn[]> {
        let results: Array<any> = await new Promise((resolve, reject) => {
            conn.all("PRAGMA table_info(" + tableName + ")", (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });

        let arr: IColumn[] = [];
        for (let r of results) {
            arr.push({
                field: r.name,
                isPri: r.pk === 1,
                type: r.type,
                nullable: r.notnull === 0
            })
        }
        return arr;
    }

    /**
     * 处理关系
     * @param entityName 
     */
    async genRelations(conn: any) {
        let relArr: IRelation[] = [];
        for (let table of this.tables.values()) {
            let rels: Array<any> = await new Promise((resolve, reject) => {
                conn.all("PRAGMA foreign_key_list(" + table + ")", (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                })
            });
            for (let rel of rels) {
                relArr.push({
                    column: rel.from, //字段名
                    refColumn: rel.to,//引用字段名
                    // delete: Util.getConstraintRule(rel.on_delete),
                    // update: Util.getConstraintRule(rel.on_update),
                    entity: this.getEntityByTbl(table),
                    refEntity: this.getEntityByTbl(rel.table)
                });
            }
        }
        this.handleRelation(relArr);
    }
}

export { SqliteGenerator };