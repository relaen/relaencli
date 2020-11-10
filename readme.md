# Relaen-cli
Relaen-cli是realean的客户端工具，主要用于生成数据表对应实体。

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
product|数据库产品名|string|是|mysql,oracle,mssql
options|数据库连接属性对象|object|是|无|需要root权限
database|数据库名|string|是|无|
output|输出目录|string|是|无|相对于根目录
tableSplit|表名单词分隔符|string|是|无|
tableStart|表名单词开始段(以tableSplit分段)|string|是|无|
columnSplit|表名单词分隔符|string|是|无|
columnStart|字段名单词开始段(以tableSplit分段)|string|是|无|

## 源文件说明
1. core目录  
核心文件目录
2. config  
数据库字段类型映射配置目录

## 使用限制
1. 目前只支持mysql数据库；
2. 不支持复合主键。

## 升级日志

