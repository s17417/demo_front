import { basePath } from "./basePatch";

const path= `${basePath}`;

const errorhandling = (res) => {
    switch(res.status){
        case (401): throw new Error(`${res.status}: ${res.data.message}`);
        case (403): throw new Error(`${res.status}: ${res.data.message}`);
        case (405): throw new Error(`${res.status}: ${res.data.message}`);
        default: return res;
    };
}


export function getTenants(token) {

    let url = new URL(`${path}users/getTenants`);
    const req = new Request(url, {
        method: 'GET',
        mode:'cors', 
    });
    req.headers.append('Authorization', token);
    return fetch(req)
        .then(
            response => response.json().then( data =>
            ({data: data,status: response.status})
            ), err => console.log(err)
        )
        .then(res => {
            switch(res.status){
                case (200):{
                    return res.data;
                }
                case (401): throw new Error(`${res.status}: ${res.data.message}`);
                case (403): throw new Error(`${res.status}: ${res.data.message}`);
                case (404): throw new Error(`${res.status}: ${res.data.message}`);
                default: throw new Error(`${res.status}: Some error occured, can't fetch data`);
            }
        }, err => console.log(err));
}

export async function getTenant(token) {

    let url = new URL(`${path}tenant/get`);
    const req = new Request(url, {
        method: 'GET',
        mode:'cors', 
    });
    req.headers.append('Authorization', token);
    return await fetch(req)
        .then(
            response => response.json().then( data =>
            ({data: data,status: response.status})
            ), err => console.log(err)
        )
        .then(errorhandling);
}

export async function deleteUserTenant(token, userTenant) {

    let url = new URL(`${path}tenant/users/${userTenant}`);
    const req = new Request(url, {
        method: 'DELETE',
        mode:'cors', 
    });
    req.headers.append('Authorization', token);
    return await fetch(req)
        .then(response => 
            ({data: null,status: response.status})
            , err => console.log(err))
        .then(errorhandling);
}

export async function inviteUser(token, userEmail){
    let url = new URL(`${path}tenant/invite`);
    url.searchParams.append("email",userEmail);
    const req = new Request(url, {
        method: 'POST',
        mode:'cors',
        headers: {
            "Content-type": "application/json; charset=UTF-8", 
            'Authorization': token
        } 
    });
    return await fetch(req)
        .then(
            response => response.status!=201?response.json().then( data =>
            ({data: data,status: response.status})
            ):{data: null,status: response.status}, err => console.log(err)
        )
        .then(errorhandling);
}


export async function getUsers(token) {

    let url = new URL(`${path}tenant/users`);
    const req = new Request(url, {
        method: 'GET',
        mode:'cors', 
    });
    req.headers.append('Authorization', token);
    return await fetch(req)
        .then(
            response => response.json().then( data =>
            ({data: data,status: response.status})
            ), err => console.log(err)
        )
        .then(errorhandling);
}



export  function createTenant(token,tenantName) {
    const data = JSON.stringify({name: tenantName})
    let url = new URL(`${path}tenant/create`);
    const req = new Request(url, {
        
        body: data,
        method: 'POST',
        mode:'cors',
        headers: {
            "Content-type": "application/json; charset=UTF-8", 
            'Authorization': token
        } 
    });
    console.log(req)
    return fetch(req)
    .then(
        response => response.json().then( data =>
        ({data: data,status: response.status})
        ), err => console.log(err)
    )
    .then(res => {
        switch(res.status) {
            case (401): throw new Error(`${res.status}: ${res.data.message}`);
            break;
            case (403): throw new Error(`${res.status}: ${res.data.message}`);
            break;
            case (404): throw new Error(`${res.status}: ${res.data.message}`);
            break;
            default: { return res}
        }
    }, err => console.log(err));
}

export function getSignedUserTenant(token){
    let url = new URL(`${path}users/getTenant`);
    const req = new Request(url, {
        method: 'GET',
        mode:'cors', 
    });
    req.headers.append('Authorization', token);
    return fetch(req)
        .then(
            response => response.json().then( data =>
            ({data: data,status: response.status})
            ), err => console.log(err)
        )
        .then(res => {
            switch(res.status){
                case (200):{
                    return res.data;
                }
                case (401): throw new Error(`${res.status}: ${res.data.message}`);
                case (403): throw new Error(`${res.status}: ${res.data.message}`);
                case (404): throw new Error(`${res.status}: ${res.data.message}`);
                default: throw new Error(`${res.status}: Some error occured, can't fetch data`);
            }
        }, err => console.log(err));
}