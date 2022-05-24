import _ from "lodash";
import { basePath } from "./basePatch";


const path= `${basePath}lab/patientOrders/`;

const errorhandling = (res) => {
    switch(res.status){
        case (401): throw new Error(`${res.status}: ${res.data.message}`);
        case (403): throw new Error(`${res.status}: ${res.data.message}`);
        case (405): throw new Error(`${res.status}: ${res.data.message}`);
        default: return res;
};
}


export async function addUpdatePatientOrder(token, order){
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

export async function getPatientOrder(token, ordId){
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

export function getPatientsOrders(token, currentPage, pageSize, sortOrder, searchParam) {
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

export async function addUpdateOrderResult(token, ordId, splId, orderResult){
    const url = new URL(`${path}${ordId}/patientSamples/${splId}/ordersResults/${orderResult.id==null?'':orderResult.id}`);
    const ord = _.cloneDeep(orderResult);
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

export async function cancelPatientOrderStatus(token, ordId, splId, orderResultId){
    const url = new URL(`${path}${ordId}/patientSamples/${splId}/ordersResults/${orderResultId}/cancel`);
    const req = new Request(url, {
        method: 'PUT',
        mode:'cors', 
        body: JSON.stringify(orderResultId),
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

export async function acceptPatientOrderStatus(token, ordId, splId, orderResultId){
    const url = new URL(`${path}${ordId}/patientSamples/${splId}/ordersResults/${orderResultId}/accept`);
    const req = new Request(url, {
        method: 'PUT',
        mode:'cors', 
        body: JSON.stringify(orderResultId),
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

export async function rejectPatientOrderStatus(token, ordId, splId, orderResultId){
    const url = new URL(`${path}${ordId}/patientSamples/${splId}/ordersResults/${orderResultId}/reject`);
    const req = new Request(url, {
        method: 'PUT',
        mode:'cors', 
        body: JSON.stringify(orderResultId),
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

export async function getOrderResult(token, patientOrderId, patientSampleId, orderResultId){
    const url = new URL(`${path}${patientOrderId}/patientSamples/${patientSampleId}/ordersResults/${orderResultId}`);
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

export function getAllOrderResults(token, currentPage, pageSize, sortOrder, searchParam) {
    let url = new URL(`${path}patientSamples/orderResults/`);
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

export async function getOrderResults(token, patientOrderId){
    const url = new URL(`${path}${patientOrderId}/patientSamples/ordersResults/`);
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

export async function getPatientOrderSamples(token, patientOrderId){
    const url = new URL(`${path}${patientOrderId}/patientSamples/`);
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


export async function addPatientOrderSample(token, patientOrderId, patientSample){
    
    const url = new URL(`${path}${patientOrderId}/patientSamples/`);
    const req = new Request(url, {
        method: 'POST',
        mode:'cors',
        body: JSON.stringify(patientSample),
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


export async function getAnalyteResults( token, patientOrderId, orderResultId){
    const url = new URL(`${path}${patientOrderId}/ordersResults/${orderResultId}/analyteResults/`);
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


export async function getAnalyteResultsWithOrder( token, patientOrderId, patientSampleId, orderResultId){
    const url = new URL(`${path}${patientOrderId}/patientSamples/${patientSampleId}/ordersResults/${orderResultId}/analyteResults/`);
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

export async function updateAnalyteResultsWithOrder(token, patientOrderId, patientSampleId, orderResultId, ord){
    const url = new URL(`${path}${patientOrderId}/patientSamples/${patientSampleId}/ordersResults/${orderResultId}/analyteResults/`);
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