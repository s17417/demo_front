import { basePath } from "./basePatch";



const path= basePath;

const errorhandling = (res) => {
    switch(res.status){
        case (401): throw new Error(`${res.status}: ${res.data.message}`);
        case (403): throw new Error(`${res.status}: ${res.data.message}`);
        case (405): throw new Error(`${res.status}: ${res.data.message}`);
        default: return res;
    };
}




export function getUser(token){
    let url = new URL(`${path}users/get`);
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
        .then(res => {
            switch(res.status){
                case (200): return res.data;
                case (401): throw new Error(`${res.status}: ${res.data.message}`);
                case (403): throw new Error(`${res.status}: ${res.data.message}`);
                case (404): throw new Error(`${res.status}: ${res.data.message}`);
                default: throw new Error(`${res.status}: Some error occured, can't fetch data`);
            }
        })
    
}

export async function acceptInvitation(token, tenantId){
    let url = new URL(`${path}users/userTenants/${tenantId}/acceptInvitation`);
    const req = new Request(url, {
        method: 'PUT',
        mode:'cors', 
    });
    req.headers.append('Authorization', token);
    return await fetch(req)
        .then(response => response.json().then( data =>
            ({data: data,status: response.status})
            )
        )
        .then(errorhandling)
    
}



export async function updateUserRole(token, userRoleDTO) {

    let url = new URL(`${path}users/updateRole`);
    const req = new Request(url, {
        method: 'PUT',
        mode:'cors',
        body: JSON.stringify(userRoleDTO),
        headers: {
            "Content-type": "application/json; charset=UTF-8", 
            'Authorization': token
        }
    });
    return await fetch(req)
        .then(
            response => response.json().then( data =>
            ({data: data,status: response.status})
            ), err => console.log(err)
        )
        .then(errorhandling);
}