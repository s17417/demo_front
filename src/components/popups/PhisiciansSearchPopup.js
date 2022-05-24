import { InputSearchForm } from "../others/SerchBarComponents"
import Collapsible from "../fragments/Collapsible"
import { useState, useContext, useEffect, useRef } from "react"
import { StateContext } from "../../App"
import TableComponent from "../others/TableComponent"
import { PatientListTableRow } from "../others/TableComponent"
import { getFormattedDateTime } from "../others/DateHelper"
import PageSizeAndIndexComponent from "../others/PageSizeAndIndexComponent"
import _ from "lodash"
import { searchData } from "../PhisicianList"
import { getPhisicians } from "../../apiCalls/PhisiciansApiCalls"
import { phisicianData } from "../PhisicianForm"

export function PhisiciansSearchPopup(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
	const [phisicians, setPhisicians] = useState([]);
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

    const handleClick = (e) =>{
		e.preventDefault();
		const searchValue = _.cloneDeep(searchData);
		Object.entries(parent.current.childNodes).map((entry)=>{
			if(_.has(searchValue.ser,entry[1].name))
			_.set(searchValue.ser,entry[1].name,entry[1].value?entry[1].value:null);
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
		getPhisicians(context.userToken, currentPage, pageSize, sortOrder, search.ser)()
		.then(res => {
			switch (res.status){
				case (200):{
				setPhisicians(res.data.content);
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
					setPhisicians([]);
					console.log(res.data)
				}
			}
		})
	}

    useEffect(() =>{fetchList()},[currentPage,sortOrder, search.search]);

    useEffect(() =>{
        if (isLoaded==true && actualRow!=null){
            const phi = _.cloneDeep(phisicianData);
            phi.pat=actualRow;
            props.getAdd(phi);
            props.handleVisibility(false);
        }
        setIsLoaded(true);
    },[props.retriveObject])
    return <div>
        <Collapsible name="Wyszukaj">
			<form className="popup-form" onKeyDown={(e)=>{if(e.code==="Enter")handleClick(e)}}  onSubmit={e=> {e.preventDefault()}}>
					<fieldset className="popup-searchFieldset" ref={parent}>
					<InputSearchForm
						label = "Nazwisko:"
						name = "surname"
						type = "text"
						error={search.err.surname}
						onChange={handleChange}
					/>	
					<InputSearchForm
						label = "Imię:"
						name = "name"
						type = "text"
						error={search.err.name}
						onChange={handleChange}
					/>	
					<InputSearchForm
						label = "Nr. PWZ:"
						name = "personalIdentificationNumber"
						type = "text"
						error={search.err.personalIdentificationNumber}
						onChange={handleChange}
					/>
					</fieldset>
                    <div className="form-buttons">
                        <input type="submit" onClick={handleClick} className="form-button-submit" value="Szukaj"/>
                    </div>
				</form>
		</Collapsible>
		{connectionError?<h4 className='errors-text'>
		{`Couldn't retrieve data. ${connectionError}`}
		</h4>:''}
            <TableComponent
					labelsArray={{
                        surname:"Nazwisko",
                        name:"Imię",
                        personalIdentificationNumber:"Nr. PWZ",
						cretionTimeStamp: "Data utworzenia",
                        updateTimeStamp: "Data aktualizacji"
					}}
					onTableHeaderClick={OnHeaderClick}
			>
                {phisicians!=null ? phisicians.map(row =>
                	
					<PatientListTableRow
                        onRowClick={onRowClick}
						patData={row}
						labels={{
							'surname': null,
                            'name':null,
                            'personalIdentificationNumber': null,
							cretionTimeStamp: (v) =>getFormattedDateTime(v),
                            updateTimeStamp: (v) =>getFormattedDateTime(v)
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