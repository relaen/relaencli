# Relaen-cli
Relaen-cli是relaen的客户端工具，主要用于生成数据表对应实体。

## 安装方式
npm install relaen-cli -g
## 依赖包
需要依赖对应数据库的npm包，如npm mysql，npm oracle，npm mssql，npm pg(postgres)等。如：dialect为mysql，则需要执行npm install mysql -g 以安装mysql npm包。

## 使用方式
1. relaen-cli -i : 生成配置文件config.json；
2. relaen-cli -g : 生成实体类文件，存放于config.json文件对应output指定目录下。

## 生成说明
### 实体命名规则
实体名为每个单词首字母大写，生成方式配合配置文件中的tableSplit和tableStart。  
举例：  
数据库表名为t_user_info，tableSplit='_'，tableStart=1，则实体名为 UserInfo。

### 字段属性命名规则
属性名为首单词首字母小写，其余单词首字母大写，满足驼峰标识，生成方式配合配置文件中的columnSplit和columnStart。  
举例：  
字段名为user_name，columnSplit='_'，columnStart=0，则属性名为 userName。

## 配置文件-config.json
配置项|说明|类型|是否必填|可选值|备注
-|-|-|-|-|-
dialect|数据库|string|是|mysql,oracle,mssql,postgres
options|数据库连接属性对象|object|是|无|需要root或管理员权限
database|数据库名|string|是|无|
output|输出目录|string|是|无|相对于根目录
tableSplit|表名单词分隔符|string|是|无|
tableStart|表名单词开始段(以tableSplit分段)|string|是|无|
columnSplit|表名单词分隔符|string|是|无|
columnStart|字段名单词开始段(以tableSplit分段)|string|是|无|

### options配置项
配置项|说明|类型|是否必填|可选值|备注
-|-|-|-|-|-
host|服务器地址|string|是|无|
port|端口号|number|否|无|不同dialect默认port不同
user|用户名|string|是|无|
password|密码|string|是|无|
database|数据库名|string|是|无|
schema|模式名|string|否|无|不同dialect默认schema不同

## 使用限制
1. 目前支持mysql、oracle、mssql、postgres数据库；
2. 不支持复合主键；
3. oracle、mssql、postgres支持schema；
4. oracle仅支持12c以上。

## 升级日志
### 1.0.9
1. 增加关联字段getter的代理代码。
### 1.1.0
1. 删除关联对象的eager属性。
### 1.1.1
1. 删除OneToMany的onDelete和onUpdate属性；
2. 修复string类型的length不生成bug。
### 1.1.2
1. 实体属性变为public，普通属性不生成setter和getter方法，关联属性不生成setter方法；
2. 关联属性getter方法增加属性值判断。
### 1.1.3
1. 修改已知bug.
### 1.1.4
1. 增加oracle、mssql、postgres支持;
2. 增加schema配置。
