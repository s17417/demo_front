import _ from "lodash"
import { useEffect, useState, useContext } from "react";
import { getAllAnalytes } from "../../apiCalls/AnalyteApiCalls";
import { addUpdateMethod } from "../../apiCalls/LaboratoryTestApiCalls";
import { StateContext } from "../../App";
import { DetailsRow } from "../DetailsRow";
import { getFormattedDateTime } from "./DateHelper";
import { countTimeElapsedFormatter } from "./MothsTimeLength";
import { RecordMetaData } from "./RecordMetaData";
import { InputSearchForm, InputSearchFormChildren, InputTextArea, InputTextAreaFormChildren, Option, Select } from "./SerchBarComponents"

const RefferentialRange={
        valueFrom:null,
        valueTo:null,
        fromAge:0,
        toAge:3124224000000,
        gender:null
}

const QuantitativeMethodData={
   met:{
        type:'quantitative',
        id:null,
        analyticalMethodType:null,
        printable:null,
        analyte:{
            id:null
        },
        units:null,	
        limitOfDetection:null,
        limitOfQuantification:null,
        sensitivity: null,
        decimalFormat:null,
        roundingMode: null,
        refferentialRanges:[]
        
   },
   err:{
        analyticalMethodType:'',
        analyte:{
            id:''
        },
        printable:'',
        units:'',	
        limitOfDetection:'',
        limitOfQuantification:'',
        sensitivity: '',
        decimalFormat:'',
        roundingMode:'',
        refferentialRanges:''
   }
}

const QualitativeMethodData={
    met:{
        type:'qualitative',
         id:null,
         analyticalMethodType:null,
         printable:null,
         analyte:{
             id:null
         },
         resultTemplates:[]
    },
    err:{
        printable:'',
         analyticalMethodType:'',
         analyte:{
             id:''
         },
         resultTemplates:''
    }
}

export function QuantitativeMethodDetails(props){
    const method = props.method;
    
    return<>
            <h2>Szczegóły Metody</h2>
        <div className="details-main-box">
            <RecordMetaData
                creationTimeLabel="Utworzono:"
                updateTimeLabel="Zmodyfikowano:"
                createdByLabel="Utworzył:"
                updatedByLabel="Zmodyfikował:"
                creationTime={getFormattedDateTime(method.cretionTimeStamp)}
                updateTime={getFormattedDateTime(method.updateTimeStamp)}
                createdBy={method.createdBy}
                updatedBy={method.lastModifiedBy}
            />

            <div className="details-content-box">
                <DetailsRow key={1} label="Metoda analityczna:" value={method.analyticalMethodType}/>
                <DetailsRow key={2} label="Analit:" value={`${method.analyte.shortName} > ${method.analyte.name}`}/>
                {method.type==='quantitative'?<>  
                    <DetailsRow key={3} label="Jednostki:" value={method.units}/>
                    <DetailsRow key={4} label="LOD"value={method.limitOfDetection?`${method.limitOfDetection} ${method.units}`:''}/>
                    <DetailsRow key={5} label="LOQ"value={method.limitOfQuantification?`${method.limitOfQuantification} ${method.units}`:''}/>
                    <DetailsRow key={6} label="Czułość"value={method.sensitivity?`${method.sensitivity} ${method.units}`:''}/>
                    <DetailsRow key={7} label="Format danych"value={method.decimalFormat}/>
                    <DetailsRow key={8} label="Metoda zaokrąglania"value={method.roundingMode}/>
                </>:''}
            </div>
        </div>
        {method.type==='qualitative'?<>  
        <div style={{width:'auto', margin:'0 1rem 0 1rem'}}>
            <h2>wzorce wyniku:</h2>
            {method.resultTemplates.map(obj => <li>{obj}</li>)}
        </div>
        </>:''}
    </>
}

export function QuantitativeMethodFormFields(props){
    const context= useContext(StateContext);
    const [isLoaded, setIsLoaded]=useState(false);
    const [connectionError, setConnectionError] = useState('');
    const [method,setMethod] = useState(_.cloneDeep(QuantitativeMethodData));
    const ltdId = props.ltdId
    const getObjectCallback = props.getObjectCallback;
    const [analytes,setAnalytes]=useState([])
    const [ageToStartIndex, setAgeToStartIndex]= useState(0);
    const [refferentialRange,setRefferentialRange]= useState({...RefferentialRange});
    const [selectedRefferentialRange, setSelectedRefferentialRange]=useState([])

    const onChange=(e)=>{
        console.log(method);
        const {name, value } = e.target;
        const met = _.cloneDeep(method);
        _.set(met.met, name, value==''?null:value);
        _.set(met.err, name,'');
        setMethod(met);
        e.preventDefault();
    }

    const onReferrentialRangeChange=(e)=>{
        const {name, value } = e.target;
        const met = _.cloneDeep(method);
        const ref = _.cloneDeep(refferentialRange);
        _.set(ref, name, value==''?null:value);    
        _.set(met.err, 'refferentialRange','');
        setMethod(met);
        setRefferentialRange(ref);
        e.preventDefault();
    }

    const addObject = () =>{
        addUpdateMethod(context.userToken, ltdId, method.met).then((res) =>{
            switch (res.status){
				case (201):{
                    getObjectCallback(res.data);
				    setMethod(_.cloneDeep(QuantitativeMethodData));
				    setConnectionError('');
				};
				break;
				case (422): {
                    const met =  _.cloneDeep(method);
					Object.keys(res.data.message).map(key => {
                        console.log(res.data)
                            if (key!='1062') {
                                if (key==='analyte')_.set(met.err, 'analyte.id', res.data.message[key]);
                                else _.set(met.err, key, res.data.message[key]);
                                if (key.includes('refferentialRanges')) _.set(met.err, 'refferentialRanges', res.data.message[key])               
                            }
                            
                            else {
                                console.log(JSON.stringify(res.data.message));
                                const reg= /(Method)([.])([aA-zZ]+)/gm;
                                const k=res.data.message[key].match(reg)[0].split('.')[1]; 
                                _.set(met.err, k, res.data.message[key]);
                            }    
						})
                    setMethod(met);
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
					console.log(res.data)
				}
			}
        })
    }

    useEffect(()=>{
        if (isLoaded!=false){
            addObject();
        }
    setIsLoaded(true);
    },[props.retriveObject])

    useEffect(()=>{
        setAnalytes(props.analytes)
        //fetchAnalytes();
    },[props.analytes])

    return <>
    <InputSearchForm
        label = 'Metoda Analityczna:'
        name = 'analyticalMethodType'  
        type = 'text'
        autocomplete = 'false'
        error = {method.err.analyticalMethodType}
        value ={method.met.analyticalMethodType?method.met.analyticalMethodType:''}
        onChange={onChange}
    />

    <InputSearchForm
        label = 'Jednostki:'
        name = 'units'  
        type = 'text'
        autocomplete = 'false'
        error = {method.err.units}
        value ={method.met.units?method.met.units:''}
        onChange={onChange}
    />

    <InputSearchForm
        label = 'LOD:'
        name = 'limitOfDetection'  
        type = 'number'
        autocomplete = 'false'
        error = {method.err.limitOfDetection}
        value ={method.met.limitOfDetection?method.met.limitOfDetection:''}
        onChange={onChange}
    />

    
    <InputSearchForm
        label = 'LOQ:'
        name = 'limitOfQuantification'  
        type = 'number'
        autocomplete = 'false'
        error = {method.err.limitOfQuantification}
        value ={method.met.limitOfQuantification?method.met.limitOfQuantification:''}
        onChange={onChange}
    />


    <InputSearchForm
        label = 'Czułość:'
        name = 'sensitivity'  
        type = 'number'
        autocomplete = 'false'
        error = {method.err.sensitivity}
        value ={method.met.sensitivity?method.met.sensitivity:''}
        onChange={onChange}
    />

    <Select
        label = 'Format:'
        name = 'decimalFormat'  
        type = 'text'
        error = {method.err.decimalFormat}
        value ={method.met.decimalFormat?method.met.decimalFormat:''}
        onChange={onChange}
    >
        <option selected disabled label='Wybierz...' value={null}/>
        <Option label="0" value={'#'}/>
        <Option label="0.0" value={'#.#'}/>
        <Option label="0.00" value={'#.##'}/>
        <Option label="0.000" value={'#.###'}/>
    </Select>

    <Select
        label = 'Zaokrąglanie:'
        name = 'roundingMode'  
        type = 'text'
        error = {method.err.roundingMode}
        value ={method.met.roundingMode?method.met.roundingMode:''}
        onChange={onChange}
    >
        <option selected disabled label='Wybierz...' value={null}/>
        <Option label="UP" value={'UP'}/>
        <Option label="DOWN" value={'DOWN'}/>
        <Option label="CEILING" value={'CEILING'}/>
        <Option label="FLOOR" value={'FLOOR'}/>
        <Option label="HALF_UP" value={'HALF_UP'}/>
        <Option label="HALF_DOWN" value={'HALF_DOWN'}/>
        <Option label="HALF_EVEN" value={'HALF_EVEN'}/>
    </Select>

    <Select
        label = 'Wydruk:'
        name = 'printable'  
        type = 'text'
        error = {method.err.printable}
        value ={method.met.printable?method.met.printable:''}
        onChange={onChange}
    >
        <option selected disabled label='Wybierz...' value={null}/>
        <Option selected={true} label="TAK" value={true}/>
        <Option label="NIE" value={false}/>
    </Select>

    <Select
        label = 'Analit:'
        name = 'analyte.id'  
        type = 'text'
        size={4}
        error = {method.err.analyte.id}
        value ={method.met.analyte.id}
        onChange={onChange}
    >
        <option selected disabled label='Wybierz...' value={null}/>
                {analytes.map(obj => <Option label={obj.name} value={obj.id}/>)}
            
    </Select>

<h2>Wartosci referencyjne</h2>
    <Select
        label = 'Wartości referencyjne:'
        name = 'resultTemplates'
        type = "text"
        size = {5}
        error={method.err.refferentialRanges}

        onChange={(e)=> setSelectedRefferentialRange(e.target.value)}
    >
        {method.met.refferentialRanges.map((obj,index) => {
           // console.log(obj.fromAge);
        return <option label={
            `${countTimeElapsedFormatter(obj.fromAge)}-
            ${countTimeElapsedFormatter(obj.toAge)} > 
            ${obj.valueFrom?obj.valueFrom:' '}-${obj.valueTo?obj.valueTo:' '} > 
            ${obj.gender?obj.gender:' '}
            `} value={index}/>
})}
    </Select>

    <div>
    <button className="popup-button-add" style={{minWidth:'29px', maxWidth:'29px', height:'29px'}} 
        onClick={()=> {
                const met = _.cloneDeep(method);
                met.met.refferentialRanges.push(refferentialRange);
                setRefferentialRange({...RefferentialRange});
                setMethod(met);
            }} >+</button>

    <button className="popup-button-add" style={{minWidth:'29px', maxWidth:'29px', height:'29px'}} 
        onClick={()=> {
                const met = _.cloneDeep(method);
                console.log(met);
                met.met.refferentialRanges=met.met.refferentialRanges.filter((value,index) => index!=selectedRefferentialRange)
                setMethod(met);
            }}>-</button>
    
    <div style={{width:'100%', display:'grid'}}>
    <Select
        label="wiek od:"
        name='fromAge'
        error={''}
        value = {refferentialRange.fromAge?refferentialRange.fromAge:''}
        onChange={(e)=> {setAgeToStartIndex(e.target.value); onReferrentialRangeChange(e)} }
    >
        
        {[...Array(122)].map
            ((value, index)=> { 
                return index<24?{key:index, label:'m.', value:Date.UTC(1970,index)} : {key:index-22, label:'l.', value:Date.UTC(1970+index-22)}})
            
                .map((value)=> 
                <option label={`${value.key} ${value.label}`} value={value.value} id={value.key}/>
            )
        }
       
    </Select>

    <Select
        label="wiek do:"
        name='toAge'
        error={''}
        value = {refferentialRange.toAge?refferentialRange.toAge:''}
        onChange={onReferrentialRangeChange}
    >
        
        {[...Array(122)].map
            ((value, index)=> { 
                return index<24?{key:index, label:'m.', value:Date.UTC(1970,index)} : {key:index-22, label:'l.', value:Date.UTC(1970+index-22)}})
            
                .map((value)=> {/*value.value>ageToStartIndex?*/
                return <option disabled={value.value<=ageToStartIndex} label={`${value.key} ${value.label}`} value={value.value}/>/*:''*/}
            )
        }
    </Select>

   
    </div>
    <div style={{width:'100%', display:'grid'}}>
    <InputSearchForm
        type="number"
        label="wartość od:"
        name="valueFrom"
        error={''}
        value = {refferentialRange.valueFrom?refferentialRange.valueFrom:''}
        onChange={onReferrentialRangeChange}
    />

    <InputSearchForm
        type="number"
        label="wartość do:"
        name="valueTo"
        error={''}
        value = {refferentialRange.valueTo?refferentialRange.valueTo:''}
        onChange={onReferrentialRangeChange}
    />

    <Select
        label='Płeć'
        name="gender"
        id="gender"
        value={refferentialRange.gender?refferentialRange.gender:''}
        error={''}
        className=""
        onChange={onReferrentialRangeChange}
    >
        <option key={''} value='' label="" />
        <option key="N" value="UNDEFINED" label="N" />
        <option key="F" value="FEMALE" label="K" />
        <option key="M" value="MALE" label="M" />
    </Select>

    </div>
    </div>
    
    {connectionError!=''?
    <h4 className='errors-text'>
		{`Couldn't retrieve data. ${connectionError}`}
	</h4>:''}
    </>
}


export function QualitativeMethodFormFields(props){
    const context= useContext(StateContext);
    const [isLoaded, setIsLoaded]=useState(false);
    const [connectionError, setConnectionError] = useState('');
    const [method,setMethod] = useState(_.cloneDeep(QualitativeMethodData));
    const ltdId = props.ltdId
    const getObjectCallback = props.getObjectCallback;
    const [analytes,setAnalytes]=useState([]);
    const [resultTemplate,setResultTemmplate]=useState('');

    const onChange=(e)=>{
        const {name, value } = e.target
        const met = _.cloneDeep(method);
        _.set(met.met, name, value==''?null:value);
        _.set(met.err, name,'');
        setMethod(met);
        e.preventDefault();
    }

    /*const fetchAnalytes = () =>{
        getAllAnalytes(context.userToken).then((res) => {
            switch (res.status){
                case (200):{
                   setAnalytes(res.data);
                };
                break;
                default: {
                    console.log(res)
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }*/

    const addObject = () =>{
        addUpdateMethod(context.userToken, ltdId, method.met).then((res) =>{
            switch (res.status){
				case (201):{
                    getObjectCallback(res.data);
				    setMethod(_.cloneDeep(QuantitativeMethodData));
				    setConnectionError('');
				};
				break;
				case (422): {
                    const met =  _.cloneDeep(method);
					Object.keys(res.data.message).map(key => {
                        console.log(res.data)
                            if (key!='1062') {
                                if (key=='analyte')_.set(met.err, 'analyte.id', res.data.message[key]);
                                else _.set(met.err, key, res.data.message[key]);               
                            }
                            
                            else {
                                console.log(JSON.stringify(res.data.message));
                                const reg= /(Method)([.])([aA-zZ]+)/gm;
                                const k=res.data.message[key].match(reg)[0].split('.')[1]; 
                                _.set(met.err, k, res.data.message[key]);
                            }    
						})
                    setMethod(met);
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
					console.log(res.data)
				}
			}
        })
    }

    useEffect(()=>{
        if (isLoaded!=false){
            addObject();
        }
    setIsLoaded(true);
    },[props.retriveObject])

    useEffect(()=>{
        setAnalytes(props.analytes)
        //fetchAnalytes();
    },[props.analytes])

    return <>
    <InputSearchForm
        label = 'Metoda Analityczna:'
        name = 'analyticalMethodType'  
        type = 'text'
        autocomplete = 'false'
        error = {method.err.analyticalMethodType}
        value ={method.met.analyticalMethodType?method.met.analyticalMethodType:''}
        onChange={onChange}
    />

    <InputTextAreaFormChildren
        label = 'Wzorce wyniku:'
        name = 'resultTemplates'
        type = "text"
        rows ={2}
        error={''}
        onChange={(e)=> setResultTemmplate(e.target.value)}
    >
        <button className="popup-button-add" style={{minWidth:'29px', maxWidth:'29px', height:'29px', margin:'auto'}} onClick={()=> {
            if (resultTemplate==='') return;
                const met=_.cloneDeep(method);
                met.met.resultTemplates.push(resultTemplate);
                setMethod(met);
                setResultTemmplate('');
            }} >+</button>
    </InputTextAreaFormChildren>
    <div style={{whiteSpace:'break-spaces', height:'200px', overflowY:"auto", minWidth:'100%',gridColumn:'1/4', maxWidth:'100%', margin:'auto', padding:'0rem'}}>
        {method.met.resultTemplates?method.met.resultTemplates
            .map((obj) =><>
                <div style={{display:"grid",gridTemplateColumns:"1fr 29px", alignContent:"space-between",marginTop:'0.2rem'}}>
                    <li style={{whiteSpace:'break-spaces',gridColumn:'1/2' ,marginLeft:'0.5rem'}}>{obj}</li>
                    <button onClick={()=> {const met=_.cloneDeep(method);met.met.resultTemplates=met.met.resultTemplates.filter(rt=> rt!==obj);setMethod(met)}} className="popup-button-add" style={{gridColumn:'2/3', minWidth:'29px', maxWidth:'29px', height:'29px', margin:'auto', marginRight:'1rem'}}>-</button>
                </div>
                <h2 style={{marginTop:'0.1rem', marginBottom:'0rem'}}></h2></>
            ):''
        }
    </div>
    <Select
        label = 'Wydruk:'
        name = 'printable'  
        type = 'text'
        error = {method.err.printable}
        value ={method.met.printable?method.met.printable:''}
        onChange={onChange}
    >
        <option selected disabled label='Wybierz...' value={null}/>
        <Option selected={true} label="TAK" value={true}/>
        <Option label="NIE" value={false}/>
    </Select>

    <Select
        label = 'Analit:'
        name = 'analyte.id'  
        type = 'text'
        size={4}
        error = {method.err.analyte.id}
        value ={method.met.analyte.id}
        onChange={onChange}
    >
        <option selected disabled label='Wybierz...' value={null}/>
                {analytes.map(obj => <Option label={obj.name} value={obj.id}/>)}
            
    </Select>
    
    {connectionError!=''?
    <h4 className='errors-text'>
		{`Couldn't retrieve data. ${connectionError}`}
	</h4>:''}
    </>
}