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
import { cancelControlOrderStatus, getControlOrder, getControlOrderSamples, getControlResults } from "../apiCalls/ControlOrderApiCalls";
import { ControlResultAddPopup } from "./popups/ControlResultPopups";
import { checkPriviliges } from "./others/PriviligiesNamesConv";



export default function ControlOrdersDetails(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { ordId } = useParams();
    const [controlResults, setControlResults] = useState([]);
    const [controlSamples, setControlSamples] = useState([]);
    const [controlOrder, setControlOrder] = useState({
        ord: {}
    });
    const [editedControlResult, setEditedControlResult] = useState(null);
    const [retriveObjectTrigger,setRetriveObjectTrigger]=useState(false);
    const [isNewOrderOpen, setIsNewOrderOpen]=useState(false);
   
    const addControlResult = async (obj) =>{
        fetchControlResults();
        /*const index= controlResults
        .findIndex((value) => value.id===obj.id);
        if(index!=-1){
            const tmp = _.cloneDeep(controlResults);
            tmp[index]=obj;
            setControlResults(tmp);
        } else
        setControlResults([...controlResults,obj])*/
    }

    const addSampleResult = async (obj) =>{
        const index= controlSamples
        .findIndex((value) => value.id===obj.id);
        if(index!=-1){
            const tmp = _.cloneDeep(controlSamples);
            tmp[index]=obj;
            setControlSamples(tmp);
        } else
        setControlSamples([...controlSamples,obj])
    }
    
    const OnHeaderClick = () =>{
        console.log("kddkdk");
    }

    const cancelControlResult = async(orderResult) => {
        console.log()
        await cancelControlOrderStatus(context.userToken, ordId, orderResult.sample.id, orderResult.id)
        .then(res => {
			switch (res.status){
				case (200):{
                    console.log(res.data);
                    addControlResult(res.data);
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

    const  fetchControtOrder = async () => {
        return await getControlOrder(context.userToken, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{
				    setControlOrder({ord: res.data});
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const fetchControlResults = async () =>{
        return await getControlResults(context.userToken, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{
				    setControlResults(res.data);
                }
                break;
				default: {
                    console.log(res.data)
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const fetchControlOrderSamples = async () =>{
        return await getControlOrderSamples(context.userToken, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    setControlSamples(res.data);
                    setConnectionError("");
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
                    setControlSamples([]);
					console.log(res.data);
                }
            }
        })
    }

    useEffect(()=>{
        fetchControlResults()
        fetchControtOrder()
        .finally(() =>setIsLoaded(true));   
    },[]);

    useEffect(()=>{
        fetchControlOrderSamples();
    },[]);

    return !isLoaded ?
    <DoingWork/>:
    <>
    <main>
        <div className="content">
            <h2>Szczegóły kontroli</h2>
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
                    creationTime={getFormattedDateTime(controlOrder.ord.cretionTimeStamp)}
                    updateTime={getFormattedDateTime(controlOrder.ord.updateTimeStamp)}
                    createdBy={controlOrder.ord.createdBy}
                    updatedBy={controlOrder.ord.lastModifiedBy}
                />
                <div className="details-content-box">
                    <DetailsRow key={1} label="Nr.:" value={controlOrder.ord.orderIdentificationCode}/>
                    <DetailsRow key={2} label="Nazwa:" value={controlOrder.ord.name}/>
                    <DetailsRow key={3} label="Opis:" value={controlOrder.ord.description}/>
                   
                       
                    
                </div>
            </div>

            <h2>Wartości docelowe kontroli:</h2>
                {controlResults.length>0?
                <ControlTargets
                    onEdit={(id)=>{setEditedControlResult(id); setIsNewOrderOpen(true);}}
                    onCancel={(orderResult) =>cancelControlResult(orderResult)}
                    orderResults={controlResults
                            .filter(obj => obj.targetValue)
                            .sort((a,b) => a.laboratoryTest.name.localeCompare(b.laboratoryTest.name))
                        }
                    patId={controlOrder.ord.id}
                />:''
                }

            <h2>Przypisane analizy kontrolne:</h2>
                {controlResults.length>0?
                <ControlResults
                    onEdit={(id)=>{setEditedControlResult(id); setIsNewOrderOpen(true);}}
                    onCancel={(orderResult) =>cancelControlResult(orderResult)}
                    orderResults={controlResults
                            .filter(obj => !obj.targetValue)
                            .sort((a,b) => a.laboratoryTest.name.localeCompare(b.laboratoryTest.name))
                        }
                    patId={controlOrder.ord.id}
                />:''
                }
                {checkPriviliges("SPECIFIC_DATABASE_TECHNICIAN",context.userRole)?
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
                    handleClose={()=>{setIsNewOrderOpen(false);setEditedControlResult(null)}}
                    handleOpen ={()=>setIsNewOrderOpen(true)}
                >
                    <ControlResultAddPopup
                        returnSample={addSampleResult}
                        returnObject={addControlResult}
                        retriveObject={retriveObjectTrigger}
                        controlOrderId={controlOrder.ord.id}
                        patientSamples={controlSamples}
                        orderResult={editedControlResult}
                        handleVisibility={(e)=> {setIsNewOrderOpen(e)}}
                    />
                </GenericPopupForm>:''
                }
            
            <h2>Przypisany materiał:</h2>
            {controlSamples.length>0 ?
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
                        controlSamples.map((sample) =>
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
                {checkPriviliges("SPECIFIC_DATABASE_TECHNICIAN",context.userRole)?
				    <Link to={`/lab/tenant/controlOrders/edit/${ordId}`} className="button-add">Edytuj</Link>:''
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

function ControlResults(props) {
    const context = useContext(StateContext);
    const orderResults = props.orderResults;
    const patId=props.patId;
    return <TableComponent 
    labelsArray={{
        sampleId: "ID próbki",
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
                    labTestOrderStatus:null,
                    "laboratoryTest.name":null,
                    createdBy:null,
                    cretionTimeStamp: v=>getFormattedDateTime(v),
                    updateTimeStamp: v=>getFormattedDateTime(v)
                }}
            >  
                <Link className="list-actions-button-details" to={`/lab/tenant/controlOrders/${patId}/controlSamples/${phisician.sample.id}/controlResults/${phisician.id}/analytesResults`}>Wynik</Link>
                {checkPriviliges("SPECIFIC_DATABASE_TECHNICIAN",context.userRole)?
                    <button key={phisician.id} onClick={()=>{props.onEdit(phisician)}} className="list-actions-button-details">Edytuj</button> :''
                }
                {checkPriviliges("SPECIFIC_DATABASE_TECHNICIAN",context.userRole)?
                    <button key={phisician.id} onClick={()=>{props.onCancel(phisician)}} className="list-actions-button-details">Anuluj</button>:''
                }
                
            </PatientListTableRow>):<></>
        }
    </TableComponent>

}

function ControlTargets(props) {
    const context=useContext(StateContext);
    const orderResults = props.orderResults;
    const patId=props.patId;
    return <TableComponent 
    labelsArray={{
        sampleId: "ID próbki",
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
                    "laboratoryTest.name":null,
                    createdBy:null,
                    cretionTimeStamp: v=>getFormattedDateTime(v),
                    updateTimeStamp: v=>getFormattedDateTime(v)
                }}
            >  
                <Link className="list-actions-button-details" to={`/lab/tenant/controlOrders/${patId}/controlSamples/${phisician.sample.id}/controlResults/${phisician.id}/analytesResults`}>Wynik</Link>
                {checkPriviliges("SPECIFIC_DATABASE_TECHNICIAN",context.userRole)?
                    <button key={phisician.id} onClick={()=>{props.onEdit(phisician)}} className="list-actions-button-details">Edytuj</button>:''
                }            
            </PatientListTableRow>):<></>
        }
    </TableComponent>

}