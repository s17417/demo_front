import _ from "lodash";
import { basePath } from "./basePatch";

const path= `${basePath}lab/phisicians/`;

const errorhandling = (res) => {
    console.log(res.data)
    switch(res.status){
        case (401): throw new Error(`${res.status}: ${res.data.message}`);
        case (403): throw new Error(`${res.status}: ${res.data.message}`);
        case (405): throw new Error(`${res.status}: ${res.data.message}`);
        default: return res;
    };
}


export async function addUpdatePhisicians(token, phisician){
    const phi = _.cloneDeep(phisician);
    const url = new URL(`${path}${phi.id==null?'':phi.id}`);
    const req = new Request(url, {
        method: phi.id==null?'POST':'PUT',
        mode:'cors', 
        body: JSON.stringify(phi),
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

export function getPhisicians(token, currentPage, pageSize, sortOrder, searchParam) {
    //const context= useContext(StateContext);

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

export async function getPhisician(token, phisicianId){
    const url = new URL(`${path}${phisicianId}/`);
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

export async function getPhisicianOrderingUnits(token, phisicianId){
    const url = new URL(`${path}${phisicianId}/orderingUnits`);
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

export async function addPhisicianOrderingUnit(token, phisicianId, orderingUnitId){
    const url = new URL(`${path}${phisicianId}/orderingUnits/${orderingUnitId}`);
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

export async function deletePhisicianOrderingUnit(token, phisicianId, orderingUnitId){
    const url = new URL(`${path}${phisicianId}/orderingUnits/${orderingUnitId}`);
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


