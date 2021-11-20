/**
 * 配置对象
 */
interface IConfig {

    /**
     * 数据库类型  mysql oracle mssql postgres sqlite mariadb
     */
    dialect: string,

    /**
     * 数据库连接配置项，根据 node 环境下的各数据库配置说明进行配置
     */
    options: any,

    /**
     * 输出目录
     */
    output: string,

    /**
     * 表名分割符，生成实体类名时需要，如t_user_info, '_'表示分隔符，默认无
     */
    tableSplit?: string,

    /**
     * 表名开始索引，如t_user_info,如果为1，则表名为 UserInfo，单词首字母大写，默认为0
     */
    tableStart?: number,

    /**
     * 字段名分割符，生成属性名时需要，如c_user_name, '_'表示分隔符，默认无
     */
    columnSplit?: string,

    /**
     * 字段名开始索引，如c_user_name,如果为1，则字段名为 userName(驼峰标识)，默认为0
     */
    columnStart?: number

    /**
     * 数据库模式schema，适用部分数据库
     */
    schema?: string;
}

/**
 * 字段对象(表)
 */
interface IColumn {

    /**
     * 字段名
     */
    field: string;

    /**
     * 数据类型
     */
    type: string;

    /**
     * 是否主键
     */
    isPri: boolean;

    /**
     * 是否可空
     */
    nullable: boolean;

    /**
     * typescript 类型
     */
    tsType?: string;

    /**
     * 字段定义长度
     */
    length?: number;

    /**
     * 是否自增（mssql）更新新增不添加
     */
    identity?: boolean;
}

/**
 * relation 接口
 */
interface IRelation {

    /**
     * 删除规则
     */
    // delete: string;

    /**
     * 更新规则
     */
    // update: string;

    /**
     * 实体名
     */
    entity: string;

    /**
     * 引用实体名
     */
    refEntity: string;

    /**
     * 字段名
     */
    column: string;
    
    /**
     * 引用字段名
     */
    refColumn: string;

    /**
     * 引用属性名(many to one关系 one对应属性名)
     */
    refName1?: string;

    /**
     * 引用属性名(one to many关系 many对应属性名)
     */
    refName2?: string;
}

export { IConfig, IRelation, IColumn }