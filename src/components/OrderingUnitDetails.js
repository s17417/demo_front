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
import { phisicianData } from "./PhisicianForm";
import { addOrderingUnitPhisician, deleteOrderingUnitPhisician, getOrderingUnit, getOrderingUnitOrders, getOrderingUnitPhisicians } from "../apiCalls/OrderingUnitApiCalls";
import { PhisiciansSearchPopup } from "./popups/PhisiciansSearchPopup";
import { RecordMetaData } from "./others/RecordMetaData";
import Collapsible from "./fragments/Collapsible";
import PageSizeAndIndexComponent from "./others/PageSizeAndIndexComponent";


export default function OrderingUnitDetails(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { ordId } = useParams();
    const [newPhisician,setNewPhisician]=useState(_.cloneDeep(phisicianData))
    const [phisicians, setPhisicians] = useState([]);
    const [orders,setOrders] = useState([]);
    const [orderingUnit, setOrderingUnit] = useState({
        ord: {}
    })
    const [totalPages, setTotalPages] = useState (1);
	const [currentPage,setCurrentPage] = useState(0);
	const [pageSize, setPageSize] = useState(25);
	const [sortOrder, setSortOrder] = useState({
		field: "CREATION_DATE",
		direction: "DESC"
	})
    const [retriveObjectTrigger,setRetriveObjectTrigger]=useState(false);
    const [isPhisiciansOpen, setPhisiciansIsOpen]=useState(false);
    
    const getSelectedPhisician = phi => setNewPhisician(phi);
    
    const OnHeaderClick = () =>{
        console.log("kddkdk");
    }

    const addPhisician = async() => {
        await addOrderingUnitPhisician(context.userToken, ordId ,newPhisician.pat.id)
        .then(res => {
			switch (res.status){
				case (200):{
                    setPhisiciansIsOpen(false);
                    setPhisicians(phisicians.find(obj=>obj.id===newPhisician.pat.id)?phisicians:[...phisicians,newPhisician.pat])
				    setConnectionError("");
                    setNewPhisician(_.cloneDeep(phisicianData));
				};
				break;
				case (422): {
                    setPhisiciansIsOpen(true);
                    const phi =  _.cloneDeep(newPhisician);
					Object.keys(res.data.message)
					.map(key => {
                        _.set(phi.err, 'err', res.data.message[key]); 
					})
                    setNewPhisician(phi);
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${res.data.message}`:''}`);					
					console.log(res.data)            
				}
			}
		})
    }

    const  fetchOrderingUnit = async () => {
        return await getOrderingUnit(context.userToken, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{	
				    setOrderingUnit({ord: res.data});
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const fetchPhisicians = async () =>{
        return await getOrderingUnitPhisicians(context.userToken, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{	
				    setPhisicians(res.data);
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const deletePhisician = async (phiId) => {
        return await deleteOrderingUnitPhisician(context.userToken, ordId, phiId)
        .then((res) => {
            switch (res.status){
                case (204):{
				    setPhisicians(phisicians.filter(ord => ord.id!=phiId));
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const fetchOrders = async () =>{
        return await getOrderingUnitOrders(context.userToken, currentPage, pageSize, sortOrder, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    setOrders(res.data.content);
                    setTotalPages(res.data.totalPages);
                    setConnectionError("");
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
                    setOrders([]);
					console.log(res.data);
                }
            }
        })
    }

    useEffect(()=>{
        fetchPhisicians()
        fetchOrderingUnit()
        .finally(() =>setIsLoaded(true));   
    },[]);

    useEffect(()=>{
        if (newPhisician.pat.id!=null) addPhisician();
    },[newPhisician]);

    useEffect(()=>{
        fetchOrders();
    },[currentPage,pageSize,sortOrder]);

    return !isLoaded ?
    <DoingWork/>:
    <>
    <main>
        <div className="content">
            <h2>Szczegóły zleceniodawcy</h2>
            {
		    connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
            <><div className="details-main-box">
                <RecordMetaData
                    creationTimeLabel="Utworzono:"
                    updateTimeLabel="Zmodyfikowano:"
                    createdByLabel="Utworzył:"
                    updatedByLabel="Zmodyfikował:"
                    creationTime={getFormattedDateTime(orderingUnit.ord.cretionTimeStamp)}
                    updateTime={getFormattedDateTime(orderingUnit.ord.updateTimeStamp)}
                    createdBy={orderingUnit.ord.createdBy}
                    updatedBy={orderingUnit.ord.lastModifiedBy}
                />
                <div className="details-content-box">
                    <DetailsRow key={orderingUnit.id} label="Skróćona nazwa:" value={orderingUnit.ord.shortName}/>
                    <DetailsRow key={orderingUnit.id} label="Pełna nazwa:" value={orderingUnit.ord.name}/>
                    <DetailsRow key={orderingUnit.id} label="Państwo:" value={orderingUnit.ord.address.country}/>
                    <DetailsRow key={orderingUnit.id} label="Region:" value={orderingUnit.ord.address.state}/>
                    <DetailsRow key={orderingUnit.id} label="Miasto:" value={orderingUnit.ord.address.city}/>
                    <DetailsRow key={orderingUnit.id} label="Ulica:" value={orderingUnit.ord.address.street}/>
                    <DetailsRow key={orderingUnit.id} label="Kod pocztowy:" value={orderingUnit.ord.address.postalCode}/>

                </div>
            </div>    
            <Collapsible name="Przypisani lekarze:">
                {phisicians.length>0?
                <OrderingUnitsPhisicians
                    phisicians={phisicians}
                    onDelete={(id)=>{deletePhisician(id)}}
                />:''
                }
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
                    onPopupActionCloseTrigger={isPhisiciansOpen}
                    handleClose={()=>setPhisiciansIsOpen(false)}
                    handleOpen ={()=>setPhisiciansIsOpen(true)}
                >
                    <PhisiciansSearchPopup handleVisibility={(e)=> {setPhisiciansIsOpen(e)}} getAdd={getSelectedPhisician} retriveObject={retriveObjectTrigger}/>
                </GenericPopupForm>
            </Collapsible>
            
            <Collapsible name="Przypisane zlecenia:">
            {orders.length>0 ?<>
                <TableComponent 
                    labelsArray={{
                        orderIdentificationCode: "Nr. zlecenia",
                        surname: "Nazwisko",
                        name: "Imię",
                        personalIdentificationNumber: "PESEL",
                        cretionTimeStamp:"Data utworzenia",
                        updateTimeStamp:"Data aktualizacji"
                    }}
                    onTableHeaderClick={props.OnHeaderClick}
                    >
                    { 
                        orders.map((order) =>
                        <PatientListTableRow key={order.id}
                            patData={order}
                            labels={{
                                orderIdentificationCode: v => <Link to={`/lab/tenant/patientOrders/details/${order.id}`}>{v}</Link>,
                                "patient.surname": v => <Link to={`/lab/tenant/patients/details/${order.patient.id}`}>{v}</Link> ,
                                "patient.name": null,
                                "patient.personalIdentificationNumber": null,
                                cretionTimeStamp: v=>getFormattedDateTime(v),
                                updateTimeStamp: v=>getFormattedDateTime(v)
                            }}
                        />)
                    }
                </TableComponent>
                
                <PageSizeAndIndexComponent 
					totalPages={totalPages} 
					currentPage={currentPage}
					onPageClick={(page) => setCurrentPage(page)}
					onPageSizeSelection={(e) => {setPageSize(e.target.value);setCurrentPage(0)}}
					pageSizeArray={[25,50,250,500]}
				/></>:''
            }	
            </Collapsible>


            <div className="page-buttons">
				<Link to={`/lab/tenant/orderingUnits/edit/${ordId}`} className="button-add">Edytuj</Link>
                <Link to="/lab/tenant/orderingUnits" className="button-return">Powrót</Link>
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

function OrderingUnitsPhisicians(props) {
    const phisicians = props.phisicians;
    return <TableComponent 
    labelsArray={{
        surname: "Nazwisko",
        name: "Imię",
        personalIdentificationNumber: "Nr. PWZ",
        actions:  "Akcje"
    }}
    onTableHeaderClick={props.OnHeaderClick}
    
    >
       {phisicians.length>0 ? 
            phisicians.map((phisician) =>
            <PatientListTableRow key={phisician.id}
                patData={phisician}
                labels={{
                    surname: (v) =><Link to={`/lab/tenant/phisicians/details/${phisician.id}`}>{v}</Link>,
                    name: null,
                    personalIdentificationNumber: null
                }}
            >
                <button key={phisician.id} onClick={()=>props.onDelete(phisician.id)} className="list-actions-button-details">Usuń</button>
            </PatientListTableRow>):<></>
        }
    </TableComponent>

}