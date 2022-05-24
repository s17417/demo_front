import React from 'react'
import {Link} from 'react-router-dom'
import { getPatientsOrders } from '../apiCalls/PatientOrderCalls';
import { useContext, useEffect, useMemo } from "react";
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

export const searchData={
    search:false,
    err:{
        name: '',
        surname:'',
        fromBirthDate:'',
        toBirthDate:'',
        fromOrderDate:'',
        toOrderDate:'',
        personalIdentificationNumber:'',
        orderIdentificationCode:''
    },
    ser:{
        name: null,
        surname:null,
        fromBirthDate:null,
        toBirthDate:null,
        fromOrderDate:null,
        toOrderDate:null,
        personalIdentificationNumber:null,
        orderIdentificationCode:null
    }
}

export default function PatientOrderList(){
	const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
	const [orders, setOrders] = useState([]);
	const [connectionError, setConnectionError] = useState("");
	const [totalPages, setTotalPages] = useState (1);
	const [currentPage,setCurrentPage] = useState(0);
	const [pageSize, setPageSize] = useState(25);
	const [sortOrder, setSortOrder] = useState({
		field: "CREATION_DATE",
		direction: "DESC"
	})
	const [search, setSearch] = useState (_.cloneDeep(searchData))

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
            case ("orderIdentificationCode"): sort = {
				field: "ORDER_IDENTIFICATION",
				direction: sortOrder.field!="ORDER_IDENTIFICATION" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
			};
            break;
            case ("orderDate"): sort = {
				field: "ORDER_DATE",
				direction: sortOrder.field!="ORDER_DATE" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
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
		getPatientsOrders(context.userToken, currentPage, pageSize, sortOrder, search.ser)()
		.then(res => {
			switch (res.status){
				case (200):{
				setOrders(res.data.content);
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
				}
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${res.data.message}`:''}`);
					setOrders([]);
					console.log(res.data);
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
		<h2>Lista Zleceń</h2>
		{
		connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
			<>
				<PatientOrderDataSearch search={search} handleClick={handleClick} handleChange={handleChange}/>
				<>
                <TableComponent
					labelsArray={{
                        orderIdentificationCode:"Nr.",
						name:"Imie",
						surname:"Nazwisko",
						personalIdentificationNumber: "Pesel",
						dateOfBirth:"Data Urodzenia",
                        orderingUnit:"Zlecający",
						cretionTimeStamp: "Data utworzenia",
                        orderDate: "Data Zlecenia",
						actions: "Akcje"
					}}
					onTableHeaderClick={OnHeaderClick}
				>
				{orders!=null ? orders.map(row =>	
					<PatientListTableRow
						patData={row}
                        
						labels={{
                            orderIdentificationCode:null,
							'patient.name': null,
							'patient.surname': null,
							'patient.personalIdentificationNumber': null,
							'patient.dateOfBirth':null,
                            'orderingUnit.name':v => v?v.toString().slice(0,30)+'...':null,
                            'orderDate':null,
							cretionTimeStamp: (v) =>getFormattedDateTime(v),
						}}
					>
                        <Link key={row.id} to={`details/${row.id}`} className="list-actions-button-details">Szczegóły</Link>
                        {checkPriviliges("SPECIFIC_DATABASE_USER",context.userRole)?
							<Link key={row.id} to={`edit/${row.id}`} className="list-actions-button-edit">Edytuj</Link>:''
						}
                    </PatientListTableRow>):<></>
				}
				</TableComponent>
        </>
				<PageSizeAndIndexComponent 
					totalPages={totalPages} 
					currentPage={currentPage}
					onPageClick={(page) => setCurrentPage(page)}
					onPageSizeSelection={(e) => {setPageSize(e.target.value);setCurrentPage(0)}}
					pageSizeArray={[25,50,250,500]}
				/>
				{checkPriviliges("SPECIFIC_DATABASE_USER",context.userRole)?	
					<p>
						<Link to="add" className="button-add">Dodaj zlecenie</Link>
					</p>:''
				}
			</>
		}
		</div>
	</main>
    )

}


const PatientOrderDataSearch = ({search,handleClick, handleChange}) => {
    const parent = useRef(null);
    const handleInput=()=>{
		const searchValue= _.cloneDeep(searchData);
		Object.entries(parent.current.childNodes).map((entry)=>{
			if(_.has(searchValue.ser,entry[1].name))
			_.set(searchValue.ser,entry[1].name,entry[1].value?entry[1].value:null);
		})
		searchValue.search=!search.search;
        console.log(searchValue);
		return searchValue;
	}

	return <Collapsible name="Wyszukaj">
				<form className="form" onSubmit={(e)=>{e.preventDefault();handleClick(handleInput());}}>
					<fieldset className="searchFieldset" ref={parent}>
					
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
						error={search.err.fromBirthDate}
						onChange={handleChange}
					/>
					
					<InputSearchForm
						label = "Data urodzenia do:"
						name = "dateOfBirthTo"
						type = "date"
						min="1900-01-01"
						max= {new Date().toJSON().split('T')[0]}
						error={search.err.toBirthDate}
						onChange={handleChange}
					/> 
				    <InputSearchForm
						label = "PESEL:"
						name = "personalIdentificationNumber"
						type = "text"
						error={search.err.personalIdentificationNumber}
						onChange={handleChange}
					/>
                    <InputSearchForm
						label = "Nr. zlecenia:"
						name = "orderIdentificationCode"
						type = "text"
						error={search.err.orderIdentificationCode}
						onChange={handleChange}
					/>
                    <InputSearchForm
						label = "Data zlecenia od:"
						name = "fromOrderDate"
						type = "date"
						min="1900-01-01"
						max= {new Date().toJSON().split('T')[0]}
						error={search.err.fromOrderDate}
						onChange={handleChange}
					/>	
					<InputSearchForm
						label = "Data zlecenia do:"
						name = "toOrderDate"
						type = "date"
						min="1900-01-01"
						max= {new Date().toJSON().split('T')[0]}
						error={search.err.toOrderDate}
						onChange={handleChange}
					/>
				
				<div className="form-buttons">
                    <input type="submit" className="form-button-submit" value="Szukaj"/>
                </div>
					</fieldset>
				</form>
			</Collapsible>
}