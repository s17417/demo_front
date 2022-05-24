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

export const orderResultData = {
    ord:{
        id:null,
        tatMode:null,
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


export function OrderResultAddPopup(props){
    const currentFormMode = props.orderResult ? formMode.EDIT : formMode.NEW;
    const [isLoaded, setIsLoaded]=useState(false);
    const context= useContext(StateContext);
    const [connectionError, setConnectionError] = useState('');
    const [orderResult, setOrderResult] = useState(_.cloneDeep(orderResultData));
    const [patientSample, setPatientSample] = useState (_.cloneDeep(sampleData));
    

    const [patientSamples, setPatientSamples]=useState([]);
    const [specimentTypes, setSpecimentTypes] = useState([]);
    const [laboratoryTests, setLaboratoryTests] = useState([]);
    const [fieldsDisabled,setFieldsDisabled] = useState(true);
    const parent = useRef(null);
    const collectionDateRef = useRef(null);
    const specimentTypeRef = useRef(null);
    const [post,setPost]= useState(true);

    const handleSampleChange = (event) =>{
        const {name, value } = event.target;
        const spl=_.cloneDeep(patientSample);
        if (name==='sampleId'){
            spl.err=_.cloneDeep(sampleData.err);
            const spla=patientSamples.find((obj)=> obj.sampleId===value);
            if(!spla){
                setFieldsDisabled(false);
                setPatientSample(_.cloneDeep(sampleData));
            } 
            else{
                setFieldsDisabled(true);
                spl.spl=spla;
                setPatientSample(spl);
            }
        event.preventDefault();
        }
        _.set(spl.spl, name, value==''?null:value);
        _.set(spl.err, name,'');
        setPatientSample(spl);
        event.preventDefault();
    }

    const handleChange=(event) =>{
        const {name, value } = event.target
        const ord = _.cloneDeep(orderResult);
        _.set(ord.ord, name, value==''?null:value);
        _.set(ord.err, name,'');
        setOrderResult(ord);
        event.preventDefault();
    }

    const createOrderResults = (patientSampleId) => {
		addUpdateOrderResult(context.userToken, props.patientOrderId, patientSampleId?patientSampleId:patientSample.spl.id, orderResult.ord/*handleInput().ord*/)
		.then(res => {
			switch (res.status){
                case (200):{
                    props.returnObject(res.data);
                    props.handleVisibility(false);
                };
                break;
				case (201):{
                    props.handleVisibility(true);
				    setOrderResult(_.cloneDeep(orderResultData));
                    setPatientSample(_.cloneDeep(sampleData));
                    props.returnObject(res.data);
				    setConnectionError("");
				};
				break;
				case (422): {
                    console.log(res.data);
                    const ord =  _.cloneDeep(orderResult);
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
                    setOrderResult(ord);
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
					console.log(res.data)
				}
			}
		});
	}

    const addPatientSample = async () => {
        addPatientOrderSample(context.userToken, props.patientOrderId, patientSample.spl)
        .then(res => {
			switch (res.status){
				case (201):{
                    setPatientSamples(...patientSamples,res.data);
				    setConnectionError("");
                    props.returnSample(res.data);
                    createOrderResults(res.data.id);
				};
				break;
				case (422): {
                    console.log(res.data);
                    const spl =  _.cloneDeep(patientSample);
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
                    setPatientSample(spl);
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
					console.log(res.data)
				}
			}
		})
    }

    const fetchOrderResult = async () => {
        return await getOrderResult(context.userToken, props.patientOrderId, props.orderResult.sample.id, props.orderResult.id)
        .then((res) => {
            switch (res.status){
                case (200):{
                    console.log(res.data)
                    const ord = _.cloneDeep(orderResultData);
                    const spl = _.cloneDeep(sampleData);
                    ord.ord=res.data;
                    spl.spl=res.data.sample;
                    setOrderResult(ord);
                    setPatientSample(spl);
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
            if (patientSample.spl.id)
                createOrderResults();
            else addPatientSample();
        }
        else setIsLoaded(true);
    },[props.retriveObject, post]);


    useEffect(() =>{
        setPatientSamples(props.patientSamples)
    },[props.patientSamples])

    useEffect(() => {
        if (currentFormMode==formMode.EDIT) 
            fetchOrderResult();
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
                error={patientSample.err.sampleId}
                value={patientSample.spl.sampleId?patientSample.spl.sampleId:''}
                onChange={handleSampleChange}
            >
                {patientSamples.length>0?
                <Datalist id="patientSamples">
                {patientSamples.map(obj => <Option value={obj.sampleId} label={`TYP: ${obj.specimentType.speciment}, pobrano: ${obj.collectionDate?getFormattedDateTime(obj.collectionDate):'N/A'}`}/>)}
                </Datalist>:''
                }
            </InputSearchForm>

            <Select
                disabled = {fieldsDisabled}
                label = "Rodzaj materiału:"
                name = "specimentType.id"
                ref={specimentTypeRef}
                error={patientSample.err.specimentType.id}
                value={patientSample.spl.specimentType.id?patientSample.spl.specimentType.id:''}
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
                error={patientSample.err.collectionDate}
                ref={collectionDateRef}
                value={patientSample.spl.collectionDate?patientSample.spl.collectionDate:''}
                onChange={handleSampleChange}
                />
            
            <Select
                label = "Tryb badania:"
                name = "tatMode"
                error={orderResult.err.tatMode}
                value={orderResult.ord.tatMode?orderResult.ord.tatMode:''}
                onChange={handleChange}
            >
                <option hidden selected disabled label='Wybierz...' value={null}/>
                <Option label="ZWYKŁY" value="RUTINE"/>
                <Option label="CITO" value="CITO"/>
            </Select>
            <Select
                disabled={currentFormMode===formMode.EDIT}
                label = "Analizy:"
                name = "laboratoryTest.id"
                size={6}
                multiply={true}
                error={orderResult.err.laboratoryTest.id}
                value={orderResult.ord.laboratoryTest.id?orderResult.ord.laboratoryTest.id:''}
                onChange={handleChange}
            >
                <option hidden selected disabled label='Wybierz...' value={null}/>
                {laboratoryTests.filter(obj => obj.specimentType.id===patientSample.spl.specimentType.id).map(obj => <Option label={obj.name} value={obj.id}/>)}
            </Select>

        </fieldset>
    </form>
        {connectionError!=''?<h4 className='errors-text'>
		{`Couldn't retrieve data. ${connectionError}`}
	</h4>:''}
   
    </div>   
}

