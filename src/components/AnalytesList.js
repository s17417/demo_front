import React from 'react'
import {Link} from 'react-router-dom'
import { getPhisicians } from '../apiCalls/PhisiciansApiCalls';
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
import { getAnalytes } from '../apiCalls/AnalyteApiCalls';
import { checkPriviliges } from './others/PriviligiesNamesConv';


export const searchData={
    search:false,
    err:{
        name: '',
        shortName:''
    },
    ser:{
        name: null,
        shortName: null
    }
}

export default function AnalytesList(){
	const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
	const [analytes, setAnalytes] = useState([]);
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
			case ("shortName"): sort = {
				field: "SHORTNAME",
				direction: sortOrder.field!="SHORTNAME" ? "ASC": sortOrder.direction=="ASC" ? "DESC":"ASC"
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
		getAnalytes(context.userToken, currentPage, pageSize, sortOrder, search.ser)()
		.then(res => {
			switch (res.status){
				case (200):{
                    console.log(res.data);
                    setAnalytes(res.data.content);
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
					setAnalytes([]);
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
		<h2>Lista analitów</h2>
		{
		connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
			<>
				<AnalyteDataSearch search={search} handleClick={handleClick} handleChange={handleChange}/>
				<>
                <TableComponent
					labelsArray={{
						shortName:"Skrócona nazwa:",
						name:"Nazwa",
						cretionTimeStamp: "Data utworzenia",
                        updateTimeStamp: "Data utworzenia",
						actions: "Akcje"
					}}
					onTableHeaderClick={OnHeaderClick}
				>
				{analytes!=null&&analytes.length>0 ? analytes.map(row =>	
					
                    <PatientListTableRow
						patData={row}
                        
						labels={{
							'shortName': null,
							'name': null,
							cretionTimeStamp: (v) =>getFormattedDateTime(v),
                            updateTimeStamp: (v) =>getFormattedDateTime(v)

						}}
					>
                        <Link key={row.id} to={`details/${row.id}`} className="list-actions-button-details">Szczegóły</Link>
                        {checkPriviliges("SPECIFIC_DATABASE_ADMIN",context.userRole)?
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
				{checkPriviliges("SPECIFIC_DATABASE_ADMIN",context.userRole)?
					<p>
						<Link to="add/" className="button-add">Dodaj nowy analit</Link>
					</p>
				:''
				}
			</>
		}
		</div>
	</main>
    )

}


const AnalyteDataSearch = ({search,handleClick, handleChange}) => {
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
						label = "Nzawa:"
						name = "name"
						type = "text"
						error={search.err.name}
						onChange={handleChange}
					/>
				<div className="form-buttons">
                    <input type="submit" className="form-button-submit" value="Szukaj"/>
                </div>
					</fieldset>
				</form>
			</Collapsible>
}