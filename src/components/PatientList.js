import React from 'react'
import {Link} from 'react-router-dom'
import { getPatients } from '../apiCalls/PatientApiCalls'
import { useContext, useEffect } from "react";
import {StateContext} from '../App';
import { useState, useRef } from 'react';
import { DoingWork } from './others/DoingWork';
import { getFormattedDateTime } from './others/DateHelper';
import PageSizeAndIndexComponent from './others/PageSizeAndIndexComponent';
import TableComponent from './others/TableComponent';
import { PatientListTableRow } from './others/TableComponent';
import { InputSearchForm } from './others/SerchBarComponents';
import Collapsible from './fragments/Collapsible';
import _ from 'lodash';
import { checkPriviliges } from './others/PriviligiesNamesConv';

export const searchData = {
	search: false,
	pat:{
		name: null,
		surname:null,
		dateOfBirthFrom:null,
		dateOfBirthTo:null,
		personalIdentificationNumber:null
	},
	err:{
		name: "",
		surname:"",
		dateOfBirthFrom:'',
		dateOfBirthTo:'',
		personalIdentificationNumber:""
	}
}


export default function PatientList(){
	const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
	const [patients, setPatients] = useState([]);
	const [error, setError] = useState("");
	const [totalPages, setTotalPages] = useState (1);
	const [currentPage,setCurrentPage] = useState(0);
	const [pageSize, setPageSize] = useState(25);
	const [sortOrder, setSortOrder] = useState({
		field: "CREATION_DATE",
		direction: "DESC"
	})

	const [search, setSearch] = useState(_.cloneDeep(searchData))
	const handleClick= async (obj) =>{
		setSearch(obj);
	}
	const handleChange = (e) =>{
		if(_.get(search.err,e.target.name)=='') return;
		const searchValue = _.cloneDeep(search);
		_.set(searchValue.err,e.target.name,'');
		setSearch(searchValue);
	}

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
				setPatients(res.data.content);
				setTotalPages(res.data.totalPages);
				setError("");
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
				}
				break;
				default: {
					setError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${res.data.message}`:''}`);
					setPatients([]);
					console.log(res.data)
				}
			}
		})
		.finally(() => {
			setIsLoaded(true)
		});	
	}

	useEffect(() =>{fetchList()},[currentPage,pageSize,sortOrder,search.search]);


	
    return !isLoaded ?
		<DoingWork/>:
		(
        <main>
    	<div className="content">
		<h2>Lista Pacjentów</h2>
		{
		error!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${error}`}
			</h4>:
			<>
				<PatientDataSearch searchParam={search} handleClick={handleClick} handleChange={handleChange}/>
				<TableComponent
					labelsArray={{
						name:"Imie",
						surname:"Nazwisko",
						personalIdentificationNumber: "Pesel",
						dateOfBirth:"Data Urodzenia",
						gender: "Płeć",
						cretionTimeStamp: "Data utworzenia",
						updateTimeStamp: "Data modyfikacji",
						actions: "Akcje"
					}}
					onTableHeaderClick={OnHeaderClick}
				>
				{patients!=null ? patients.map((row,index) =>	
					<PatientListTableRow
						key={index}
						patData={row}
						labels={{
							name: null,
							surname: null,
							personalIdentificationNumber: null,
							dateOfBirth:null,
							gender: (v) => v=='FEMALE'?'K':v=='MALE'?'M':v=='UNDEFINED'?'N':null,
							cretionTimeStamp: (v) =>getFormattedDateTime(v),
							updateTimeStamp: (v) =>getFormattedDateTime(v)
						}}
					>
						<Link key={row.id} to={`details/${row.id}`} className="list-actions-button-details">Szczegóły</Link>
                        <Link key={row.id} to={`edit/${row.id}`} className="list-actions-button-edit">Edytuj</Link>
					</PatientListTableRow>):<></>
				}
				</TableComponent>
				<PageSizeAndIndexComponent 
					totalPages={totalPages} 
					currentPage={currentPage}
					onPageClick={(page) => setCurrentPage(page)}
					onPageSizeSelection={(e) => {setPageSize(e.target.value);setCurrentPage(0)}}
					pageSizeArray={[25,50,250,500]}
				/>	
				{checkPriviliges("SPECIFIC_DATABASE_USER",context.userRole)?
					<p>
						<Link to="add" className="button-add">Dodaj nowego pacjenta</Link>
					</p>:''
				}
			</>
		}
		</div>
	</main>
    )

}


const PatientDataSearch = ({searchParam, handleClick, handleChange}) => {
	const parent = useRef(null);

	const handleInput=()=>{
		const searchValue= _.cloneDeep(searchData);
		Object.entries(parent.current.childNodes).map((entry)=>{
			if(_.has(searchValue.pat,entry[1].name))
			_.set(searchValue.pat,entry[1].name,entry[1].value?entry[1].value:null);
		})
		searchValue.search=!searchParam.search;
		return searchValue;
	}
	return <Collapsible name="Wyszukaj">
				<form className="form" onSubmit={(e)=>{e.preventDefault();handleClick(handleInput())}}>
					<fieldset className="searchFieldset" ref={parent}>
					
					<InputSearchForm
						label = "Imię:"
						name = "name"
						type = "text"
						error={searchParam.err.name}
						onChange ={handleChange}
					/>	
					<InputSearchForm
						label = "Nazwisko:"
						name = "surname"
						type = "text"
						error={searchParam.err.surname}
						onChange ={handleChange}
					/>

					<InputSearchForm
						label = "Data urodzenia od:"
						name = "dateOfBirthFrom"
						type = "date"
						min="1900-01-01"
						max= {new Date().toJSON().split('T')[0]}
						error={searchParam.err.dateOfBirthFrom}
						onChange ={handleChange}
					/>
					
					<InputSearchForm
						label = "Data urodzenia do:"
						name = "dateOfBirthTo"
						type = "date"
						min="1900-01-01"
						max= {new Date().toJSON().split('T')[0]}
						error={searchParam.err.dateOfBirthTo}
						onChange ={handleChange}
					/> 
				<InputSearchForm
						label = "PESEL:"
						name = "personalIdentificationNumber"
						type = "text"
						error={searchParam.err.personalIdentificationNumber}
						onChange ={handleChange}
					/>
				
				<div className="form-buttons">
                    <input type="submit" className="form-button-submit" value="Szukaj"/>
                </div>
					</fieldset>
				</form>
			</Collapsible>
}