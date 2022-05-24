import { useEffect, useContext, useState } from "react";
import { StateContext } from "../App";
import { PatientListTableRow } from "./others/TableComponent";
import { Link } from "react-router-dom";
import TableComponent from "./others/TableComponent";
import { getFormattedDateTime } from "./others/DateHelper";
import { useParams } from "react-router-dom";
import { DoingWork } from "./others/DoingWork";
import _ from "lodash";
import { getAnalyte } from "../apiCalls/AnalyteApiCalls";
import { acceptInvitation, getUser } from "../apiCalls/UserApiCalls";
import { getTenants } from "../apiCalls/TenantApiCalls";
import { priv, priviligiesConv } from "./others/PriviligiesNamesConv";


export default function UserDetails(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const [user, setUser] = useState({})
    const [tenants, setTenants] = useState([])

    const OnHeaderClick = () =>{
        console.log("kddkdk");
    }

    const  fetchUser = async () => {
        return await getUser(context.userToken)()
        .then((res) => {
			setUser(res);
                
        }).catch(err => {
            setConnectionError(`Error: ${err.message}`);					

        })
    }

    const fetchTenants = async () => {
        return await getTenants(context.userToken)
        .then((res) => {
			setTenants(res);
                
        }).catch(err => {
            setConnectionError(`Error: ${err.message}`);					

        })
    }

    const accept = async (tenantId) => {
        return await acceptInvitation(context.userToken, tenantId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    const tmp =_.cloneDeep(tenants);
                    const index = tmp.findIndex((obj, index) =>obj.id===res.data.id);  
                    tmp[index]=res.data;
                    setTenants(tmp);
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    useEffect(()=>{
        fetchUser().finally(() =>setIsLoaded(true));   
        fetchTenants();
    },[]);

    return !isLoaded ?
    <DoingWork/>:
    <>
    <main>
        <div className="content">
            <h2>{user.firstname+' '+user.surname}</h2>
            {
		    connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
            <><div className="details-main-box">
                <div className="details-metadata-box">
                    <div>
                        <b>
                            <p>Dodano: </p>
                            <p>Zmodyfikowano: </p>
                        </b>
                    </div>
                    <div>
                        <p>{getFormattedDateTime(user.creationTimeStamp)}</p>
                        <p>{getFormattedDateTime(user.updateTimeStamp)}</p>
                    </div>
                </div>
                <div className="details-content-box">
                    <DetailsRow key={user.id} label="e-mail:" value={user.email}/>
                    <DetailsRow key={user.id} label="Imię:" value={user.firstname}/>
                    <DetailsRow key={user.id} label="Nazwisko:" value={user.surname}/>
                </div>
            </div>

            <h2>Laboratoria</h2>
                <TableComponent 
                    labelsArray={{
                        name: "Nazwa",
                        role: "Uprawnienia",
                        cretionTimeStamp:"Data dodania",
                        actions:"Akcje"
                    }}
                    onTableHeaderClick={props.OnHeaderClick}
                    >
                    { 
                        tenants.map((tenant) =>
                        <PatientListTableRow key={tenant.id}
                            patData={tenant}
                            labels={{
                                "tenant.name": null,
                                "role": v => priviligiesConv(v),
                                cretionTimeStamp: v=>getFormattedDateTime(v)
                            }}
                        >
                            {tenant.role===priv.ROLE_SPECIFIC_DATABASE_INVITATION?
                                <button key={tenant.id} onClick={()=>{accept(tenant.id)}} className="list-actions-button-details">Akceptuj</button>:''}
                        </PatientListTableRow>
                        )
                    }
                </TableComponent>
            <div className="page-buttons">
				<Link to={`/lab/userDetails/edit/`} className="button-add">Edytuj</Link>
            </div>
        </>}
        </div>
    </main>
    </>
}

    function DetailsRow(props){
        return <>
            <div className='details-label'><p>{props.label}</p></div>
            <div className = 'details-value'><p>{props.value}</p></div>
        </>
    }
