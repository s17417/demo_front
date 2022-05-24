import _ from "lodash";
import { basePath } from "./basePatch";

const path= `${basePath}lab/patients/`;
const errorhandling = (res) => {
    switch(res.status){
        case (401): throw new Error(`${res.status}: ${res.data.message}`);
        case (403): throw new Error(`${res.status}: ${res.data.message}`);
        case (405): throw new Error(`${res.status}: ${res.data.message}`);
        default: return res;
    };
}

class Patient{
    constructor (id, firstname, surname, personalIdentification, birthDate, creationDate, updateDate){
        this.id=id;
        this.firstname=firstname;
        this.surname=surname;
        this.personalIdentification=personalIdentification;
        this.birthDate=birthDate;
        this.creationDate=creationDate;
        this.updateDate=updateDate;
    }
}

export async function addPatientComment(token, patId, comment){
    let url = new URL(`${path}${patId}/patientComments`);
    const req = new Request(url, {
        method: 'POST',
        mode:'cors', 
        body: JSON.stringify({comment:comment}),
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

export async function addUpdatePatients(token, patient){
    const pat = _.cloneDeep(patient);
    pat.addresses=pat.addresses.filter((obj)=>
            !Object.values(obj).every(o => o == null || o == '')
        )
    let url = new URL(`${path}${pat.id==null?'':pat.id}`);
    const req = new Request(url, {
        method: pat.id==null?'POST':'PUT',
        mode:'cors', 
        body: JSON.stringify(pat),
        headers: {
            "Content-type": "application/json; charset=UTF-8", 
            'Authorization': token
        }
    });
    //console.log(req);
    return await fetch(req)
        .then(response => response.json().then( data =>
            ({data: data,status: response.status})
            )
        )
        .then(errorhandling);

}

export async function getPatient(token, patientId){
    const url = new URL(`${path}${patientId}/`);
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

export async function getPatientComments(token, patientId){
    const url = new URL(`${path}${patientId}/patientComments`);
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

export function getPatients(token, currentPage, pageSize, sortOrder, searchParam) {
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
        )
        .then(errorhandling);
}

export async function getPatientOrders(token, currentPage, pageSize, sortOrder, patId) {
    let url = new URL(`${path}${patId}/patientOrders`);
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

