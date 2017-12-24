export class FBData {

    pushId:string;
    userId:string;
    isAdmin:boolean;
    userEmail:string;
    executionDate:string;
    data:any;
    constructor(obj:any){
        this.pushId = obj.params.pushId;
        this.isAdmin = obj.auth.admin;
        this.userId = obj.auth.variable.uid;
        this.userEmail = obj.auth.variable.email;
        this.data = obj.data.val();
        this.executionDate = obj.timestamp;
    }
}
