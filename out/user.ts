import {BaseEntity,Entity,Column,Id,OneToMany,EntityProxy} from '../..';
import {Shop} from './shop';

@Entity("T_USER","C##FRANK2")
export class User extends BaseEntity{
	@Id()
	@Column({
		name:'USER_ID',
		type:'number',
		nullable:false
	})
	public userId:number;

	@Column({
		name:'NAME',
		type:'string',
		nullable:true,
		length:255
	})
	public name:string;

	@OneToMany({
		entity:'Shop',
		mappedBy:'user'
	})
	public shops:Array<Shop>;

	constructor(idValue?:number){
		super();
		this.userId = idValue;
	}
	public async getShops():Promise<Array<Shop>>{
		return this['shops']?this['shops']:await EntityProxy.get(this,'shops');
	}
}