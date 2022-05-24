import { useState, useContext, useEffect } from 'react';
import  { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import _ from 'lodash';
import { activateUserAccount, addUser } from '../apiCalls/SignInApiCalls';
import { InputSearchForm } from './others/SerchBarComponents';
import { StateContext } from '../App';




export function ActivateAccountContent (props){
        let search = window.location.search;
        const[isLoaded,setIsLoaded]=useState(false);
        const [token, setToken] = useState(new URLSearchParams(search).get('token'));
        const [connectionError,setConnectionError] = useState('');
        const [activated, setActivated] = useState(null);
        let navigate = useNavigate();

        const activeUser = async () => {
            await activateUserAccount(token)
            .then(res => {
                switch (res.status){
                    case (200):{
                        setActivated(true);
                        setConnectionError("");
                        console.log(res);
                    };
                    break;
                    default: {
                        setActivated(false);
                        setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
                        console.log(res.data)
                    }
                }
            });
        }

        useEffect(() => {
            if (isLoaded){
                if (token!=null)activeUser();}
            else setIsLoaded(true);
        },[token,isLoaded])


    return (
        <main>
                <h2>Aktywacja Konta</h2>
                {
            
                
                    activated==null?'':
                        activated?<h3>{'Konto pomyślnie aktywowano...'}</h3>:
                        'Konto nie zostało prawidłowo aktywowane: '

                }
                {connectionError!==''?
                <h4 className='errors-text'>
                    {connectionError}
                </h4>:
                ''  
                }
        </main> 
    )
}
