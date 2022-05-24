import { useState, useContext, useEffect } from "react";
import { DoingWork } from "./DoingWork";
import { StateContext } from "../../App";
import { InputSearchForm } from "./SerchBarComponents";
import _, { add, set } from "lodash";
import Collapsible from "../fragments/Collapsible";
import { addUpdatePatients } from "../../apiCalls/PatientApiCalls";
import { useNavigate, useParams } from "react-router-dom";
import formMode from "./FormMode";
import { getPatient } from "../../apiCalls/PatientApiCalls";

export const patientData = {
    pat: {
        id:null,
        name:null,
        surname:null,
        personalIdentificationNumber:null,
        gender:null,
        dateOfBirth:null,
        addresses: [
            {
                country:null,
                state:null,
                city:null,
                street:null,
                postalCode:null
            },
            {
                country:null,
                state:null,
                city:null,
                street:null,
                postalCode:null
            }
        ],
        phoneNumbers:[null,null,null]
    },
    err: {
        name:'',
        surname:'',
        personalIdentificationNumber:'',
        dateOfBirth:'',
        addresses: [
            {
                country:'',
                state:'',
                city:'',
                street:'',
                postalCode:''
            },
            {
                country:'',
                state:'',
                city:'',
                street:'',
                postalCode:''
            }
        ],
        phoneNumbers:['','','']
    }
}

export default function PatientForm(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(true);
    const [post,setPost] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { patId } = useParams();
    const navigate = useNavigate();
    const currentFormMode = patId ? formMode.EDIT : formMode.NEW;
	const [patient, setPatient] = useState(_.cloneDeep(patientData));
    
    const handleClick = (e) =>{ 
        setPost(true);
        e.preventDefault();
    }

    const handleChange = (event) =>{
        const {name, value } = event.target
        const pat = _.cloneDeep(patient.pat);
        const errors = _.cloneDeep(patient.err);
        _.set(pat, name, value==''?null:value);
        _.set(errors, name,'');
        
        setPatient({
            pat: pat,
            err: errors
        });
    }

    const fetchList = () => {	
        if (post==false) return;
		addUpdatePatients(context.userToken, patient.pat)
		.then(res => {
			switch (res.status){
                case (200):{
                    navigate(`/lab/tenant/patients/details/${patId}`);
                };
                break;
				case (201):{
				    setPatient(_.cloneDeep(patientData));
				    setConnectionError("");
				};
				break;
				case (422): {
                    const pat =  _.cloneDeep(patient);
					Object.keys(res.data.message)
						.map(key => {
                            if (key!='1062')
                                _.set(pat.err, key, res.data.message[key]);
                            else {
                                console.log(JSON.stringify(res.data.message));
                                const reg= /(Patient)([.])([aA-zZ]+)/gm;
                                const k=res.data.message[key].match(reg)[0].split('.')[1]; 
                                _.set(pat.err, k, res.data.message[key]);
                            }
                            
                            
						})
                    setPatient(pat);
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

    const fetchPatient = async () => {
        return await getPatient(context.userToken, patId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    const pat =res.data;
                    
                    pat.addresses=[...patientData.pat.addresses]
                    .map((value,index) => pat.addresses[index]?pat.addresses[index]:value);
                   
                    pat.phoneNumbers=[...patientData.pat.phoneNumbers]
                    .map((value,index) => pat.phoneNumbers[index]?pat.phoneNumbers[index]:value);	
				    const p = _.cloneDeep(patient);
                    p.pat=pat;
                    setPatient(p);
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
        if (currentFormMode === formMode.EDIT) {fetchPatient();}
    },[]);

    useEffect(()=>{if (post==true) fetchList()},[post])

    return !isLoaded ?
    <DoingWork/>:
    (
    <main>
        <div className="content">
		    <h2>Nowy pacjent</h2>
            {
		    connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
            <>
                <Form patient={patient} handleClick={handleClick} handleChange={handleChange} />
            </>
            }
        </div>
    </main>
    )

}

export function Form ({patient, handleClick, handleChange}){
    return <><form className="form" onKeyDown={(e)=>{if(e.code==="Enter")handleClick(e)}} onSubmit={e=> e.preventDefault()}>
				<fieldset className="searchFieldset">
					
				<InputSearchForm
					label = "Imię:"
					name = "name"
					type = "text"
					error={patient.err.name}
                    value={patient.pat.name?patient.pat.name:''}
					onChange={handleChange}
				/>	
				<InputSearchForm
					label = "Nazwisko:"
					name = "surname"
					type = "text"
					error={patient.err.surname}
                    value={patient.pat.surname?patient.pat.surname:''}
					onChange={handleChange}
				/>

				<InputSearchForm
					label = "Data urodzenia:"
					name = "dateOfBirth"
					type = "date"
					min="1900-01-01"
					max= {new Date().toJSON().split('T')[0]}
					error={patient.err.dateOfBirth}
                    value={patient.pat.dateOfBirth?patient.pat.dateOfBirth:''}
					onChange={handleChange}
				/>

				<InputSearchForm
					label = "PESEL:"
					name = "personalIdentificationNumber"
					type = "text"
					error={patient.err.personalIdentificationNumber}
					value={patient.pat.personalIdentificationNumber?patient.pat.personalIdentificationNumber:''}
                    onChange={handleChange}
				/>
                <label htmlFor="gender">Płeć</label>
                <select name="gender" id="gender" value={patient.pat.gender?patient.pat.gender:''} className="" onChange={handleChange}>
                        <option key={''} value='' label="" />
                        <option key="N" value="UNDEFINED" label="N" />
                        <option key="F" value="FEMALE" label="K" />
                        <option key="M" value="MALE" label="M" />
                </select>
                
					</fieldset>
				</form>
                {
                patient.pat.addresses
                //.filter((v)=> v!=null)
                .map((_, index) => { 
                    
                return <Collapsible name={`Adres ${index+1}:`}>
                <form className="form">
                    <fieldset className="searchFieldset">
                <InputSearchForm
					label = "Kraj:"
					name = {`addresses[${index}].country`}
					type = "text"
					error={patient.err.addresses[index].country}
					value={patient.pat.addresses[index].country?patient.pat.addresses[index].country:''}
                    onChange={handleChange}
				/>
                 <InputSearchForm
					label = "Województwo:"
					name = {`addresses[${index}].state`}
					type = "text"
					error={patient.err.addresses[index].state}
					value={patient.pat.addresses[index].state?patient.pat.addresses[index].state:''}
                    onChange={handleChange}
				/>
                <InputSearchForm
					label = "Miasto:"
					name = {`addresses[${index}].city`}
					type = "text"
					error={patient.err.addresses[index].city}
					value={patient.pat.addresses[index].city?patient.pat.addresses[index].city:''}
                    onChange={handleChange}
				/>
                <InputSearchForm
					label = "Ulica:"
					name = {`addresses[${index}].street`}
					type = "text"
					error={patient.err.addresses[index].street}
					value={patient.pat.addresses[index].street?patient.pat.addresses[index].street:''}
                    onChange={handleChange}
				/>
                <InputSearchForm
					label = "Kod pocztowy:"
					name = {`addresses[${index}].postalCode`}
					type = "text"
					error={patient.err.addresses[index].postalCode}
					value={patient.pat.addresses[index].postalCode?patient.pat.addresses[index].postalCode:''}
                    onChange={handleChange}
				/>
                
					</fieldset>
				</form>
                </Collapsible>
                })}

                <Collapsible name={`Dane kontaktowe:`}>
                <form className="form">
                    <fieldset className="searchFieldset">
                        {patient.pat.phoneNumbers.map((_, index) => {
                            return <InputSearchForm
                            label = {`Dane Kontaktowe ${index+1}:`}
                            name = {`phoneNumbers[${index}]`}
                            type = "text"
                            error={patient.err.phoneNumbers[index]}
                            value={patient.pat.phoneNumbers[index]?patient.pat.phoneNumbers[index]:''}
                            onChange={handleChange}
                        />
                        })}
                    </fieldset>
                </form>
                </Collapsible>
                <form className="form" onSubmit={handleClick}>
				<div className="form-buttons">
                    <input type="submit" className="form-button-submit" value="Dodaj"/>
                </div>
                </form>
                </>
}