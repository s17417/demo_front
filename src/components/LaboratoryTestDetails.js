import { useEffect, useContext, useState } from "react";
import { StateContext } from "../App";
import { PatientListTableRow } from "./others/TableComponent";
import { Link } from "react-router-dom";
import TableComponent from "./others/TableComponent";
import { getFormattedDateTime } from "./others/DateHelper";
import { useParams } from "react-router-dom";
import { DoingWork } from "./others/DoingWork";
import GenericPopupForm, { GenericPopupDetails } from "./popups/AddComment";
import _ from "lodash";
import { RecordMetaData } from "./others/RecordMetaData";
import { deleteMethod, getLaboratoryTest, getMethods } from "../apiCalls/LaboratoryTestApiCalls";
import { MethodDetailsPopup, MethodFormPopup } from "./popups/MethodPopup";
import { DetailsRow } from "./DetailsRow";
import { checkPriviliges } from "./others/PriviligiesNamesConv";



export default function LaboratoryTestDetails(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { ltdId } = useParams();
    const [methodsList, setMethodsList] = useState([]);
    const [laboratoryTest, setLaboratoryTest] = useState({});
    const [editedAnalyte, setEditedAnalyte] = useState(null);
    const [inactiveMethods, setInactiveMethods]= useState(true);
    const [retriveObjectTrigger,setRetriveObjectTrigger]=useState(false);
    const [isNewOrderOpen, setIsNewOrderOpen]=useState(false);
   
    const getObjectCallback=(v)=>{
        setMethodsList([...methodsList,v]);
    }
    
    const OnHeaderClick = () =>{
        console.log("kddkdk");
    }

    const removeMethod = async (methodId) => {
        return await deleteMethod(context.userToken, ltdId, methodId)
        .then((res) => {
            switch (res.status){
                case (204):{
                    if (!inactiveMethods)setMethodsList(methodsList.filter(obj => obj.id!==methodId))
                    else{
                        fetchMethods();
                    }
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const  fetchLaboratoryTest = async () => {
        return await getLaboratoryTest(context.userToken, ltdId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    console.log(res.data);
				    setLaboratoryTest(res.data);
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const fetchMethods = async () =>{
        return await getMethods(context.userToken,inactiveMethods, ltdId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    console.log(res.data)
				    setMethodsList(res.data.sort((obj1,obj2) => {
                        if(obj1.isActive!==obj2.isActive)
                            return obj1.isActive===true?-1:1
                        else return 0
                    }
                    ));
                }
                break;
				default: {
                    console.log(res.data)
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }


    useEffect(()=>{
        fetchMethods()
        fetchLaboratoryTest()
        .finally(() =>setIsLoaded(true));   
    },[]);

    return !isLoaded ?
    <DoingWork/>:
    <>
    <main>
        <div className="content">
            <h2>Szczegóły Testu</h2>
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
                    creationTime={getFormattedDateTime(laboratoryTest.cretionTimeStamp)}
                    updateTime={getFormattedDateTime(laboratoryTest.updateTimeStamp)}
                    createdBy={laboratoryTest.createdBy}
                    updatedBy={laboratoryTest.lastModifiedBy}
                />
                <div className="details-content-box">
                    <DetailsRow key={1} label="Skrócona nazwa:" value={laboratoryTest.shortName}/>
                    <DetailsRow key={2} label="Nazwa:" value={laboratoryTest.name}/>
                    <DetailsRow key={3} label="Materiał:" value={laboratoryTest.specimentType.speciment}/>
                    <DetailsRow key={4}
                        label="Opis:"
                        value={`${laboratoryTest.description}`}
                    /> 
                </div>
            </div>    
            <h2>Przypisane anality:</h2>
                {methodsList.length>0?
                <MethodList
                    onRemove={removeMethod}
                    onEdit={(id)=>{setEditedAnalyte(id); setIsNewOrderOpen(true);}}
                    methodsList={methodsList}
                />:''
                }
                {checkPriviliges("SPECIFIC_DATABASE_ADMIN",context.userRole)?
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
                        handleClose={()=>{setIsNewOrderOpen(false);setEditedAnalyte(null)}}
                        handleOpen ={()=>setIsNewOrderOpen(true)}
                    >
                        <MethodFormPopup
                            ltdId={laboratoryTest.id}
                            retriveObject={retriveObjectTrigger}
                            getObjectCallback={getObjectCallback}
                        />
                    </GenericPopupForm>:''
                }
            <div className="page-buttons">
            {checkPriviliges("SPECIFIC_DATABASE_ADMIN",context.userRole)?
				<Link to={`/lab/tenant/laboratoryTests/edit/${ltdId}`} className="button-add">Edytuj</Link>:''
            }
                <Link to="/lab/tenant/laboratoryTests/" className="button-return">Powrót</Link>
            </div>
        </>}
        </div>
    </main>
    </>
}

function MethodList(props) {
    const context = useContext(StateContext);
    const methodsList = props.methodsList;
    return <TableComponent 
    labelsArray={{
        analyte: "Analit",
        analyticalMethodType:"Metoda analityczna",
        type:"Typ metody",
        units:"Jednostki",
        createdBy:"Utworzył",
        cretionTimeStamp: "Data utworzenia",
        actions:  "Akcje"
    }}
    onTableHeaderClick={props.OnHeaderClick}
    
    >
       {methodsList.length>0 ? 
            methodsList.map((met) =>
            <PatientListTableRow
                key={met.id}
                deactivated={!met.isActive}
                patData={met}
                labels={{
                    "analyte.name": null,
                    analyticalMethodType:null,
                    type:null,
                    units:null,
                    createdBy:null,
                    cretionTimeStamp: v=>getFormattedDateTime(v)
                }}
            >  

                <GenericPopupDetails
                    trigger={<button key={met.id} onClick={()=>{props.onEdit(met)}} className="list-actions-button-details">{`Szczegóły`}</button>}
                    cancelLabel={"Ok"}
                >
                    <MethodDetailsPopup
                        method={met}
                    />
                </GenericPopupDetails>

                {met.isActive&&checkPriviliges("SPECIFIC_DATABASE_ADMIN",context.userRole)?<button key={met.id} onClick={()=>props.onRemove(met.id)} className="list-actions-button-details">Usuń</button>:''}
            
            </PatientListTableRow>):<></>
        }
    </TableComponent>

}