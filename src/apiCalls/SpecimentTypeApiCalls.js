import _ from "lodash";
import { basePath } from "./basePatch";

const path= `${basePath}lab/specimentTypes/`;

const errorhandling = (res) => {
    switch(res.status){
        case (401): throw new Error(`${res.status}: ${res.data.message}`);
        case (403): throw new Error(`${res.status}: ${res.data.message}`);
        case (405): throw new Error(`${res.status}: ${res.data.message}`);
        default: return res;
};
}


export async function getSpecimentTypes(token){
    const url = new URL(path);
    const req = new Request(url, {
        method: 'GET',
        mode:'cors',
        headers: {
            'Authorization': token
        }
    });
    return await fetch(req)
        .then(response => response.json().then( data =>
            ({data: data, status: response.status})
            )
        ).then(errorhandling);
}

export async function addUpdateSpeciment(token, speciment){
    const spc = _.cloneDeep(speciment);
    const url = new URL(`${path}${spc.id==null?'':spc.id}`);
    const req = new Request(url, {
        method: spc.id==null?'POST':'PUT',
        mode:'cors', 
        body: JSON.stringify(spc),
        headers: {
            "Content-type": "application/json; charset=UTF-8", 
            'Authorization': token
        }
    });
    return await fetch(req)
        .then(response => response.json().then( data =>
            ({data: data,status: response.status})
            )
        )
        .then(errorhandling);
}

export async function deleteSpecimentCall(token, specimentTypeId){
    const url = new URL(`${path}${specimentTypeId}`);
    const req = new Request(url, {
        method: 'DELETE',
        mode:'cors',
        headers: {
            'Authorization': token
        }
    });
    console.log(url)
    return await fetch(req)
        .then(response => response.status==204 ? {data: null, status: response.status} :
            response.json().then( data =>
            ({data: data, status: response.status})
            )
        ).then(errorhandling);
}
