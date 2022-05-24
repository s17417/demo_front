import _ from "lodash";
import { basePath } from "./basePatch";

const path= `${basePath}lab/orderingUnits/`;

const errorhandling = (res) => {
    switch(res.status){
        case (401): throw new Error(`${res.status}: ${res.data.message}`);
        case (403): throw new Error(`${res.status}: ${res.data.message}`);
        case (405): throw new Error(`${res.status}: ${res.data.message}`);
        default: return res;
    };
}

export async function getOrderingUnits(token, currentPage, pageSize, sortOrder, searchParam) {
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
    return await fetch(req)
        .then(response => response.json().then( data =>
            ({data: data,status: response.status})
            )
        ).then(errorhandling);
}

export async function addUpdateOrderingUnit(token, orderingUnit){
    const ord = _.cloneDeep(orderingUnit);
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

export async function getOrderingUnit(token, orderingUnitId){
    const url = new URL(`${path}${orderingUnitId}/`);
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

export async function getOrderingUnitPhisicians(token, orderingUnitId){
    const url = new URL(`${path}${orderingUnitId}/phisicians`);
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

export async function addOrderingUnitPhisician(token, orderingUnitId, phisicianId){
    const url = new URL(`${path}${orderingUnitId}/phisicians/${phisicianId}`);
    const req = new Request(url, {
        method: 'PUT',
        mode:'cors',
        headers: {
            'Authorization': token
        }
    });
    return await fetch(req)
        .then(response =>{
            switch(response.status){
                case(200):
                return ({data: null, status: response.status});
                default:{
                    return response.json().then( data =>
                        ({data: data, status: response.status})
                    )
                }
            }  
        } 
        )
        .then(errorhandling);
}

export async function deleteOrderingUnitPhisician(token, orderingUnitId, phisicianId){
    const url = new URL(`${path}${orderingUnitId}/phisicians/${phisicianId}`);
    const req = new Request(url, {
        method: 'DELETE',
        mode:'cors',
        headers: {
            'Authorization': token
        }
    });
    return await fetch(req)
        .then(response =>{
            switch(response.status){
                case(204):
                return ({data: null, status: response.status});
                default:{
                    return response.json().then( data =>
                        ({data: data, status: response.status})
                    )
                }
            }  
        } 
        )
        .then(errorhandling);
}

export async function getOrderingUnitOrders(token, currentPage, pageSize, sortOrder, ordId) {
    let url = new URL(`${path}${ordId}/patientOrders`);
    url.searchParams.append("pageNumber",currentPage);
    url.searchParams.append("pageSize",pageSize);
    url.searchParams.append("direction",sortOrder.direction);
    url.searchParams.append("sortField",sortOrder.field);

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