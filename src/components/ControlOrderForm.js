import { useContext, useState, useEffect } from "react";
import { DoingWork } from "./others/DoingWork";
import { StateContext } from "../App";
import { InputSearchForm, InputSearchFormChildren, InputTextArea } from "./others/SerchBarComponents";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import formMode from "./others/FormMode";
import { addUpdatePatientOrder, getPatientOrder } from "../apiCalls/PatientOrderCalls";
import GenericPopupForm from "./popups/AddComment";
import { PatientAddPopup, PatientSearchPopup } from "./popups/PatientPopups";
import { patientData } from "./others/PatientForm";
import { addUpdateControlOrder, getControlOrder } from "../apiCalls/ControlOrderApiCalls";

const orderData = {
    ord: {
        id:null,
        orderIdentificationCode:null,
        name:null,
        externalIdentificationCode:null,
        expirationDate:null,
        reportingDeadLine:null,
        description:null,
    },
    err: {
        orderIdentificationCode:'',
        name:'',
        externalIdentificationCode:'',
        expirationDate:'',
        reportingDeadLine:'',
        description:'',
    }
}

export default function ControlOrderForm(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(true);
    const [post,setPost] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { ordId } = useParams();
    const navigate = useNavigate();
    const currentFormMode = ordId ? formMode.EDIT : formMode.NEW;
	const [controlOrder, setControlOrder] = useState(_.cloneDeep(orderData));

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
        const contOrd = _.cloneDeep(controlOrder);
        _.set(contOrd.ord, name, value==''?null:value);
        _.set(contOrd.err, name,'');
        setControlOrder(contOrd);
        console.log(contOrd);
    }

    const createUpdateControlOrder = () => {
        console.log(controlOrder)
        if (post==false) return;
		addUpdateControlOrder(context.userToken, controlOrder.ord)
		.then(res => {
			switch (res.status){
                case (200):{
                    navigate(`/lab/tenant/controlOrders/details/${ordId}`);
                };
                break;
				case (201):{
				    setControlOrder(_.cloneDeep(orderData));
				    setConnectionError("");
				};
				break;
				case (422): {
                    console.log(res.data)
                    const ord =  _.cloneDeep(controlOrder);
					Object.keys(res.data.message)
						.map(key => {
                            
                            if (key!='1062')
                                _.set(ord.err, key, res.data.message[key]);
                            else {
                                console.log(JSON.stringify(res.data.message));
                                const reg= /(AbstractOrder)([.])([aA-zZ]+)/gm;
                                const k=res.data.message[key].match(reg)[0].split('.')[1]; 
                                _.set(ord.err, k, res.data.message[key]);
                            }
                            
                            
						})
                    setControlOrder(ord);
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

    const fetchControlOrder = async () => {     
        return await getControlOrder(context.userToken, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    const ord =res.data;	
				    const p = _.cloneDeep(controlOrder);
                    p.ord=ord;
                    setControlOrder(p);
                    setIsLoaded(true);      
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    useEffect(()=>{
        if (currentFormMode === formMode.EDIT) {fetchControlOrder()
        }
    },[]);

    useEffect(()=>{if (post==true) createUpdateControlOrder()},[post])

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
                    currentFormMode={currentFormMode}
                    controlOrder={controlOrder}
                    handleClick={handleClick} 
                    handleChange={handleChange}
                   
                />
            </>
            }
        </div>
    </main>
    )

}

export function Form ({currentFormMode, controlOrder, handleClick, handleChange}){

    return <><form className="form" onKeyDown={(e)=>{if(e.code==="Enter")e.preventDefault()}} onSubmit={(e)=> e.preventDefault()}>
				<fieldset className="searchFieldset">
					
				<InputSearchForm
                    disabled = {currentFormMode==formMode.EDIT}
					label = "Nr zlecenia:"
					name = "orderIdentificationCode"
					type = "text"
					error={controlOrder.err.orderIdentificationCode}
                    value={controlOrder.ord.orderIdentificationCode?controlOrder.ord.orderIdentificationCode:''}
					onChange={handleChange}
				/>	

				<InputSearchForm
					label = "nazwa:"
					name = "name"
					type = "text"
					error={controlOrder.err.name}
                    value={controlOrder.ord.name?controlOrder.ord.name:''}
					onChange={handleChange}
				/>

				<InputSearchForm
					label = "ID zewnętrzne:"
					name = "externalIdentificationCode"
					type = "text"
					error={controlOrder.err.externalIdentificationCode}
					value={controlOrder.ord.externalIdentificationCode?controlOrder.ord.externalIdentificationCode:''}
                    onChange={handleChange}
				/>

                <InputSearchForm
					label = "Data ważności:"
					name = "expirationDate"
					type = "datetime-local"
					min= {new Date().toJSON()}
					error={controlOrder.err.expirationDate}
                    value={controlOrder.ord.expirationDate?controlOrder.ord.expirationDate:''}
					onChange={handleChange}
				/>

                <InputSearchForm
					label = "termin raportowania:"
					name = "reportingDeadLine"
					type = "datetime-local"
					min= {new Date().toJSON()}
					error={controlOrder.err.reportingDeadLine}
                    value={controlOrder.ord.reportingDeadLine?controlOrder.ord.reportingDeadLine:''}
					onChange={handleChange}
				/>

                <InputTextArea
                    label = "opis:"
					name = "description"
                    rows = {5}
					error={controlOrder.err.description}
                    value={controlOrder.ord.description?controlOrder.ord.description:''}
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
