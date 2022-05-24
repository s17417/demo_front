import React from 'react'
import {Link} from 'react-router-dom'
import { getPhisicians } from '../apiCalls/PhisiciansApiCalls';
import { useContext, useEffect, useMemo } from "react";
import {StateContext} from '../App';
import { useState, useRef } from 'react';
import { DoingWork } from './others/DoingWork';
import { getFormattedDateTime } from './others/DateHelper';
import PageSizeAndIndexComponent from './others/PageSizeAndIndexComponent';
import TableComponent from './others/TableComponent';
import { PatientListTableRow } from './others/TableComponent';
import { InputSearchForm, Option, Select } from './others/SerchBarComponents';
import Collapsible from './fragments/Collapsible';
import _ from 'lodash';
import { getAllLaboratoryTests, getLaboratoryTests } from '../apiCalls/LaboratoryTestApiCalls';
import { getSpecimentTypes } from '../apiCalls/SpecimentTypeApiCalls';
import { checkPriviliges } from './others/PriviligiesNamesConv';


export const searchData={
    search:false,
    err:{
        name: '',
        shortName:'',
        specimentTypeId:''
    },
    ser:{
        name: null,
        shortName: null,
        specimentTypeId:null
    }
}

export default function LaboratoryTestsList(){
	const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
	const [laboratoryTests, setLaboratoryTests] = useState([]);
	const [connectionError, setConnectionError] = useState("");
	const [totalPages, setTotalPages] = useState (1);
	const [currentPage,setCurrentPage] = useState(0);
	const [pageSize, setPageSize] = useState(25);
	const [sortOrder, setSortOrder] = useState({
		field: "NAME",
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
		getLaboratoryTests(context.userToken, currentPage, pageSize, sortOrder, search.ser)
		.then(res => {
			switch (res.status){
				case (200):{
                    console.log(res.data);
                    setLaboratoryTests(res.data.content);
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
					setLaboratoryTests([]);
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
		<h2>Lista testów</h2>
		{
		connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
			<>
				<LaboratoryTestDataSearch search={search} handleClick={handleClick} handleChange={handleChange}/>
				<>
                <TableComponent
					labelsArray={{
						shortName:"Skrócona nazwa",
						name:"Nazwa",
						specimentType: "Materiał",
						cretionTimeStamp: "Data utworzenia",
                        updateTimeStamp: "Data utworzenia",
						actions: "Akcje"
					}}
					onTableHeaderClick={OnHeaderClick}
				>
				{laboratoryTests!=null ? laboratoryTests.map(row =>	
					<PatientListTableRow
						patData={row}
                        
						labels={{
							'shortName': null,
							'name': null,
							'specimentType.speciment': null,
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
						<Link to="add/" className="button-add">Dodaj test</Link>
					</p>:''
				}
			</>
		}
		</div>
	</main>
    )

}


const LaboratoryTestDataSearch = ({search,handleClick, handleChange}) => {
    const context= useContext(StateContext);
    const [specimentTypes, setSpecimentTypes] = useState([]);
    const [connectionError, setConnectionError] = useState("");
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

    const fetchSpeciments = async () => {
        return await getSpecimentTypes(context.userToken)
        .then((res) => {
            switch (res.status){
                case (200):{
                    setSpecimentTypes(res.data);
                    setConnectionError("");
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
                    setSpecimentTypes([]);
					console.log(res.data);
                }
            }
        })
    }

    useEffect(()=>{fetchSpeciments()},[]);

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
						label = "Nazwa:"
						name = "name"
						type = "text"
						error={search.err.name}
						onChange={handleChange}
					/>

                    <Select
                        label = "Materiał:"
                        name = "specimentTypeId"
                        error={search.err.specimentTypeId}
                        onChange={handleChange}
                    >
                        <option selected label='Wybierz...' value={null}/>
                        {specimentTypes.map(obj => <Option label={obj.speciment} value={obj.id}/>)}
                    </Select>
                    {connectionError!="" ? 
                    <h4 className='errors-text'>
                        {`Couldn't retrieve data. ${connectionError}`}
                    </h4>:''}                 
				<div className="form-buttons">
                    <input type="submit" className="form-button-submit" value="Szukaj"/>
                </div>
					</fieldset>
				</form>
			</Collapsible>
}