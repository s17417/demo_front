import { useEffect, useContext, useState } from "react";
import { StateContext } from "../App";
import { PatientListTableRow } from "./others/TableComponent";
import { Link } from "react-router-dom";
import TableComponent from "./others/TableComponent";
import { getFormattedDateTime } from "./others/DateHelper";
import { useParams } from "react-router-dom";
import { DoingWork } from "./others/DoingWork";
import _, { set } from "lodash";
import { getAnalyte } from "../apiCalls/AnalyteApiCalls";
import { acceptInvitation, getUser, updateUserRole } from "../apiCalls/UserApiCalls";
import { deleteUserTenant, getSignedUserTenant, getTenant, getTenants, getUsers, inviteUser } from "../apiCalls/TenantApiCalls";
import { priv, priviligiesConv } from "./others/PriviligiesNamesConv";
import GenericPopupForm, { GenericPopupFormWithoutButton } from "./popups/AddComment";
import { InputSearchForm, InputSearchFormChildren, Option, Select } from "./others/SerchBarComponents";
import Popup from "reactjs-popup";


export default function UsersListComponent(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const [tenant, setTenant] = useState({});
    const [users, setUsers] = useState([]);
    const [retriveObjectTrigger,setRetriveObjectTrigger]=useState(false);
    const [isPopupOpen, setIsPopupOpen]=useState(false);
    const [editedUser, setEditedUser] = useState(null);
    const [post,setPost] = useState(false);
    const [email,setEmail] = useState({
        email:null,
        err:''
    });
 
    const addOrderResult = async (obj) =>{
        const index= users
        .findIndex((value) => value.id===obj.id);
        if(index!=-1){
            const tmp = _.cloneDeep(users);
            tmp[index]=obj;
            setUsers(tmp);
        } else
        setUsers([...users,obj])
    }

    const OnHeaderClick = () =>{
        console.log("kddkdk");
    }

    
        const sendInvitation = async () => {
            return await inviteUser(context.userToken, email.email)
                .then((res) => {
                    switch (res.status){
                        case (201):{
                            setEmail({email:null,err:`Wysłano zaproszenie dla: ${email.email}`})
                        }
                        break;
                        case (422):{
                            if (Object.keys(res.data.message).includes('1062',0)) 
                                setEmail({email:email.email, err:'Uzytkownik juz jest w bazie lub juz jest zaproszony'});
                            else 
                                setEmail({email:email.email, err:res.data.message['inviteUser.email']})
                        }
                        break;
                        default: {
                            setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
                        }
                    }
                })
        }
        
    

    const  fetchTenant = async () => {
        return await getTenant(context.userToken)
        .then((res) => {
			setTenant(res.data);
                
        }).catch(err => {
            setConnectionError(`Error: ${err.message}`);					
        })
    }

    

    const fetchUsers = async () => {
        return await getUsers(context.userToken)
        .then((res) => {
            switch (res.status){
                case (200):{	
                    setUsers( res.data);
                }
                break;
                default: {
                    setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
                }
            }
        })
    }

    const deleteUser = async (userTenantId) => {
        return await deleteUserTenant(context.userToken, userTenantId)
        .then((res) => {
            switch (res.status){
                case (204):{
                    let tmp =_.cloneDeep(users);
                    tmp = tmp.filter((obj, index) =>obj.id!==userTenantId);
                    setUsers(tmp);
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    useEffect(()=> {
        if (editedUser)setIsPopupOpen(true)
    },[editedUser,post])
    

    useEffect(()=>{
            fetchTenant().finally(() =>setIsLoaded(true)); 
            fetchUsers();
    },[]);

    return !isLoaded ?
    <DoingWork/>:
    <>
    <main>
        <div className="content">
            <h2>Użytkownicy - {tenant.name}</h2>
            <><div className="details-main-box">
                <div className="details-metadata-box">
                    <div>
                        <b>
                            <p>Dodano: </p>
                        </b>
                    </div>
                    <div>
                        <p>{getFormattedDateTime(tenant.cretionTimeStamp)}</p>
                    </div>
                </div>
                <div className="details-content-box">
                </div>
            </div>

                <TableComponent 
                    labelsArray={{
                        email: "Email",
                        role: "Uprawnienia",
                        cretionTimeStamp:"Data dodania",
                        actions:"Akcje"
                    }}
                    onTableHeaderClick={props.OnHeaderClick}
                    >
                    { 
                        users.map((user) =>
                        <PatientListTableRow key={user.id}
                            patData={user}
                            labels={{
                                "user.email": null,
                                "role": v => priviligiesConv(v),
                                cretionTimeStamp: v=>getFormattedDateTime(v)
                            }}
                        >
                            
                            <button key={user.id} onClick={()=>{deleteUser(user.id)}} className="list-actions-button-details">Usuń</button>
                            <button key={user.id} onClick={()=>{setEditedUser(user);setPost(!post)}} className="list-actions-button-details">Edytuj</button>

                            
                        </PatientListTableRow>
                        )
                    }
                </TableComponent>

                <h2>Zaproszenie</h2>
                <form className="form"  onSubmit={e=> {e.preventDefault();sendInvitation()}}>
                    <fieldset className="searchFieldset">
                        <InputSearchFormChildren
                            label = "email:"
                            type = "email"
                            name = "role"
                            error={email.err}
                            value={email.email?email.email:''}
                            onChange={(e)=> {setEmail(e.target.value==''?{email:null, err:''}:{email:e.target.value, err:''})}}
                            //onChange={handleChange}
                        >
                            <input type="submit" className="button-add" value="Wyślij"/>
                            
                        </InputSearchFormChildren>
                    </fieldset>
                </form>  
        </>

        {connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:''}
        </div>

        <GenericPopupFormWithoutButton
        triggerClassName={'list-actions-button-details'}
        name='Modyfikuj' 
        okId="ok"
        cancelId="return"
        okName="Ok"
        cancelName="Anuluj"
        onPopupAction={e =>{
                if(e.target.id==='ok')
                setRetriveObjectTrigger(!retriveObjectTrigger);
            }
        }
        onPopupActionCloseTrigger={isPopupOpen}
        handleClose={()=>{setIsPopupOpen(false)}}
        handleOpen ={()=>setIsPopupOpen(true)}
    >
        <RolePopup
            returnObject={addOrderResult}
            retriveObject={retriveObjectTrigger}
            actualRole={editedUser}
            handleVisibility={(e)=> {setIsPopupOpen(e)}}
        />
    </GenericPopupFormWithoutButton>
    </main>
    </>
}

function RolePopup(props){
    const context= useContext(StateContext);
    const [actualRole, setActualRole]=useState({});
    const [isLoaded, setIsLoaded]=useState(false);
    const [connectionError, setConnectionError] = useState('');

    const handleChange = (event) =>{
        const {name, value } = event.target
        const act = _.cloneDeep(actualRole);
        _.set(act, name, value==''?null:value);
        
        setActualRole(act);
        console.log(act);
    }

    const updateUserRoles = async () => {
        return await updateUserRole(context.userToken,actualRole)
        .then((res) => {
            switch (res.status){
                case (200):{
                    props.returnObject(res.data);
                }
                break;
                default: {
                    setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
                }
            }
        })
    }

    useEffect(
        ()=> {
            if (isLoaded)
                updateUserRoles();
            else setIsLoaded(true);
        },
        [props.retriveObject]
        )

    useEffect(
        ()=>{
            console.log(props.actualRole);

            setActualRole(props.actualRole);
        }, 
        [props.actualRole])

        return <div>
    <h2>Uprawnienia</h2>
    <form className="popup-form"  onSubmit={e=> {e.preventDefault()}}>
		<fieldset className="popup-searchFieldset">
            <Select
                label = "Uprawnienia:"
                name = "role"
                error={''}
                onChange={handleChange}
            >
                {
                Object.keys(priv)
                .filter(obj => obj!=='ROLE_SPECIFIC_DATABASE_INVITATION')
                .map((key) => <Option key={key} selected={actualRole.role===key?true:false} value={key.replace('ROLE_','')} label={priviligiesConv(key)}/>)}
            </Select>

        </fieldset>
    </form>
    {connectionError!=''?<h4 className='errors-text'>
		{`Couldn't retrieve data. ${connectionError}`}
	</h4>:''}

    
    </div>

}
