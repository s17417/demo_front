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
import { QualitativeMethodFormFields, QuantitativeMethodDetails, QuantitativeMethodFormFields } from "../others/MethodFormats"
import MethodTypeMode from "../others/MethodTypeMode"
import { getAllAnalytes } from "../../apiCalls/AnalyteApiCalls"

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


export function MethodFormPopup(props){
    const context= useContext(StateContext);
    const ltdId = props.ltdId;
    const getObjectCallback=props.getObjectCallback;
    const parent = useRef(null);
    const [post,setPost]= useState(true);
    const [resultType, setResultType] = useState(MethodTypeMode.QUANTITATIVE_METHOD_FORM);
    const [analytes,setAnalytes] =useState([]);
    const [connectionError, setConnectionError] = useState('');


    const fetchAnalytes = () =>{
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
    }

    useEffect(()=>fetchAnalytes(),[])
   
    
    return <div>
    <h2>Nowa analiza</h2>
    <form className="popup-form" onKeyDown={(e)=>{if(e.code==="Enter")setPost(!post)}}  onSubmit={e=> {e.preventDefault()}}>
					<fieldset className="popup-searchFieldset" ref={parent}>
			<Select
                onChange={(e) =>setResultType(e.target.value)}
                label = 'Typ Metody:'
                error = ''
                value ={resultType}
                name='type'
            >
                <Option label='QUANTITATIVE' value={MethodTypeMode.QUANTITATIVE_METHOD_FORM}/>
                <Option label='QUALITATIVE' value={MethodTypeMode.QUALITATIVE_METHOD_FORM} />
                
            </Select>
            {resultType==MethodTypeMode.QUANTITATIVE_METHOD_FORM ?
            <QuantitativeMethodFormFields
                analytes={analytes}
                ltdId={ltdId}
                getObjectCallback={getObjectCallback}
                retriveObject={props.retriveObject}
            />:''}
            {resultType==MethodTypeMode.QUALITATIVE_METHOD_FORM ?
            <QualitativeMethodFormFields
                analytes={analytes}
                ltdId={ltdId}
                getObjectCallback={getObjectCallback}
                retriveObject={props.retriveObject}
            />:''}
            
        </fieldset>
    </form>
    {connectionError!=''?
    <h4 className='errors-text'>
		{`Couldn't retrieve data. ${connectionError}`}
	</h4>:''}
    </div>   
}

export function MethodDetailsPopup(props){
    
    return <div>
        <QuantitativeMethodDetails
            method={props.method}
        />	
    </div>   
}

