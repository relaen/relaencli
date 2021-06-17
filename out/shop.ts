import {BaseEntity,Entity,Column,Id,JoinColumn,ManyToOne,EntityProxy} from '../..';
import {User} from './user';

@Entity("T_SHOP","C##FRANK2")
export class Shop extends BaseEntity{
	@Id()
	@Column({
		name:'SHOP_ID',
		type:'number',
		nullable:false
	})
	public shopId:number;

	@ManyToOne({entity:'User'})
	@JoinColumn({
		name:'OWNER_ID',
		refName:'USER_ID',
		nullable:true
	})
	public user:User;

	@Column({
		name:'MANAGER_ID',
		type:'number',
		nullable:true
	})
	public managerId:number;

	@Column({
		name:'SHOP_NAME',
		type:'string',
		nullable:true,
		length:255
	})
	public shopName:string;

	@Column({
		name:'ADDRESS',
		type:'string',
		nullable:true,
		length:255
	})
	public address:string;

	constructor(idValue?:number){
		super();
		this.shopId = idValue;
	}
	public async getUser():Promise<User>{
		return this['user']?this['user']:await EntityProxy.get(this,'user');
	}
}