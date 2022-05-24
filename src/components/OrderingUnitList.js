import React from 'react'
import {Link} from 'react-router-dom'
import { getOrderingUnits } from '../apiCalls/OrderingUnitApiCalls';
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


export const searchData={
    search:false,
    err:{
        shortName: '',
        name: '',
        country: '',
        city: '',
        street: ''
        
    },
    ser:{
        name: null,
        shortName: null,
        country: null,
        city: null,
        street: null
        
    }
}

export default function OrderingUnits(){
	const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
	const [orderingUnits, setOrderingUnits] = useState([]);
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
            case ("shortName"): sort = {
				field: "SHORTNAME",
				direction: sortOrder.field!="SHORTNAME" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
			};
            break;
			case ("name"): sort = {
				field: "NAME",
				direction: sortOrder.field!="NAME" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
			}; 
			break;
			case ("country"): sort = {
				field: "COUNTRY",
				direction: sortOrder.field!="COUNTRY" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
			};
			break;
			case ("city"): sort = {
				field: "CITY",
				direction: sortOrder.field!="CITY" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
			};
            break;
            case ("street"): sort = {
				field: "STREET",
				direction: sortOrder.field!="STREET" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
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
		getOrderingUnits(context.userToken, currentPage, pageSize, sortOrder, search.ser)
		.then(res => {
			switch (res.status){
				case (200):{
                    setOrderingUnits(res.data.content);
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
					setOrderingUnits([]);
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
		<h2>Lista jednostek zlecających</h2>
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
                        shortName:"Nazwa skrocona",
                        name:"Pełna nazwa",
                        country:"Państwo",
                        city:"Miasto",
                        street:"Ulica",
						cretionTimeStamp: "Data utworzenia",
                        updateTimeStamp: "Data aktualizacji",
						actions: "Akcje"
					}}
					onTableHeaderClick={OnHeaderClick}
				>
				{orderingUnits!=null ? orderingUnits.map(row =>	
					<PatientListTableRow
						patData={row}
                        
						labels={{
							'shortName': null,
                            'name':null,
                            'address.country': null,
                            'address.city': null,
                            'address.street': null,
							cretionTimeStamp: (v) =>getFormattedDateTime(v),
                            updateTimeStamp: (v) =>getFormattedDateTime(v)

						}}
					>
                        <Link key={row.id} to={`details/${row.id}`} className="list-actions-button-details">Szczegóły</Link>
                        <Link key={row.id} to={`edit/${row.id}`} className="list-actions-button-edit">Edytuj</Link>
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
				<p>
					<Link to="add/" className="button-add">Dodaj nowego zlecającego</Link>
				</p>
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
						label = "Skrócona nazwa:"
						name = "shortName"
						type = "text"
						error={search.err.shortName}
						onChange={handleChange}
					/>	
					<InputSearchForm
						label = "Pełna nazwa:"
						name = "name"
						type = "text"
						error={search.err.name}
						onChange={handleChange}
					/>	
					<InputSearchForm
						label = "Kraj:"
						name = "country"
						type = "text"
						error={search.err.country}
						onChange={handleChange}
					/>
                    <InputSearchForm
						label = "Miasto:"
						name = "city"
						type = "text"
						error={search.err.city}
						onChange={handleChange}
					/>
                     <InputSearchForm
						label = "Ulica:"
						name = "street"
						type = "text"
						error={search.err.street}
						onChange={handleChange}
					/>
				
				<div className="form-buttons">
                    <input type="submit" className="form-button-submit" value="Szukaj"/>
                </div>
					</fieldset>
				</form>
			</Collapsible>
}