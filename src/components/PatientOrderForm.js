import { useContext, useState, useEffect } from "react";
import { DoingWork } from "./others/DoingWork";
import { StateContext } from "../App";
import { InputSearchForm, InputSearchFormChildren, InputTextArea, Option, Select } from "./others/SerchBarComponents";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import formMode from "./others/FormMode";
import { addUpdatePatientOrder, getPatientOrder } from "../apiCalls/PatientOrderCalls";
import GenericPopupForm from "./popups/AddComment";
import { PatientAddPopup, PatientSearchPopup } from "./popups/PatientPopups";
import { patientData } from "./others/PatientForm";
import { OrderingUnitSearchPopup } from "./popups/OrderingUnitPopups";
import { getOrderingUnitPhisicians } from "../apiCalls/OrderingUnitApiCalls";

const orderData = {
    ord: {
        id:null,
        orderIdentificationCode:null,
        patient: {
            id:null,
            name:null,
            surname:null
        },
        orderingUnit: {
            id:null,
            name:null,
            shortName:null
        },
        phisician: {
            id:null
        },
        orderDate:null
    },
    err: {
        orderIdentificationCode:'',
        patient: '',
        orderingUnit:'',
        phisician: {
            id:''
        },
        orderDate:''
    }
}

export default function PatientOrderForm(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(true);
    const [post,setPost] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { ordId } = useParams();
    const navigate = useNavigate();
    const currentFormMode = ordId ? formMode.EDIT : formMode.NEW;
	const [patientOrder, setPatientOrder] = useState(_.cloneDeep(orderData));
    const [selectedPatient, setSelectedPatient] = useState(_.cloneDeep(patientData));
    const [phisicians, setPhisicians] = useState(null);

    const OnPopupAction = (e) =>{
        if (e.target.id==='ok'){
        } else {

        }
    }
    
    const handleClick = (e) =>{
        e.preventDefault(); 
        setPost(true);
    }

    const handleChange = (event) =>{
        console.log(event);
        event.preventDefault();
        const {name, value} = event.target;
        const patOrd = _.cloneDeep(patientOrder);
        _.set(patOrd.ord, name, value==''?null:value);
        _.set(patOrd.err, name,'');
        setPatientOrder(patOrd);
        console.log(patOrd);
    }

    const createUpdatePatientOrder = () => {
        console.log(patientOrder)
        if (post==false) return;
		addUpdatePatientOrder(context.userToken, patientOrder.ord)
		.then(res => {
			switch (res.status){
                case (200):{
                    navigate(`/lab/tenant/patientOrders/${ordId}`);
                };
                break;
				case (201):{
				    setPatientOrder(_.cloneDeep(orderData));
				    setConnectionError("");
				};
				break;
				case (422): {
                    console.log(res.data)
                    const ord =  _.cloneDeep(patientOrder);
					Object.keys(res.data.message)
						.map(key => {
                            if (key!='1062')
                            _.set(ord.err, key, res.data.message[key]);

                               // _.set(ord.err, key==('patient'||'phisician'||'orderingUnit')?key+'.id':key, res.data.message[key]);
                            else {
                                console.log(JSON.stringify(res.data.message));
                                const reg= /(AbstractOrder)([.])([aA-zZ]+)/gm;
                                const k=res.data.message[key].match(reg)[0].split('.')[1]; 
                                _.set(ord.err, k, res.data.message[key]);
                            }
                            
                            
						})
                    setPatientOrder(ord);
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${res.data.message}`:''}`);					
					console.log(res.data)
				}
			}
		})
		.finally(() => {
            setPost(false);
		})
	}

    const fetchPatientOrder = async () => {     
        return await getPatientOrder(context.userToken, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    const ord =res.data;	
				    const p = _.cloneDeep(patientOrder);
                    p.ord=ord;
                    setPatientOrder(p);
                    setIsLoaded(true);      
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const fetchPhisicians = async () => {
        return await getOrderingUnitPhisicians(context.userToken, patientOrder.ord.orderingUnit.id)
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

    useEffect(()=>{
        if (currentFormMode === formMode.EDIT) {fetchPatientOrder()
        }
    },[]);

    useEffect(()=>{
        if (patientOrder.ord.orderingUnit&&patientOrder.ord.orderingUnit.id!=null) fetchPhisicians();
        else setPhisicians(null);
        
    },[patientOrder.ord.orderingUnit]);

    useEffect(()=>{if (post==true) createUpdatePatientOrder()},[post])

    useEffect(()=>{
        const patOrd=_.cloneDeep(patientOrder);
        patOrd.ord.patient.id=selectedPatient.pat.id;
        setPatientOrder(patOrd);
    },[selectedPatient])

    return !isLoaded ?
    <DoingWork/>:
    (
    <main>
        <div className="content">
		    <h2>Nowe zlecenie</h2>
            {
		    connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
            <>
                <Form
                    currentFormMode ={currentFormMode}
                    patientOrder={patientOrder}
                    phisicians={phisicians}
                    handleClick={handleClick} 
                    handleChange={handleChange}
                    OnPopupAction={OnPopupAction}
                   
                />
            </>
            }
        </div>
    </main>
    )

}

export function Form ({currentFormMode, patientOrder, phisicians, handleClick, handleChange}){
    const [isSelectPatientOpen, setIsSelectPatientOpen] = useState(false);
    const [isSelectOrderingUnitOpen,setIsSelectOrderingUnitOpen] = useState(false);
    const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
	const [retriveAdd, setRetriveAdd] = useState(false);
    const [mode, setMode]=useState(currentFormMode.NEW);
    const getAdd = (pat)=>{
        console.log(pat)
        if (_.has(pat,'personalIdentificationNumber'))handleChange({target:{name:"patient",value:pat},preventDefault:()=>{}});
        if (_.has(pat.pat,'shortName'))handleChange({target:{name:"orderingUnit",value:pat.pat},preventDefault:()=>{}});

    }

    useEffect(() => {
        console.log(currentFormMode)
        setMode(currentFormMode);
    },[currentFormMode])

    return <><form className="form" onKeyDown={(e)=>{if(e.code==="Enter")e.preventDefault()}} onSubmit={(e)=> e.preventDefault()}>
				<fieldset className="searchFieldset">
					
				<InputSearchForm
                    disabled = {mode!=formMode.NEW?true:false}
					label = "Nr zlecenia:"
					name = "orderIdentificationCode"
					type = "text"
					error={patientOrder.err.orderIdentificationCode}
                    value={patientOrder.ord.orderIdentificationCode?patientOrder.ord.orderIdentificationCode:''}
					onChange={handleChange}
				/>	
				<InputSearchFormChildren
                    disabled={true}
					label = "Pacjent:"
					name = "patient.id"
					type = "text"
					error={patientOrder.err.patient}
                    value={(patientOrder.ord.patient.name?patientOrder.ord.patient.name:'')+' '+(patientOrder.ord.patient.surname?patientOrder.ord.patient.surname:'')+(patientOrder.ord.patient.personalIdentificationNumber?' > '+patientOrder.ord.patient.personalIdentificationNumber:patientOrder.ord.patient.dateOfBirth?' > ur: '+patientOrder.ord.patient.dateOfBirth:'')/*patient?patient:''*/}
				>
                    <GenericPopupForm
                        name={<img  src="/img/search.svg"  alt="Kiwi standing on oval"/>} 
                        okId="ok"
                        cancelId="return"
                        okName="Dodaj"
                        cancelName="Anuluj"
                        onPopupAction={e =>{
                                if(e.target.id==='ok')
                                setRetriveAdd(!retriveAdd);
                            }
                        }
                        onPopupActionCloseTrigger={isSelectPatientOpen}
                        handleClose={()=>setIsSelectPatientOpen(false)}
                        handleOpen ={()=>setIsSelectPatientOpen(true)}
                    >
                        <PatientSearchPopup handleVisibility={(e)=> {setIsSelectPatientOpen(e)}} getAdd={getAdd} retriveObject={retriveAdd}/>
                    </GenericPopupForm>

                    <GenericPopupForm
                        name="+"
                        okId="ok"
                        cancelId="return"
                        okName="Dodaj"
                        cancelName="Anuluj"
                        onPopupAction={e =>{
                                if(e.target.id==='ok')
                                setRetriveAdd(!retriveAdd);
                            }
                        }
                        onPopupActionCloseTrigger={isAddPatientOpen}
                        handleClose={()=>{setIsAddPatientOpen(false)}}
                        handleOpen ={()=>setIsAddPatientOpen(true)}
                    
                    >
                        <PatientAddPopup handleVisibility={(e)=> {setIsAddPatientOpen(e)}} getAdd={getAdd} retriveObject={retriveAdd}/>                          
                    </GenericPopupForm>

                </InputSearchFormChildren>

				<InputSearchFormChildren
                    disabled={true}
					label = "Jednostka zlecająca:"
					name = "orderingUnit.id"
					type = "text"
					error={patientOrder.err.orderingUnit}
                    value={patientOrder.ord.orderingUnit?patientOrder.ord.orderingUnit.name?`${patientOrder.ord.orderingUnit.address.city} > ${patientOrder.ord.orderingUnit.shortName} > ${patientOrder.ord.orderingUnit.name.substring(0,25)}...`:'':''}
					//onChange={handleChange}
				>
                    <GenericPopupForm
                        name={<img  src="/img/search.svg"/>} 
                        okId="ok"
                        cancelId="return"
                        okName="Dodaj"
                        cancelName="Anuluj"
                        onPopupAction={e =>{
                                if(e.target.id==='ok')
                                setRetriveAdd(!retriveAdd);
                            }
                        }
                        onPopupActionCloseTrigger={isSelectOrderingUnitOpen}
                        handleClose={()=>setIsSelectOrderingUnitOpen(false)}
                        handleOpen ={()=>setIsSelectOrderingUnitOpen(true)}
                    >
                        <OrderingUnitSearchPopup handleVisibility={(e)=> {setIsSelectOrderingUnitOpen(e)}} getAdd={getAdd} retriveObject={retriveAdd}/>
                    </GenericPopupForm>



                </InputSearchFormChildren>

				<Select
                    disabled={phisicians==null}
					label = "Lekarz:"
					name = "phisician.id"
					type = "text"
					error={patientOrder.err.phisician.id}
					value={patientOrder.ord.phisician?patientOrder.ord.phisician.id:''}
                    onChange={handleChange}
				>
                    <option selected label={''} value={null}/>
                    {phisicians?phisicians.map((obj)=> 
                        <Option label={`${obj.surname} ${obj.name} ${obj.personalIdentificationNumber}`} value={obj.id}/>
                    ):''}   
                </Select>

                <InputSearchForm
					label = "Data zlecenia:"
					name = "orderDate"
					type = "date"
					min="1900-01-01"
					max= {new Date().toJSON().split('T')[0]}
					error={patientOrder.err.orderDate}
                    value={patientOrder.ord.orderDate?patientOrder.ord.orderDate:''}
					onChange={handleChange}
				/>
					</fieldset>
				</form>
                <form className="form" onSubmit={handleClick}>
				<div className="form-buttons">
                    <input type="submit" className="form-button-submit" value="Dodaj"/>
                </div>
                </form>
                </>    

}
