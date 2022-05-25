import { useState, useContext, useEffect } from "react";
import { DoingWork } from "./others/DoingWork";
import { StateContext } from "../App";
import { InputSearchForm, Select } from "./others/SerchBarComponents";
import _, { add, set } from "lodash";
import { addUpdatePhisicians } from "../apiCalls/PhisiciansApiCalls";
import { Link, useNavigate, useParams } from "react-router-dom";
import formMode from "./others/FormMode";
import { getPhisician } from "../apiCalls/PhisiciansApiCalls";
import { acceptPatientOrderStatus, cancelPatientOrderStatus, getAnalyteResults, getAnalyteResultsWithOrder, getOrderResult, rejectPatientOrderStatus, updateAnalyteResultsWithOrder } from "../apiCalls/PatientOrderCalls";
import { QualitativeInput, QuantitativeInput } from "./others/ResultInput";
import { DetailsRow, DetailsRowRefferential } from "./DetailsRow";
import { OrderRecordMetaData, RecordMetaData } from "./others/RecordMetaData";
import { getFormattedDateTime } from "./others/DateHelper";
import { countTimeElapsedFormatter } from "./others/MothsTimeLength";
import { checkPriviliges } from "./others/PriviligiesNamesConv";

export default function ResultFormDetails(props){
    const navigate = useNavigate();
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
    const [post,setPost] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { patId, splId, ordId, mode } = useParams();
    const currentFormMode = mode ? formMode.EDIT : formMode.DETAILS;
	const [analyteResults, setAnalyteResults] = useState(null);
    
    const handleClick = (e) =>{ 
        setPost(!post);
        e.preventDefault();
        navigate(`/lab/tenant/patientOrders/${patId}/patientSamples/${splId}/ordersResults/${ordId}/analytesResults/`)
    }

    const handleChange = (event) =>{
        const {name, value } = event.target
        const ana = _.cloneDeep(analyteResults);
        console.log( `${ana}.analyteResults.ana${name}`);
        _.set(ana, `ana.${name}`, value==''?null:value);
        _.set(ana, `err.${name}`,'');
        
        setAnalyteResults(ana);
        console.log(ana);
    }

    

    const fetchAnalyteResults = async () => {
        return await getAnalyteResultsWithOrder(context.userToken, patId, splId, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    const t={
                        ana:res.data,
                        err:{
                        analyteResults:res.data.analyteResults.map(obj =>  {return{result:''}})}
                    };
                        console.log(t);
                    setAnalyteResults(t);
                    setIsLoaded(true);      
                }
                break;
				default: {
                    console.log(res);
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }
        const updateAnalyteResults = async () =>{
        return await updateAnalyteResultsWithOrder(context.userToken, patId, splId, ordId, analyteResults.ana)
        .then((res) => {
            switch (res.status){
                case (201):{
                    const tmp=_.cloneDeep(analyteResults)
                    tmp.ana=res.data;
                    setConnectionError('');
                    setAnalyteResults(tmp);
                   // const data = res.data.map(obj => {
                        //return {err:{result:''},ana:obj}
                   // })
                    //setAnalyteResults(data);
                    //setIsLoaded(true);      
                }
                break;
				default: {
                    console.log(res);
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        }).finally(()=> fetchAnalyteResults())
    }

    const cancelOrderResult = async() => {
        await cancelPatientOrderStatus(context.userToken, analyteResults.ana.order.id, analyteResults.ana.sample.id, analyteResults.ana.id)
        .then(res => {
			switch (res.status){
				case (200):{
                    const ana=_.cloneDeep(analyteResults);
                    ana.ana.labTestOrderStatus=res.data.labTestOrderStatus;
                    setAnalyteResults(ana);
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

    const acceptOrderResult = async() => {
        await acceptPatientOrderStatus(context.userToken, analyteResults.ana.order.id, analyteResults.ana.sample.id, analyteResults.ana.id)
        .then(res => {
			switch (res.status){
				case (200):{
                    const ana=_.cloneDeep(analyteResults);
                    ana.ana.labTestOrderStatus=res.data.labTestOrderStatus;
                    setAnalyteResults(ana);
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

    const rejectOrderResult = async() => {
        await rejectPatientOrderStatus(context.userToken, analyteResults.ana.order.id, analyteResults.ana.sample.id, analyteResults.ana.id)
        .then(res => {
			switch (res.status){
				case (200):{
                    const ana=_.cloneDeep(analyteResults);
                    ana.ana.labTestOrderStatus=res.data.labTestOrderStatus;
                    setAnalyteResults(ana);
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

    useEffect(()=>{
        if (isLoaded){
        updateAnalyteResults()
        }
    },[post])

    useEffect(()=>{
        fetchAnalyteResults();
        setIsLoaded(true);
        //if (currentFormMode === formMode.EDIT) {fetchAnalyteResults();}
    },[]);

    return !isLoaded ?
    <DoingWork/>:
    (
    <main>
        <div className="content">
        <h2>{analyteResults ? `${analyteResults.ana.laboratoryTest.shortName} > ${analyteResults.ana.laboratoryTest.name}`:'Wynik'}</h2>     
            
            
            {analyteResults?<>
                <div className="details-main-box">
                 <OrderRecordMetaData
                    orderDateLabel="Data skierowania:"
                    orderCreationDateLabel="Data utworzenia:"
                    orderDate={getFormattedDateTime(analyteResults.ana.order.orderDate)}
                    orderCreationDate={getFormattedDateTime(analyteResults.ana.cretionTimeStamp)}
                />
                <div className="details-content-box">
                    <DetailsRow key={1} label="Nr zlecenia:" value={<Link to={`/lab/tenant/patientOrders/details/${analyteResults.ana.order.id}`}>{`${analyteResults.ana.order.orderIdentificationCode}`}</Link>}/>
                    <DetailsRow key={7} label="Status:" value={`${analyteResults.ana.labTestOrderStatus}`}/>
                   </div>
                
            </div>                    

            <div className="details-main-box">
                <div className="details-content-box">
                    <DetailsRow key={2} label="Pacjent:" value={`${analyteResults.ana.order.patient.surname} ${analyteResults.ana.order.patient.name?analyteResults.ana.order.patient.name:''}`}/>
                    <DetailsRow key={3} label="PESEL:" value={analyteResults.ana.order.patient.personalIdentificationNumber}/>
                    <DetailsRow key={4} label="Data urodzenia:" value={analyteResults.ana.order.patient.dateOfBirth}/>
                    <DetailsRow key={5} label="Materiał:" value={analyteResults.ana.sample?`ID: ${analyteResults.ana.sample.sampleId} > ${analyteResults.ana.sample.specimentType.speciment}`:''}/>
                    <DetailsRow key={5} label="Data pobrania:" value={getFormattedDateTime(analyteResults.ana.sample.collectionDate)}/>
                    <DetailsRow key={6} label="Zlecający:" value={analyteResults.ana.order.orderingUnit?`${analyteResults.ana.order.orderingUnit.shortName} > ${analyteResults.ana.order.orderingUnit.name}`:''}/>
                </div>
                
            </div>
            </>:''}
            <h2 style={{marginBottom:'0.5rem', marginTop:0}}></h2>
            {currentFormMode===formMode.EDIT?
                <Form analyteResults={analyteResults} handleClick={handleClick} handleChange={handleChange} />:
                <div className="details-content-box">
                {analyteResults?
                analyteResults.ana.analyteResults.map((obj,index) => {
                   return <DetailsRowRefferential 
                        refferentialValue={
                            obj.method.type=='quantitative'&&obj.method.refferentialRanges&&obj.method.refferentialRanges.length>0?
                            [
                                ...obj.method.refferentialRanges.map(ref => {
                                    let targetRefferentialRange=(new Date(analyteResults.ana.sample.collectionDate).valueOf()- new Date(analyteResults.ana.order.patient.dateOfBirth).valueOf())>ref.fromAge
                                    && (new Date(analyteResults.ana.sample.collectionDate).valueOf()- new Date(analyteResults.ana.order.patient.dateOfBirth).valueOf())<ref.toAge
                                    return<div className={targetRefferentialRange?"details-refferential-value-bold":"details-refferential-value"}>
                                        {`${countTimeElapsedFormatter(ref.fromAge)}-${countTimeElapsedFormatter(ref.toAge)}: `}{ref.valueFrom+'-'+ref.valueTo+';\t'}
                                    </div>})
                                ]:''
                        } 
                        key={index} 
                        label={`${obj.method.analyte.name}`} 
                        value={obj.result?`${obj.result} ${obj.method.units?obj.method.units:''}`:''}
                    />
                }):''}
                </div>
            
            }          
            {connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:''}
            {currentFormMode==formMode.DETAILS&&checkPriviliges("SPECIFIC_DATABASE_TECHNICIAN",context.userRole)?<p>
                {analyteResults&&analyteResults.ana.labTestOrderStatus!=='REJECTED'?
			        <Link to={`EDIT`} className="button-add">Edytuj</Link>:''}
                {analyteResults&&checkPriviliges("SPECIFIC_DATABASE_SCIENTIST",context.userRole)&&analyteResults.ana.labTestOrderStatus==='PROCESSED'?
                    <button onClick={()=>acceptOrderResult()} className="button-add">Zatwierdź</button>:''
                }
                {analyteResults&&
                checkPriviliges("SPECIFIC_DATABASE_SCIENTIST",context.userRole)&&
                        (analyteResults.ana.labTestOrderStatus==='PROCESSED'||
                        analyteResults.ana.labTestOrderStatus==='PENDING')?
                    <button onClick={()=>rejectOrderResult()} className="button-add">Odrzuć</button>:''
                }
                {analyteResults&&
                    (analyteResults.ana.labTestOrderStatus==='PROCESSED'||
                    analyteResults.ana.labTestOrderStatus==='PENDING'||
                    analyteResults.ana.labTestOrderStatus==='ACCEPTED')?
                    <button onClick={()=>cancelOrderResult()} className="button-add">Anuluj</button>:''
                }
		    </p>:''}
        </div>
        
    </main>
    )

}

export function Form ({analyteResults, handleClick, handleChange}){
    
    return <>
        <form className="form" onSubmit={handleClick} noValidate={true}>
			<fieldset className='resultFieldset'>
                {analyteResults&&analyteResults.ana.analyteResults.length>0?
                analyteResults.ana.analyteResults.map((obj,index) =>{
                    return obj.type=='quantitative'?<>
                    <QuantitativeInput
                        method = {obj.method}
                        key={obj.id}
                        label = {obj.method.analyte.name}
                        name = {`analyteResults[${index}].result`}
                        error={analyteResults.err.analyteResults[index].result}
                        value={obj.result?obj.result:''}
                        onChange={handleChange}
				    />
                </>:
                <>
                    <QualitativeInput
                        selectName = {`analyteResults[${index}].result`}
                        method = {obj.method}
                        key={obj.id}
                        label = {obj.method.analyte.name}
                        name = {`analyteResults[${index}].result`}
                        type = "text"
                        error={analyteResults.err.analyteResults[index].result}
                        value={obj.result?obj.result:''}
                        onChange={handleChange}
                    />
                </>
                })
                :''}
				
			</fieldset>
            <div className="form-buttons">
                <input type="submit" className="form-button-submit" value="Dodaj"/>
            </div>
		</form>
    </>
}