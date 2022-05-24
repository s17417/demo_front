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
import { RecordMetaData } from "./others/RecordMetaData";
import { cancelPatientOrderStatus, getOrderResults, getPatientOrder, getPatientOrderSamples } from "../apiCalls/PatientOrderCalls";
import { OrderResultAddPopup } from "./popups/OrderResultPopups";
import { checkPriviliges } from "./others/PriviligiesNamesConv";



export default function PatientOrdersDetails(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { ordId } = useParams();
    const [orderResults, setOrderResults] = useState([]);
    const [patientSamples, setPatientSamples] = useState([]);
    const [patientOrder, setPatientOrder] = useState({
        ord: {}
    });
    const [editedOrderResult, setEditedOrderResult] = useState(null);
    const [retriveObjectTrigger,setRetriveObjectTrigger]=useState(false);
    const [isNewOrderOpen, setIsNewOrderOpen]=useState(false);
    const addOrderResult = async (obj) =>{
        const index= orderResults
        .findIndex((value) => value.id===obj.id);
        if(index!=-1){
            const tmp = _.cloneDeep(orderResults);
            tmp[index]=obj;
            setOrderResults(tmp);
        } else
        setOrderResults([...orderResults,obj])
    }

    const addSampleResult = async (obj) =>{
        const index= patientSamples
        .findIndex((value) => value.id===obj.id);
        if(index!=-1){
            const tmp = _.cloneDeep(patientSamples);
            tmp[index]=obj;
            setPatientSamples(tmp);
        } else
        setPatientSamples([...patientSamples,obj])
    }
    
    const OnHeaderClick = () =>{
        console.log("kddkdk");
    }

    const cancelOrderResult = async(orderResult) => {
        console.log()
        await cancelPatientOrderStatus(context.userToken, ordId, orderResult.sample.id, orderResult.id)
        .then(res => {
			switch (res.status){
				case (200):{
                    console.log(res.data);
                    addOrderResult(res.data);
				    setConnectionError("");
				};
                break;
				default: {
                    console.log(res.data)
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.parse(res.data.message)}`:''}`);					
					console.log(res.data)            
				}
			}
		})
    }

    const  fetchPatientOrder = async () => {
        return await getPatientOrder(context.userToken, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{
				    setPatientOrder({ord: res.data});
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const fetchOrderResults = async () =>{
        return await getOrderResults(context.userToken, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{
				    setOrderResults(res.data);
                }
                break;
				default: {
                    console.log(res.data)
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const fetchPatientOrderSamples = async () =>{
        return await getPatientOrderSamples(context.userToken, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    setPatientSamples(res.data);
                    setConnectionError("");
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
                    setPatientSamples([]);
					console.log(res.data);
                }
            }
        })
    }

    useEffect(()=>{
        fetchOrderResults()
        fetchPatientOrder()
        .finally(() =>setIsLoaded(true));   
    },[]);

    useEffect(()=>{
        fetchPatientOrderSamples();
    },[]);

    return !isLoaded ?
    <DoingWork/>:
    <>
    <main>
        <div className="content">
            <h2>Szczegóły zlecenia</h2>
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
                    creationTime={getFormattedDateTime(patientOrder.ord.cretionTimeStamp)}
                    updateTime={getFormattedDateTime(patientOrder.ord.updateTimeStamp)}
                    createdBy={patientOrder.ord.createdBy}
                    updatedBy={patientOrder.ord.lastModifiedBy}
                />
                <div className="details-content-box">
                    <DetailsRow key={1} label="Nr.:" value={patientOrder.ord.orderIdentificationCode}/>
                    <DetailsRow key={2} label="Data zlecenia:" value={patientOrder.ord.orderDate}/>
                    <DetailsRow key={3} label="Imię:" value={patientOrder.ord.patient.name}/>
                    <DetailsRow key={4} label="Nazwisko:" value={<Link to={`/lab/tenant/patients/details/${patientOrder.ord.patient.id}`}>{patientOrder.ord.patient.surname}</Link>}/>
                    <DetailsRow key={5} label="PESEL:" value={patientOrder.ord.patient.personalIdentificationNumber}/>
                    <DetailsRow key={6} label="Data urodzenia:" value={patientOrder.ord.patient.dateOfBirth}/>
                    <DetailsRow key={7} label="Płeć:" value={patientOrder.ord.patient.gender}/>
                    <DetailsRow key={patientOrder.ord.id+8}
                        label="Zleceniodawca:"
                        value={
                            patientOrder.ord.orderingUnit?
                            <Link to={`/lab/tenant/orderingUnits/details/${patientOrder.ord.orderingUnit.id}`}>
                                {`${patientOrder.ord.orderingUnit.shortName}`}
                                {`\n${patientOrder.ord.orderingUnit.name}`}
                                {`\n${patientOrder.ord.orderingUnit.address.city}`}
                            </Link>:''
                        }
                    />
                    <DetailsRow key={9}
                        label="Lekarz kierujący:"
                        value={
                            patientOrder.ord.phisician?
                            <Link to={`/lab/tenant/phisicians/details/${patientOrder.ord.phisician.id}`}>{`${patientOrder.ord.phisician.surname} ${patientOrder.ord.phisician.name}`}</Link>
                            :''
                        }
                    />
                       
                    
                </div>
            </div>    
            <h2>Przypisane analizy:</h2>
                {orderResults.length>0?
                <OrderResults
                    onEdit={(id)=>{setEditedOrderResult(id); setIsNewOrderOpen(true);}}
                    onCancel={(orderResult) =>cancelOrderResult(orderResult)}
                    orderResults={orderResults}
                    patId={patientOrder.ord.id}
                />:''
                }
                {checkPriviliges("SPECIFIC_DATABASE_USER",context.userRole)?
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
                        onPopupActionCloseTrigger={isNewOrderOpen}
                        handleClose={()=>{setIsNewOrderOpen(false);setEditedOrderResult(null)}}
                        handleOpen ={()=>setIsNewOrderOpen(true)}
                    >
                        <OrderResultAddPopup
                            returnSample={addSampleResult}
                            returnObject={addOrderResult}
                            retriveObject={retriveObjectTrigger}
                            patientOrderId={patientOrder.ord.id}
                            patientSamples={patientSamples}
                            orderResult={editedOrderResult}
                            handleVisibility={(e)=> {setIsNewOrderOpen(e)}}
                        />
                    </GenericPopupForm>:''
                }
            
            <h2>Przypisany materiał:</h2>
            {patientSamples.length>0 ?
                <TableComponent 
                    labelsArray={{
                        sampleId: "ID próbki",
                        collectionDate: "Data pobrania",
                        speciment: "Materiał",
                        cretionTimeStamp:"Data utworzenia",
                        updateTimeStamp:"Data aktualizacji"
                    }}
                    onTableHeaderClick={props.OnHeaderClick}
                    >
                    { 
                        patientSamples.map((sample) =>
                        <PatientListTableRow key={sample.id}
                            patData={sample}
                            labels={{
                                sampleId: null,
                                collectionDate: v=>v?getFormattedDateTime(v):'',
                                "specimentType.speciment": null,
                                cretionTimeStamp: v=>getFormattedDateTime(v),
                                updateTimeStamp: v=>getFormattedDateTime(v)
                            }}
                        />)
                    }
                </TableComponent>:''
            }


            <div className="page-buttons">
            {checkPriviliges("SPECIFIC_DATABASE_USER",context.userRole)?
				<Link to={`/lab/tenant/patientOrders/edit/${ordId}`} className="button-add">Edytuj</Link>:''
            }
                <Link to="/lab/tenant/patientOrders" className="button-return">Powrót</Link>
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

function OrderResults(props) {
    const context = useContext(StateContext);
    const orderResults = props.orderResults;
    const patId=props.patId;
    return <TableComponent 
    labelsArray={{
        sampleId: "ID próbki",
        tatMode:"Tryb",
        labTestOrderStatus:"Status",
        name:"Analiza",
        createdBy:"Utworzył",
        cretionTimeStamp: "Data utworzenia",
        updateTimeStamp: "Data aktualizacji",
        actions:  "Akcje"
    }}
    onTableHeaderClick={props.OnHeaderClick}
    
    >
       {orderResults.length>0 ? 
            orderResults.map((phisician) =>
            <PatientListTableRow key={phisician.id}
                patData={phisician}
                labels={{
                    "sample.sampleId": null,
                    tatMode:null,
                    labTestOrderStatus:null,
                    "laboratoryTest.name":null,
                    createdBy:null,
                    cretionTimeStamp: v=>getFormattedDateTime(v),
                    updateTimeStamp: v=>getFormattedDateTime(v)
                }}
            >  
                <Link className="list-actions-button-details" to={`/lab/tenant/patientOrders/${patId}/patientSamples/${phisician.sample.id}/ordersResults/${phisician.id}/analytesResults`}>Wynik</Link>
                {checkPriviliges("SPECIFIC_DATABASE_USER",context.userRole)?
                    <button key={phisician.id} onClick={()=>{props.onEdit(phisician)}} className="list-actions-button-details">Edytuj</button>:''
                }
                {checkPriviliges("SPECIFIC_DATABASE_USER",context.userRole)?
                    <button key={phisician.id} onClick={()=>{props.onCancel(phisician)}} className="list-actions-button-details">Anuluj</button>:''
                }
            </PatientListTableRow>):<></>
        }
    </TableComponent>

}