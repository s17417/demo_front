import _ from "lodash";
import { basePath } from "./basePatch";

const path= `${basePath}lab/analytes/`;

const errorhandling = (res) => {
    switch(res.status){
        case (401): throw new Error(`${res.status}: ${res.data.message}`);
        case (403): throw new Error(`${res.status}: ${res.data.message}`);
        case (405): throw new Error(`${res.status}: ${res.data.message}`);
        default: return res;
    };
}


export async function addUpdateAnalyte(token, analyte){
    const ana = _.cloneDeep(analyte);
    const url = new URL(`${path}${ana.id==null?'':ana.id}`);
    const req = new Request(url, {
        method: ana.id==null?'POST':'PUT',
        mode:'cors', 
        body: JSON.stringify(ana),
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

export async function getAnalyte(token, analyteId){
    const url = new URL(`${path}${analyteId}/`);
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
        )
        .then(errorhandling);
}

export function getAnalytes(token, currentPage, pageSize, sortOrder, searchParam) {
    let url = new URL(path);
    url.searchParams.append("pageNumber",currentPage);
    url.searchParams.append("pageSize",pageSize);
    url.searchParams.append("direction",sortOrder.direction);
    url.searchParams.append("sortField",sortOrder.field);
    
    Object.entries(searchParam).forEach(([key,value]) => {
        if(value) url.searchParams.append(key,value);
    })

    const req = new Request(url, {
        method: 'GET',
        mode:'cors', 
    });
    req.headers.append('Authorization', token);
    return async () => 
        await fetch(req)
        .then(response => response.json().then( data =>
            ({data: data,status: response.status})
            )
        ).then(errorhandling);
}

export async function getAllAnalytes(token) {
    let url = new URL(`${path}all`);
    const req = new Request(url, {
        method: 'GET',
        mode:'cors', 
    });
    req.headers.append('Authorization', token);
    return await fetch(req)
        .then(response => response.json().then( data =>
            ({data: data,status: response.status})
            )
        ).then(errorhandling);
}