import { basePath } from "./basePatch";



const path= basePath;




export function signIn(email, password){
    console.log(window.location.hostname);
    let url = new URL(`${path}login`);
    url.searchParams.append("username",email);
    url.searchParams.append("password",password);
    const req = new Request(url, {
        method: 'POST',
        mode:'cors', 
    });
    return req;
}

export function signInTenant(token, tenant){
    let url = new URL(`${path}loginTenant`);
    url.searchParams.append("tenant",tenant);
    const req = new Request(url, {
        method: 'POST',
        mode:'cors',
        headers: {
            'Authorization': token
        }  
    });

    return req;
}

export async function addUser(user){
    const url = new URL(`${path}users/`);
    const req = new Request(url, {
        method: 'POST',
        //mode:'cors', 
        body: JSON.stringify(user),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });
    return await fetch(req)
        .then(response => response.json().then( data =>
            ({data: data,status: response.status})
            )
        )
}

export async function activateUserAccount(token){
    const url = new URL(`${path}users/activate/${token}`);
    const req = new Request(url, {
        method: 'GET',
        mode:'cors'
    });
    return await fetch(req)
        .then(response => response.text().then( data =>
            ({data: data, status: response.status})
            )
        );
}