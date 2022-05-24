import { InputSearchForm } from "../others/SerchBarComponents"
import Collapsible from "../fragments/Collapsible"
import { useState, useContext, useEffect, useRef } from "react"
import { StateContext } from "../../App"
import TableComponent from "../others/TableComponent"
import { PatientListTableRow } from "../others/TableComponent"
import { getFormattedDateTime } from "../others/DateHelper"
import { getPatients, addUpdatePatients } from "../../apiCalls/PatientApiCalls"
import PageSizeAndIndexComponent from "../others/PageSizeAndIndexComponent"
import { patientData } from "../others/PatientForm"
import _ from "lodash"
import { searchData } from "../PatientList"


export function PatientAddPopup(props){
    const [isLoaded, setIsLoaded]=useState(false);
    const context= useContext(StateContext);
    const [connectionError, setConnectionError] = useState('');
    const [patient, setPatient] = useState(_.cloneDeep(patientData));
    const [post,setPost]=useState(true);
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

    const createPatient = () => {
		addUpdatePatients(context.userToken, patient.pat)
		.then(res => {
			switch (res.status){
				case (201):{
                    props.getAdd({
                        id:res.data.id,
                        name: res.data.name,
                        surname: res.data.surname,
                        dateOfBirth: res.data.dateOfBirth,
                        personalIdentificationNumber: res.data.personalIdentificationNumber
                    })
				    setPatient(_.cloneDeep(patientData));
				    setConnectionError("");
                    props.handleVisibility(false);
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
		});
	}

    useEffect(()=>{
        console.log("Ssss")
        if (isLoaded==true){
            createPatient();
            console.log("Dddd")
        }
        setIsLoaded(true);
    },[props.retriveObject,post])

    return <div>    
    <h2>Nowy pacjent</h2>
    <form className="popup-form" onKeyDown={(e)=>{if(e.code==="Enter"){e.preventDefault(); setPost(!post)}}} onSubmit={e => e.preventDefault()}>
    <fieldset className="popup-searchFieldset">
        
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
    patient.pat.addresses.map((_, index) => { 
        
    return <Collapsible name={`Adres ${index+1}:`}>
    <form className="popup-form" onKeyDown={(e)=>{if(e.code==="Enter"){e.preventDefault(); setPost(!post)}}} onSubmit={e => e.preventDefault()}>
    <fieldset className="popup-searchFieldset">
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
    <form className="popup-form" onKeyDown={(e)=>{if(e.code==="Enter"){e.preventDefault(); setPost(!post)}}} onSubmit={e => e.preventDefault()}>
    <fieldset className="popup-searchFieldset">
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
    {connectionError?<h4 className='errors-text'>
		{`Couldn't retrieve data. ${connectionError}`}
	</h4>:''}
    </div>   
}

export function PatientSearchPopup(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
	const [patients, setPatients] = useState([]);
	const [connectionError, setConnectionError] = useState("");
	const [actualRow, setActualRow] = useState(null);
    const [totalPages, setTotalPages] = useState (1);
	const [currentPage,setCurrentPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
    const [sortOrder, setSortOrder] = useState({
		field: "CREATION_DATE",
		direction: "DESC"
	})
	const [search, setSearch] = useState (_.cloneDeep(searchData));
	const parent = useRef(null);

    const handleChange = (e) =>{
        if(_.get(search.err,e.target.name)=='') return;
		const searchValue = _.cloneDeep(search);
		_.set(searchValue.err,e.target.name,'');
		setSearch(searchValue);
	};

    const handleClick= (e) =>{
		e.preventDefault();
		const searchValue= _.cloneDeep(searchData);
		Object.entries(parent.current.childNodes).map((entry)=>{
			if(_.has(searchValue.pat,entry[1].name))
			_.set(searchValue.pat,entry[1].name,entry[1].value?entry[1].value:null);
		})
		searchValue.search=!search.search;
		setSearch(searchValue);
	};

    const onRowClick = (e => {setActualRow(e)})

    const OnHeaderClick = (e) => {
		let sort=null;
		switch (e){
			case ("name"): sort = {
				field: "NAME",
				direction: sortOrder.field!="NAME" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
			}; 
			break;
			case ("surname"): sort = {
				field: "SURNAME",
				direction: sortOrder.field!="SURNAME" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
			};
			break;
			case ("personalIdentificationNumber"): sort = {
				field: "PERSONAL_ID",
				direction: sortOrder.field!="PERSONAL_ID" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
			};
			break;
			case ("dateOfBirth"): sort = {
				field:"BIRTHDATE",
				direction: sortOrder.field!="BIRTHDATE" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
			};
			break;
			case ("cretionTimeStamp"): sort = {
				field:"CREATION_DATE",
				direction: sortOrder.field!="CREATION_DATE" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
			};
			break;
			default:;		
		}
		if (sort!=null){
			setSortOrder(sort);
		}
	};
    
    const fetchList = () => {
		getPatients(context.userToken, currentPage, pageSize, sortOrder, /*searchParam*/search.pat)()
		.then(res => {
			switch (res.status){
				case (200):{
					console.log(search)
				setPatients(res.data.content);
				setTotalPages(res.data.totalPages);
				setConnectionError("");
				};
				break;
				case (422): {
					console.log(res.data);
					const ser =_.cloneDeep(search);
					Object.keys(res.data.message)
						.map(key => {
							_.set(ser.err,key.split('.')[1],res.data.message[key]);
						});
					setSearch(ser);
					console.log(ser);
				}
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${res.data.message}`:''}`);
					setPatients([]);
					console.log(res.data)
				}
			}
		})
	}

    useEffect(() =>{fetchList()},[currentPage,sortOrder,/*searchClick*/, search.search]);

    useEffect(() =>{
        if (isLoaded==true && actualRow!=null){
            props.getAdd({
                id:actualRow.id,
                name: actualRow.name,
                surname: actualRow.surname,
                dateOfBirth: actualRow.dateOfBirth,
                personalIdentificationNumber: actualRow.personalIdentificationNumber
            });
            props.handleVisibility(false);
        }
        setIsLoaded(true);
    },[props.retriveObject])
    return <div>
        {connectionError?<h4 className='errors-text'>
		{`Couldn't retrieve data. ${connectionError}`}
	</h4>:''}  
    <h2>Pacjent</h2>


            <Collapsible name="Wyszukaj">
				<form className="popup-form" onKeyDown={(e)=>{if(e.code==="Enter")handleClick(e)}}  onSubmit={e=> {e.preventDefault()}}>
					<fieldset className="popup-searchFieldset" ref={parent}>
					
					<InputSearchForm
						label = "Imię:"
						name = "name"
						type = "text"
						error={search.err.name}
						onChange={handleChange}
					/>	
					<InputSearchForm
						label = "Nazwisko:"
						name = "surname"
						type = "text"
						error={search.err.surname}
						onChange={handleChange}
					/>

					<InputSearchForm
						label = "Data urodzenia od:"
						name = "dateOfBirthFrom"
						type = "date"
						min="1900-01-01"
						max= {new Date().toJSON().split('T')[0]}
						error={search.err.dateOfBirthFrom}
						onChange={handleChange}
					/>
					
					<InputSearchForm
						label = "Data urodzenia do:"
						name = "dateOfBirthTo"
						type = "date"
						min="1900-01-01"
						max= {new Date().toJSON().split('T')[0]}
						error={search.err.dateOfBirthTo}
						onChange={handleChange}
					/> 
				    <InputSearchForm
						label = "PESEL:"
						name = "personalIdentificationNumber"
						type = "text"
						error={search.err.personalIdentificationNumber}
						onChange={handleChange}
					/>
				
				<div className="form-buttons">
                    <input type="submit" onClick={handleClick} className="form-button-submit" value="Szukaj"/>
                </div>
					</fieldset>
				</form>
			</Collapsible>
            <TableComponent
					labelsArray={{
						name:"Imie",
						surname:"Nazwisko",
						personalIdentificationNumber: "Pesel",
						dateOfBirth:"Data Urodzenia",
						cretionTimeStamp: "Data utworzenia"
					}}
					onTableHeaderClick={OnHeaderClick}
			>
                {patients!=null ? patients.map(row =>
                	
					<PatientListTableRow
                        onRowClick={onRowClick}
						patData={row}
						labels={{
							name: null,
							surname: null,
							personalIdentificationNumber: null,
							dateOfBirth:null,
							cretionTimeStamp: (v) =>getFormattedDateTime(v),
						}}
					/>):<></>
				}

            </TableComponent>
            <PageSizeAndIndexComponent 
                    elementCount={6}
					totalPages={totalPages} 
					currentPage={currentPage}
					onPageClick={(page) => setCurrentPage(page)}
					onPageSizeSelection={(e) => {setPageSize(e.target.value);setCurrentPage(0)}}
					pageSizeArray={[10]}
				/>
            </div>
}