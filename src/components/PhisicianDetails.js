import { useEffect, useContext, useState } from "react";
import { StateContext } from "../App";
import { PatientListTableRow } from "./others/TableComponent";
import { Link } from "react-router-dom";
import TableComponent from "./others/TableComponent";
import { getFormattedDateTime } from "./others/DateHelper";
import { useParams } from "react-router-dom";
import { DoingWork } from "./others/DoingWork";
import GenericPopupForm from "./popups/AddComment";
import _ from "lodash";
import { orderingUnitData } from "./OrderingUnitForm";
import { addPhisicianOrderingUnit, deletePhisicianOrderingUnit, getPhisician, getPhisicianOrderingUnits } from "../apiCalls/PhisiciansApiCalls";
import { OrderingUnitSearchPopup } from "./popups/OrderingUnitPopups";
import Collapsible from "./fragments/Collapsible";


export default function PhisicianDetails(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { phiId } = useParams();
    const [newOrderingUnit,setNewOrderingUnit]=useState(_.cloneDeep(orderingUnitData))
    const [orderingUnits, setOrderingUnits] = useState([]);
    const [phisician, setPhisician] = useState({
        phi: {}
    })
    const [retriveObjectTrigger,setRetriveObjectTrigger]=useState(false);
    const [isOpen, setIsOpen]=useState(false);
    
    const getSelectedObject = (pat)=> {
        console.log(pat);
        setNewOrderingUnit(pat);
    }

    const OnHeaderClick = () =>{
        console.log("kddkdk");
    }

    const addOrderingUnit = async() => {
        await addPhisicianOrderingUnit(context.userToken, phiId ,newOrderingUnit.pat.id)
        .then(res => {
			switch (res.status){
				case (200):{
                    setIsOpen(false);
                    setOrderingUnits(orderingUnits.find(obj=>obj.id===newOrderingUnit.pat.id)?orderingUnits:[...orderingUnits,newOrderingUnit.pat])
				    setConnectionError("");
                    setNewOrderingUnit(_.cloneDeep(orderingUnitData));
				};
				break;
				case (422): {
                    setIsOpen(true);
                    const ord =  _.cloneDeep(newOrderingUnit);
					Object.keys(res.data.message)
					.map(key => {
                        _.set(ord.err, 'err', res.data.message[key]); 
					})
                    setNewOrderingUnit(ord);
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${res.data.message}`:''}`);					
					console.log(res.data)
            
				}
			}
		})
    }

    const  fetchPhisician = async () => {
        return await getPhisician(context.userToken, phiId)
        .then((res) => {
            switch (res.status){
                case (200):{	
				    setPhisician({phi: res.data});
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const fetchOrderingUnits = async () =>{
        return await getPhisicianOrderingUnits(context.userToken, phiId)
        .then((res) => {
            switch (res.status){
                case (200):{	
				    setOrderingUnits(res.data);
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const deleteOrderingUnit = async (ordId) => {
        return await deletePhisicianOrderingUnit(context.userToken, phiId, ordId)
        .then((res) => {
            switch (res.status){
                case (204):{
				    setOrderingUnits(orderingUnits.filter(ord => ord.id!=ordId));
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    useEffect(()=>{
        fetchOrderingUnits();
        fetchPhisician()
        .finally(() =>setIsLoaded(true));   
    },[]);

    useEffect(()=>{
        console.log(isOpen)
    },[isOpen])

    useEffect(()=>{
        if (newOrderingUnit.pat.id!=null) addOrderingUnit();
    },[newOrderingUnit]);

    return !isLoaded ?
    <DoingWork/>:
    <>
    <main>
        <div className="content">
            <h2>Szczegóły lekarza</h2>
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
                            <p>Utworzył: </p>
                            <p>Zmodyfikował: </p>
                        </b>
                    </div>
                    <div>
                        <p>{getFormattedDateTime(phisician.phi.cretionTimeStamp)}</p>
                        <p>{getFormattedDateTime(phisician.phi.updateTimeStamp)}</p>
                        <p>{phisician.phi.createdBy}</p>
                        <p>{phisician.phi.lastModifiedBy}</p>
                    </div>
                </div>
                <div className="details-content-box">
                    <DetailsRow key={phisician.id} label="Imię:" value={phisician.phi.name}/>
                    <DetailsRow key={phisician.id} label="Nazwisko:" value={phisician.phi.surname}/>
                    <DetailsRow key={phisician.id} label="Nr. PWZ:" value={phisician.phi.personalIdentificationNumber}/>
                </div>
            </div>   
            <Collapsible name="Przypisani zleceniodawcy:">
            {orderingUnits.length>0?<PhisicianOrderingUnits orderingUnits={orderingUnits} onDelete={(id)=>{deleteOrderingUnit(id)}}/>:''}
            <GenericPopupForm
                triggerClassName='popup-button'
                name='Dodaj' 
                okId="ok"
                cancelId="return"
                okName="Dodaj"
                cancelName="Anuluj"
                onPopupAction={e =>{
                        if(e.target.id==='ok')
                        setRetriveObjectTrigger(!retriveObjectTrigger);
                    }
                }
                onPopupActionCloseTrigger={isOpen}
                handleClose={()=>setIsOpen(false)}
                handleOpen ={()=>setIsOpen(true)}
            >
                <OrderingUnitSearchPopup handleVisibility={(e)=> {setIsOpen(e)}} getAdd={getSelectedObject} retriveObject={retriveObjectTrigger}/>
            </GenericPopupForm>
            </Collapsible>
            
            <div className="page-buttons">
				<Link to={`/lab/tenant/phisicians/edit/${phiId}`} className="button-add">Edytuj</Link>
                <Link to="/lab/tenant/phisicians" className="button-return">Powrót</Link>
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

function PhisicianOrderingUnits(props) {
    const orderingUnits = props.orderingUnits;
    return <TableComponent 
    labelsArray={{
        shortName: "Skrócona nazwa",
        name: "Pelna nazwa",
        city: "Miasto",
        actions:  "Akcje"
    }}
    onTableHeaderClick={props.OnHeaderClick}
    >
       {orderingUnits.length>0 ? 
            orderingUnits.map((orderingUnit) =>
            <PatientListTableRow key={orderingUnit.id}
                patData={orderingUnit}
                labels={{
                    shortName: (v) =><Link to={`/lab/tenant/orderingUnits/details/${orderingUnit.id}`}>{v}</Link>,
                    name: null,
                    'address.city': null
                }}
            >
                <button key={orderingUnit.id} onClick={()=>props.onDelete(orderingUnit.id)} className="list-actions-button-details">Usuń</button>
            </PatientListTableRow>):<></>
        }
    </TableComponent>

}