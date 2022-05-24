
import { useState , useContext,  useEffect} from 'react';
import {getTenants, createTenant} from '../../apiCalls/TenantApiCalls';
import { StateContext } from '../../App';
import Collapsible from '../fragments/Collapsible';
import { DoingWork } from './DoingWork';
import { AuthContext } from '../../App';
import { BadCredentialException } from '../../Exceptions/BadCredentialException';

function TenantSignInContent (){
    const [isLoaded, setIsLoaded]= useState(true);
    const [loginErrors, setLoginErrors] = useState("");
    const [createErrors, setCreateErrors] = useState("");
    const [tenants, setTenants] = useState([]);
    const [selectedTenant, setSelectedTenant]=useState(null);
    const [show, setShow] = useState(false);
    const[name,setName] = useState("");
    const stateContext = useContext(StateContext);
    const authContext = useContext(AuthContext);
    const useClick = () =>setShow(!show);


    const create = (e) => {
        setIsLoaded(false);
        createTenant(stateContext.userToken,name)
        .then(res => {
            switch(res.status) {
                case(201): {
                    setName("")
                    setCreateErrors("");
                    setShow(false);
                 setIsLoaded(true);
                }
                break;
                case(422): {
                    setIsLoaded(true);
                    setCreateErrors("nazwa powinna sładać się od 2-60 znakow bez spacji");
                    setShow(true); 
                }
                break;
                case(409): {
                    setIsLoaded(true);
                    setCreateErrors(
                        JSON
                        .stringify(res.data)
                        .includes("1062")
                        ?"Laboratorium juz istnieje - użyj innej nazwy"
                        : `error 409`
                        );
                    setShow(true);
                }
                break;
                default:{
                    setIsLoaded(true);
                    setCreateErrors("niesidentyfikowany błąd") 
                }
            }
        })
        e.preventDefault();  

    }

    const selectTenant = (e) =>{
        setSelectedTenant(e.target.value)
    }

    const signInTen = (e) => {
        if (selectedTenant!=""){
        console.log(stateContext.userToken)
        authContext.signInTenant(stateContext.userToken,selectedTenant)
        .catch(e => {
            if (e.message.includes("token expired")) 
                throw new BadCredentialException(`401: ${e.message}`)
            
            console.log(setLoginErrors(e.message))
        }
            )
    }
    console.log(selectedTenant)
        e.preventDefault();    
        
    }

    

    useEffect ( () => {
        if (stateContext.userToken!=null)
            getTenants(stateContext.userToken)
            .then( res =>{setTenants(res.map((obj) => {
                return obj.tenant.name;
                    })
                )
            }).finally( e => {
                console.log(tenants.length)
            })     
        }
    ,[stateContext,isLoaded]);


    if (isLoaded==false) return <DoingWork message="Tworzenie laboratorium..."/>
    else
    return (
        <main>
            <div className='content'>
            <h2>Laboratorium</h2>


            {tenants.length>0 ?
            <div className='formContainer'>
                <h2>Zaloguj</h2>
            <form className="form" onSubmit={signInTen}>
                
                    <select name="tenant_id" id="tenant_id" className="" onChange={selectTenant}>
                        <option key="empty" value="" label="-- Wybierz laboratorium --"/>
                        {tenants.map(
                            (tenant) =><option key={tenant} label={tenant} value={tenant}/>
                            )}
                    </select>
                    <div className="form-buttons">
                        <input type="submit" className="form-button-submit" value="Zaloguj" />
                    </div>
            </form>
            <span className='errors-text'>{loginErrors}</span>
            </div>
            :<></>

            }
            

            <div className='formContainer'>
                    <Collapsible onClick={useClick} name="Utwórz" start={show}>
                            <form className="form" onSubmit={create}>
                        <fieldset>
                        <label htmlFor="tenantName">Nazwa</label>
                            <input
                            type="text"
                            id="tenantName"
                            name="tenantName"
                            value ={name}
                            onChange={(e) => setName(e.target.value)}
                            />
                        
                        </fieldset>

                        <div className="form-buttons">
                            <input type="submit" className="form-button-submit" value="Utwórz"/>
                        </div>
                        <span className='errors-text'>{createErrors}</span>
                    </form>
                    </Collapsible>

            
            </div>


            </div>
        </main> 
    )
}


export default TenantSignInContent