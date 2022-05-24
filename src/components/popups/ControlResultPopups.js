import { Datalist, DatalistOption, InputSearchForm, Select } from "../others/SerchBarComponents"
import Collapsible from "../fragments/Collapsible"
import { useState, useContext, useEffect, useRef } from "react"
import { StateContext } from "../../App"
import { getPatients, addUpdatePatients } from "../../apiCalls/PatientApiCalls"
import { Option } from "../others/SerchBarComponents"
import _, { keys } from "lodash"
import { getSpecimentTypes } from "../../apiCalls/SpecimentTypeApiCalls"
import { getAllLaboratoryTests, getLaboratoryTests } from "../../apiCalls/LaboratoryTestApiCalls"
import { addPatientOrderSample, addUpdateOrderResult, getOrderResult } from "../../apiCalls/PatientOrderCalls"
import { useParams } from "react-router-dom"
import formMode from "../others/FormMode"
import { getFormattedDateTime } from "../others/DateHelper"
import { addControlOrderSample, addUpdateControlResult, getControlResult, getControlResults } from "../../apiCalls/ControlOrderApiCalls"

export const sampleData = {
    spl:{
        id:null,
        sampleId:null,
        collectionDate:null,
        specimentType:{
            id:null
        }
    },
    err:{
        sampleId:'',
        collectionDate:'',
        specimentType:{
            id:''
        }
    }
}

export const controlResultData = {
    ord:{
        id:null,
        tatMode:'RUTINE',
        laboratoryTest:{
            id:null
        }
    },
    err:{
        tatMode:'',
        laboratoryTest:{
            id:''
        }
    }
}


export function ControlResultAddPopup(props){
    const currentFormMode = props.orderResult ? formMode.EDIT : formMode.NEW;
    const [isLoaded, setIsLoaded]=useState(false);
    const context= useContext(StateContext);
    const [connectionError, setConnectionError] = useState('');
    const [controlResult, setControlResult] = useState(_.cloneDeep(controlResultData));
    const [controlSample, setControlSample] = useState (_.cloneDeep(sampleData));
    

    const [controlSamples, setControlSamples]=useState([]);
    const [specimentTypes, setSpecimentTypes] = useState([]);
    const [laboratoryTests, setLaboratoryTests] = useState([]);
    const [fieldsDisabled,setFieldsDisabled] = useState(true);
    const parent = useRef(null);
    const collectionDateRef = useRef(null);
    const specimentTypeRef = useRef(null);
    const [post,setPost]= useState(true);

    const handleSampleChange = (event) =>{
        const {name, value } = event.target;
        const spl=_.cloneDeep(controlSample);
        if (name==='sampleId'){
            spl.err=_.cloneDeep(sampleData.err);
            const spla=controlSamples.find((obj)=> obj.sampleId===value);
            if(!spla){
                setFieldsDisabled(false);
                setControlSample(_.cloneDeep(sampleData));
            } 
            else{
                setFieldsDisabled(true);
                spl.spl=spla;
                setControlSample(spl);
            }
        event.preventDefault();
        }
        _.set(spl.spl, name, value==''?null:value);
        _.set(spl.err, name,'');
        setControlSample(spl);
        event.preventDefault();
    }

    const handleChange=(event) =>{
        const {name, value } = event.target
        const ord = _.cloneDeep(controlResult);
        _.set(ord.ord, name, value==''?null:value);
        _.set(ord.err, name,'');
        setControlResult(ord);
        event.preventDefault();
    }

    const createControlResults = (controlSampleId) => {
		addUpdateControlResult(context.userToken, props.controlOrderId, controlSampleId?controlSampleId:controlSample.spl.id, controlResult.ord)
		.then(res => {
			switch (res.status){
                case (200):{
                    props.returnObject(res.data);
                    props.handleVisibility(false);
                };
                break;
				case (201):{
                    props.handleVisibility(true);
				    setControlResult(_.cloneDeep(controlResultData));
                    setControlSample(_.cloneDeep(sampleData));
                    props.returnObject(res.data);
				    setConnectionError("");
				};
				break;
				case (422): {
                    console.log(res.data);
                    const ord =  _.cloneDeep(controlResult);
					Object.keys(res.data.message)
						.map(key => {
                            if (key!='1062'){
                                if(!_.has(ord.err,key))
                                    setConnectionError(res.data.message[key]) 
                                else 
                                _.set(ord.err, key, res.data.message[key]);                       
                            }
                            else {
                                console.log(JSON.stringify(res.data.message));
                                const reg= /(Patient)([.])([aA-zZ]+)/gm;
                                const k=res.data.message[key].match(reg)[0].split('.')[1]; 
                                _.set(ord.err, k, res.data.message[key]);
                            }
                            
                            
						})
                    setControlResult(ord);
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
					console.log(res.data)
				}
			}
		});
	}

    const addControlSample = async () => {
        addControlOrderSample(context.userToken, props.controlOrderId, controlSample.spl)
        .then(res => {
			switch (res.status){
				case (201):{
                    setControlSamples(...controlSamples,res.data);
				    setConnectionError("");
                    props.returnSample(res.data);
                    createControlResults(res.data.id);
				};
				break;
				case (422): {
                    console.log(res.data);
                    const spl =  _.cloneDeep(controlSample);
					Object.keys(res.data.message)
						.map(key => {
                            if (key!='1062'){
                                if(!_.has(spl.err,key))
                                    setConnectionError(res.data.message[key]) 
                                else 
                                _.set(spl.err, key, res.data.message[key]);                       
                            }
                            else {
                                if(!_.has(spl.err,key))
                                    setConnectionError(res.data.message[key]) 
                                else 
                                console.log(JSON.stringify(res.data.message));
                                const reg= /(PatientSample)([.])([aA-zZ]+)/gm;
                                const k=res.data.message[key].match(reg)[0].split('.')[1]; 
                                _.set(spl.err, k, res.data.message[key]);
                            }
						})
                    setControlSample(spl);
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
					console.log(res.data)
				}
			}
		})
    }

    const fetchControlResult = async () => {
        return await getControlResult(context.userToken, props.controlOrderId, props.orderResult.sample.id, props.orderResult.id)
        .then((res) => {
            switch (res.status){
                case (200):{
                    console.log(res.data)
                    const ord = _.cloneDeep(controlResultData);
                    const spl = _.cloneDeep(sampleData);
                    ord.ord=res.data;
                    spl.spl=res.data.sample;
                    setControlResult(ord);
                    setControlSample(spl);
                    setConnectionError("");
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);
                }
            };
        })
    }

    const fetchSpeciments = async () => {
        return await getSpecimentTypes(context.userToken)
        .then((res) => {
            switch (res.status){
                case (200):{
                    setSpecimentTypes(res.data);
                    setConnectionError("");
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
                    setSpecimentTypes([]);
					console.log(res.data);
                }
            }
        })
    }

    const fetchLaboratoryTests = async ()=> {
        return await getAllLaboratoryTests(context.userToken)
        .then((res) => {
            switch (res.status){
                case (200):{
                    console.log(res.data)
                    setLaboratoryTests(res.data);
                    setConnectionError("");
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
                    setLaboratoryTests([]);
					console.log(res.data);
                }
            }
        })

    }

    
    useEffect(()=>{
        if (isLoaded==true){
            if (controlSample.spl.id)
                createControlResults();
            else addControlSample();
        }
        else setIsLoaded(true);
    },[props.retriveObject, post]);


    useEffect(() =>{
        setControlSamples(props.patientSamples)
    },[props.patientSamples])

    useEffect(() => {
        if (currentFormMode==formMode.EDIT) 
            fetchControlResult();
    },[props.orderResult])

    useEffect(() => {  
        fetchSpeciments();       
        fetchLaboratoryTests();
    },[]);
    return <div>
    <h2>Nowa analiza</h2>
    <form className="popup-form" onKeyDown={(e)=>{if(e.code==="Enter")setPost(!post)}}  onSubmit={e=> {e.preventDefault()}}>
					<fieldset className="popup-searchFieldset" ref={parent}>
				
            <InputSearchForm
                disabled={currentFormMode===formMode.EDIT}
                list="patientSamples"
                label = "Id próbki:"
                name = "sampleId"
                type = "text"
                autocomplete='false'
                error={controlSample.err.sampleId}
                value={controlSample.spl.sampleId?controlSample.spl.sampleId:''}
                onChange={handleSampleChange}
            >
                {controlSamples.length>0?
                <Datalist id="patientSamples">
                {controlSamples.map(obj => <Option value={obj.sampleId} label={`TYP: ${obj.specimentType.speciment}, pobrano: ${obj.collectionDate?getFormattedDateTime(obj.collectionDate):'N/A'}`}/>)}
                </Datalist>:''
                }
            </InputSearchForm>

            <Select
                disabled = {fieldsDisabled}
                label = "Rodzaj materiału:"
                name = "specimentType.id"
                ref={specimentTypeRef}
                error={controlSample.err.specimentType.id}
                value={controlSample.spl.specimentType.id?controlSample.spl.specimentType.id:''}
                onChange={handleSampleChange}
            >
                <option hidden selected disabled label='Wybierz...' value={null}/>
                {specimentTypes.map(obj => <Option label={obj.speciment} value={obj.id}/>)}
            </Select>

            <InputSearchForm
                disabled = {fieldsDisabled}
                label = "Data pobrania:"
                name = "collectionDate"
                type = "datetime-local"
                min="1900-01-01T00:00"
                max= {new Date().toJSON()}
                error={controlSample.err.collectionDate}
                ref={collectionDateRef}
                value={controlSample.spl.collectionDate?controlSample.spl.collectionDate:''}
                onChange={handleSampleChange}
                />
            
            <Select
                disabled={currentFormMode===formMode.EDIT}
                label = "Analizy:"
                name = "laboratoryTest.id"
                size={6}
                multiply={true}
                error={controlResult.err.laboratoryTest.id}
                value={controlResult.ord.laboratoryTest.id?controlResult.ord.laboratoryTest.id:''}
                onChange={handleChange}
            >
                <option hidden selected disabled label='Wybierz...' value={null}/>
                {laboratoryTests.filter(obj => obj.specimentType.id===controlSample.spl.specimentType.id).map(obj => <Option label={obj.name} value={obj.id}/>)}
            </Select>

        </fieldset>
    </form>
        {connectionError!=''?<h4 className='errors-text'>
		{`Couldn't retrieve data. ${connectionError}`}
	</h4>:''}
   
    </div>   
}

