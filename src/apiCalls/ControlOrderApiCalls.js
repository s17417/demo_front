import _ from "lodash";
import { basePath } from "./basePatch";


const path= `${basePath}lab/labQualityControls/`;

const errorhandling = (res) => {
    switch(res.status){
        case (401): throw new Error(`${res.status}: ${res.data.message}`);
        case (403): throw new Error(`${res.status}: ${res.data.message}`);
        case (405): throw new Error(`${res.status}: ${res.data.message}`);
        default: return res;
};
}


export async function addUpdateControlOrder(token, order){
    const ord = _.cloneDeep(order);
    let url = new URL(`${path}${ord.id==null?'':ord.id}`);
    const req = new Request(url, {
        method: ord.id==null?'POST':'PUT',
        mode:'cors', 
        body: JSON.stringify(ord),
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

export async function getControlOrder(token, ordId){
    const url = new URL(`${path}${ordId}`);
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

export function getControlsOrders(token, currentPage, pageSize, sortOrder, searchParam) {
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
        )
        .then(errorhandling);
}

export async function addUpdateControlResult(token, ordId, splId, controlResult){
    const url = new URL(`${path}${ordId}/controlSamples/${splId}/controlResults/${controlResult.id==null?'':controlResult.id}`);
    const ord = _.cloneDeep(controlResult);
    const req = new Request(url, {
        method: ord.id==null?'POST':'PUT',
        mode:'cors', 
        body: JSON.stringify(ord),
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

export async function getControlOrderSamples(token, controlOrderId){
    const url = new URL(`${path}${controlOrderId}/controlSamples/`);
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

export async function addControlOrderSample(token, controlOrderId, controlSample){
    
    const url = new URL(`${path}${controlOrderId}/controlSamples/`);
    const req = new Request(url, {
        method: 'POST',
        mode:'cors',
        body: JSON.stringify(controlSample),
        headers: {
            "Content-type": "application/json; charset=UTF-8", 
            'Authorization': token
        }
    });
    return await fetch(req)
        .then(response => response.json().then( data =>
            ({data: data, status: response.status})
            )
        ).then(errorhandling);
}

export async function getControlResult(token, controlOrderId, controlSampleId, controlResultId){
    const url = new URL(`${path}${controlOrderId}/controlSamples/${controlSampleId}/controlResults/${controlResultId}`);
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

export async function getControlResults(token, controlOrderId){
    const url = new URL(`${path}${controlOrderId}/controlSamples/controlResults/`);
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

export async function cancelControlOrderStatus(token, ordId, splId, controlResultId){
    const url = new URL(`${path}${ordId}/controlSamples/${splId}/controlResults/${controlResultId}/cancel`);
    const req = new Request(url, {
        method: 'PUT',
        mode:'cors',
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

export async function getAnalyteResultsWithControlOrder( token, controlOrderId, controlSampleId, controlResultId){
    const url = new URL(`${path}${controlOrderId}/controlSamples/${controlSampleId}/controlResults/${controlResultId}/analyteResults/`);
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

export async function updateAnalyteResultsWithControlOrder(token, controlOrderId, controlSampleId, controlResultId, ord){
    const url = new URL(`${path}${controlOrderId}/controlSamples/${controlSampleId}/controlResults/${controlResultId}/analyteResults/`);
    const req = new Request(url, {
        method: 'PUT',
        body: JSON.stringify(ord),
        mode:'cors',
        headers: {
            "Content-type": "application/json; charset=UTF-8", 
            'Authorization': token
        }
    });
    return await fetch(req)
        .then(response => response.json().then( data =>
            ({data: data, status: response.status})
            )
        ).then(errorhandling);
}