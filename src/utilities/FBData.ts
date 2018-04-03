import * as _ from 'lodash'
export class FBData {

    pushId:string;
    userId:string;
    isAdmin:boolean;
    userEmail:string;
    executionDate:string;
    data:any;
    constructor(obj:any){
        this.pushId = _.get(obj,'params.pushId');
        this.isAdmin = _.get(obj,'auth.admin');
        this.userId = _.get(obj,'auth.variable.uid');
        this.userEmail = _.get(obj,'auth.variable.email');
        this.data = obj.data.val();
        this.executionDate = obj.timestamp;
    }
}