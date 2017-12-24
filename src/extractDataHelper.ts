import { FBData} from "./utilities/FBData";

export const isNewObject = (obj:any) =>{
    // Only edit data when it is first created.
    if (obj.data.previous.exists()) {
        return false;
    }
    // Exit when the data is deleted.
    if (!obj.data.exists()) {
        return false;
    }

    return true;
};


///////////////////////////////////////////////////
//                transformation                 //
///////////////////////////////////////////////////


export const extractData = (obj:any) :FBData =>{

    const fbData = new FBData(obj);
    return fbData;

};