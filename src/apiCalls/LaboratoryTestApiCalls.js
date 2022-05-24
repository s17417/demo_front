import _ from "lodash";
import { basePath } from "./basePatch";
const path= `${basePath}lab/laboratoryTests/`;

const errorhandling = (res) => {
    switch(res.status){
        case (401): throw new Error(`${res.status}: ${res.data.message}`);
        case (403): throw new Error(`${res.status}: ${res.data.message}`);
        case (405): throw new Error(`${res.status}: ${res.data.message}`);
        default: return res;
};
}

export async function addUpdateLaboratoryTest(token, laboratoryTest){
    const ltd = _.cloneDeep(laboratoryTest);
    let url = new URL(`${path}${ltd.id==null?'':ltd.id}`);
    const req = new Request(url, {
        method: ltd.id==null?'POST':'PUT',
        mode:'cors', 
        body: JSON.stringify(ltd),
        headers: {
            "Content-type": "application/json; charset=UTF-8", 
            'Authorization': token
        }
    });
    return await fetch(req)
        .then(response => response.json().then( data =>
            ({data: data,status: response.status})
            )
        ).then(errorhandling);
}

export async function getAllLaboratoryTests(token){
    const url = new URL(`${path}all`);

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

export async function getLaboratoryTests(token, currentPage, pageSize, sortOrder, searchParam){
    const url = new URL(path);
    url.searchParams.append("pageNumber",currentPage);
    url.searchParams.append("pageSize",pageSize);
    //url.searchParams.append("direction",sortOrder.direction);
    //url.searchParams.append("sortField",sortOrder.field);

    if (searchParam)Object.entries(searchParam).forEach(([key,value]) => {
        if(value) url.searchParams.append(key,value);
    })

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

export async function getLaboratoryTest(token, laboratoryTestId){
    const url = new URL(`${path}${laboratoryTestId}`);
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

export async function getMethods(token, inactiveMethods, laboratoryTestId){
    const url = new URL(`${path}${laboratoryTestId}/methods/`);
    if (inactiveMethods)url.searchParams.append("onlyActive",false);
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

export async function deleteMethod(token, laboratoryTestId, methodId){
    const url = new URL(`${path}${laboratoryTestId}/methods/${methodId}`);
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

export async function addUpdateMethod(token, laboratoryTestId, method){
    const met = _.cloneDeep(method);
    let url = new URL(`${path}${laboratoryTestId}/methods/${met.id==null?'':met.id}`);
    const req = new Request(url, {
        method: met.id==null?'POST':'PUT',
        mode:'cors', 
        body: JSON.stringify(met),
        headers: {
            "Content-type": "application/json; charset=UTF-8", 
            'Authorization': token
        }
    });
    return await fetch(req)
        .then(response => response.json().then( data =>
            ({data: data,status: response.status})
            )
        ).then(errorhandling);
}
