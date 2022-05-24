import { useReducer, useMemo } from "react"
import { signIn, signInTenant } from "../apiCalls/SignInApiCalls"
import { getUser } from "../apiCalls/UserApiCalls"
import { saveToken, getToken, removeToken } from "./TokenHandle"
import { BadCredentialException } from "../Exceptions/BadCredentialException"
import { getSignedUserTenant } from "../apiCalls/TenantApiCalls"




export default function AuthStateReducer(){


return useReducer(
    (prevState, action) =>{
        switch(action.type){
            case ('RESTORE_TOKEN'):
                return {
                    ...prevState,
                    userToken: action.userToken,
                    username: action.username,
                    signedIn: true,
                    signedTenant: action.signedTenant,
                    userRole: action.userRole
                }
            case('SIGN_IN_USER'):
                return {
                    ...prevState,
                    userToken: action.userToken,
                    username: action.username,
                    signedIn: true,
                    signedTenant: null,
                    userRole: action.userRole
                }
            case ('SIGN_IN_TENANT'):
                return {
                    ...prevState,
                    userToken: action.userToken,
                    signedTenant: action.signedTenant,
                    userRole: action.userRole
                }
            case ('SIGN_OUT'):
                return {
                    ...prevState,
                    signedIn: false,
                    username:null,
                    signedTenant: null,
                    userToken: null,
                    userRole: null
                }
        }

    },  {  
        signedIn:false, 
        userToken: null,
        signedTenant: null,
        username: null,
        userRole: null 
    }
)}



export function AuthMemo (dispatch) {
    return useMemo(

    () => ({
        restoreToken: async () => {
            try{
            const user = await getToken();
            if (user!=null)
                dispatch({ type: 'RESTORE_TOKEN', userToken: user.userToken,  signedTenant:user.signedTenant, username: user.username, userRole: user.userRole });
                else dispatch({ type: 'SIGN_OUT'});

            } catch(e){console.log(e)}
        },

        signInUser: async (email, password) => { 
            let token=null; 
            let user=null;
            await fetch(signIn(email,password))
            .then(res => {
                switch(res.status){
                    case(200): {
                        token=res.headers.get('Authorization');
                        return "";
                    };
                    case(401): return res.json();    
                    case(403): return res.json();
                    default: throw new Error();
                }
            })
            .then(
                result => {if(result!=="") throw new BadCredentialException(result.message)},
                error => {console.log(error)}
            );

            await getUser(token)()
            .then(res => user=res)
            .catch(error => {throw new Error("404: Couldn't authenticate")})
            
            
            await saveToken({
                userToken: token,
                username: `${user.firstname} ${user.surname}`,
                signedTenant: null,
                userRole: user.personalRole 
            });
            dispatch({ type: 'SIGN_IN_USER', userToken: token, username: `${user.firstname} ${user.surname}`, userRole: user.personalRole });
        },
        
        signOut: async () =>{
            await removeToken();
            dispatch({ type: 'SIGN_OUT' })
        },
        
        signInTenant: async (token,tenant) => {  
            console.log(tenant);
            let tenantToken=null;
            let user=null;
            
            await fetch(signInTenant(token,tenant))
            .then(res => {
                switch(res.status){
                    case(200): {
                        tenantToken=res.headers.get('Authorization');
                        return "";
                    };
                    case(401): {return res.json();} 
                    case(403): {return res.json();}
                    default:{throw new Error();}
                }
            })
            .then(
                result => {if(result!=="")
                throw new Error(result.message)
            }
            );
             
            await getSignedUserTenant(tenantToken)
                        .then(res => {user=res; console.log(res)})
                        .catch(error => {throw new Error(`Couldn't authenticate: ${error.message}`)})
            
           
            await saveToken({
                userToken: tenantToken,
                username: `${user.firstname} ${user.surname}`,
                signedTenant: tenant,
                userRole: user.role
            })
            dispatch({ type: 'SIGN_IN_TENANT', username: `${user.firstname} ${user.surname}`, signedTenant: tenant, userToken: tenantToken, userRole: user.role })


            //console.log(tenantToken);
        

          // In a production app, we need to send user data to server and get a token
          // We will also need to handle errors if sign up failed
          // After getting token, we need to persist the token using `SecureStore`
          // In the example, we'll use a dummy token

        }
      }),
      []

    ) 
}

