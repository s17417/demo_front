import { useState, useContext, useEffect } from "react";
import { DoingWork } from "./others/DoingWork";
import { StateContext } from "../App";
import { InputSearchForm, Select } from "./others/SerchBarComponents";
import _, { add, set } from "lodash";
import { addUpdatePhisicians } from "../apiCalls/PhisiciansApiCalls";
import { Link, useNavigate, useParams } from "react-router-dom";
import formMode from "./others/FormMode";
import { getPhisician } from "../apiCalls/PhisiciansApiCalls";
import { getAnalyteResults, getAnalyteResultsWithOrder, getOrderResult, updateAnalyteResultsWithOrder } from "../apiCalls/PatientOrderCalls";
import { QualitativeInput, QuantitativeInput } from "./others/ResultInput";
import { DetailsRow, DetailsRowQuantitativeControl, DetailsRowControlC } from "./DetailsRow";
import { OrderRecordMetaData, RecordMetaData } from "./others/RecordMetaData";
import { getFormattedDateTime } from "./others/DateHelper";
import { getAnalyteResultsWithControlOrder, updateAnalyteResultsWithControlOrder } from "../apiCalls/ControlOrderApiCalls";
import { checkPriviliges } from "./others/PriviligiesNamesConv";

export default function ControlResultFormDetails(props){
    const navigate = useNavigate();
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
    const [post,setPost] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { contId, splId, ordId, mode } = useParams();
    const currentFormMode = mode ? formMode.EDIT : formMode.DETAILS;
	const [analyteResults, setAnalyteResults] = useState(null);
    
    const handleClick = (e) =>{ 
        setPost(!post);
        e.preventDefault();
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

    const getAnalyteStatistic = (analyteResult) => {
        const target = analyteResults.ana.parentTargetValue.analyteResults
                        .find((tval)=>tval.method.id==analyteResult.method.id);
        return {
            precision:(analyteResult.result/target.result*100).toFixed(1),
            sd: (Math.abs(target.result-analyteResult.result)/target.standardDeviation).toFixed(2),
            target: target
        }

    }

    

    const fetchAnalyteResults = async () => {
        return await getAnalyteResultsWithControlOrder(context.userToken, contId, splId, ordId)
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
        return await updateAnalyteResultsWithControlOrder(context.userToken, contId, splId, ordId, analyteResults.ana)
        .then((res) => {
            switch (res.status){
                case (201):{
                    const tmp=_.cloneDeep(analyteResults)
                    tmp.ana=res.data;
                    setConnectionError('');
                    setAnalyteResults(tmp);
                    navigate(`/lab/tenant/controlOrders/${contId}/controlSamples/${splId}/controlResults/${ordId}/analytesResults/`)     
                }
                break;
				default: {
                    console.log(res);
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
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
            {analyteResults?
            <div className="details-main-box">
                 <OrderRecordMetaData
                    orderDateLabel="Data skierowania:"
                    orderCreationDateLabel="Data utworzenia:"
                    orderDate={getFormattedDateTime(analyteResults.ana.orderDate)}
                    orderCreationDate={getFormattedDateTime(analyteResults.ana.cretionTimeStamp)}
                />
                <div className="details-content-box">
                    <DetailsRow key={1} label="Nr zlecenia:" value={`${analyteResults.ana.order.orderIdentificationCode}`}/>
                    <DetailsRow key={2} label="Nazwa:" value={`${analyteResults.ana.order.name}`}/>
                    <DetailsRow key={3} label="Termin ważności:" value={analyteResults.ana.order.expirationDate}/>
                    <DetailsRow key={4} label="Termin raportowania:" value={analyteResults.ana.order.reportingDeadLine}/>
                    <DetailsRow key={5} label="Materiał:" value={analyteResults.ana.sample?`ID: ${analyteResults.ana.sample.sampleId} > ${analyteResults.ana.sample.specimentType.speciment}`:''}/>
                </div>
                
            </div>:''}
            <h2 style={{gridColumn:'1/3', margin:'0.1rem'}}/>
            {currentFormMode===formMode.EDIT?
                <Form analyteResults={analyteResults} handleClick={handleClick} handleChange={handleChange} />:
                <div className="details-content-box">
                {analyteResults?
                analyteResults.ana.analyteResults.map((obj,index) => { 
                    if (obj.type=='control_quantitative')
                    return <>
                        <h3 style={{marginTop:'0.1rem'}}>{obj.method.analyte.name}</h3>
                        <DetailsRow label='Wartość docelowa:' value={obj.result?obj.result:'N/A'}/>
                        <DetailsRow label='Granica dolna:' value={obj.lowerLimit?obj.lowerLimit:'N/A'}/>
                        <DetailsRow label='Granica górna:' value={obj.upperLimit?obj.upperLimit:'N/A'}/>
                        <DetailsRow label='SD:' value={obj.standardDeviation?obj.standardDeviation:'N/A'}/>
                        <h2 style={{gridColumn:'1/3', margin:'0rem'}}/>
                    </>
                    if (obj.type=='control_qualitative')
                    return <>
                        <h3 style={{marginTop:'0.1rem'}}>{obj.method.analyte.name}</h3>
                        <DetailsRow label='Wynik docelowy:' value={obj.result?obj.result:'N/A'}/>
                        <h2 style={{gridColumn:'1/3', margin:'0rem'}}/>
                    </>
                    if (obj.type=='quantitative')
                    return<>
                        <h3 style={{marginTop:'0.1rem'}}>{obj.method.analyte.name}</h3>
                        <DetailsRow 
                            label='Wynik:'
                            value={obj.result?`${obj.result} ${obj.method.units?obj.method.units:''}`:'N/A'}
                            valueSubs={obj.result?<>
                                    {(()=>{
                                        const stats=getAnalyteStatistic(obj);
                                        return <>
                                            <sub>{isFinite(stats.precision)?`Dokładność: ${stats.precision}%`:''}</sub>
                                                {'\t'}
                                            <sub>{isFinite(stats.sd)?`SD: ${stats.sd}`:''}</sub>
                                        </>
                                        }).apply()
                                    }
                            </>:''}
                        />
                    </>
                }):''}
                </div>
            
            }          
            {connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:''}
            {currentFormMode==formMode.DETAILS&&checkPriviliges("SPECIFIC_DATABASE_TECHNICIAN",context.userRole)?<p>
			<Link to={`EDIT`} className="button-add">Edytuj</Link>
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
                if (obj.type=='quantitative')
                    return <QuantitativeInput
                        method = {obj.method}
                        key={obj.id}
                        label = {obj.method.analyte.name}
                        name = {`analyteResults[${index}].result`}
                        error={analyteResults.err.analyteResults[index].result}
                        value={obj.result?obj.result:''}
                        onChange={handleChange}
				    />
                if (obj.type=='qualitative')
                    return <QualitativeInput
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
                if (obj.type=='control_quantitative')
                    return <>
                        <label style={{gridColumn:'1/2', marginBottom:'2rem'}}>{obj.method.analyte.name}</label>
                        <div style={{gridColumn:'2/3', marginBottom:'2rem'}}>
                        <QuantitativeInput
                            method = {obj.method}
                            key={obj.id}
                            label = {'Wartość docelowa'}
                            name = {`analyteResults[${index}].result`}
                            error={analyteResults.err.analyteResults[index].result}
                            value={obj.result?obj.result:''}
                            onChange={handleChange}
                        />
                        <QuantitativeInput
                            method = {obj.method}
                            key={obj.id}
                            label = {'Dolna granica'}
                            name = {`analyteResults[${index}].lowerLimit`}
                            error={analyteResults.err.analyteResults[index].result}
                            value={obj.lowerLimit?obj.lowerLimit:''}
                            onChange={handleChange}
                        />
                        <QuantitativeInput
                            method = {obj.method}
                            key={obj.id}
                            label = {'Górna granica'}
                            name = {`analyteResults[${index}].upperLimit`}
                            error={analyteResults.err.analyteResults[index].result}
                            value={obj.upperLimit?obj.upperLimit:''}
                            onChange={handleChange}
                        />
                        <QuantitativeInput
                            method = {obj.method}
                            key={obj.id}
                            label = {'Górna granica'}
                            name = {`analyteResults[${index}].standardDeviation`}
                            error={analyteResults.err.analyteResults[index].result}
                            value={obj.standardDeviation?obj.standardDeviation:''}
                            onChange={handleChange}
                        />
                        </div>
                    </>
                if (obj.type=='control_qualitative')
                    return <>
                    <label style={{gridColumn:'1/2', marginBottom:'2rem'}}>{obj.method.analyte.name}</label>
                        <div style={{gridColumn:'2/3', marginBottom:'2rem'}}>
                        <QualitativeInput
                            selectName = {`analyteResults[${index}].result`}
                            method = {obj.method}
                            key={obj.id}
                            label = {'Wynik docelowy:'}
                            name = {`analyteResults[${index}].result`}
                            type = "text"
                            error={analyteResults.err.analyteResults[index].result}
                            value={obj.result?obj.result:''}
                            onChange={handleChange}
                        />
                    </div>
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