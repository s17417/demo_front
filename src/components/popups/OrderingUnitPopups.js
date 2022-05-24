import { InputSearchForm } from "../others/SerchBarComponents"
import Collapsible from "../fragments/Collapsible"
import { useState, useContext, useEffect, useRef } from "react"
import { StateContext } from "../../App"
import TableComponent from "../others/TableComponent"
import { PatientListTableRow } from "../others/TableComponent"
import { getFormattedDateTime } from "../others/DateHelper"
import { getPatients, addUpdatePatients } from "../../apiCalls/PatientApiCalls"
import PageSizeAndIndexComponent from "../others/PageSizeAndIndexComponent"
import _ from "lodash"
import { getOrderingUnits } from "../../apiCalls/OrderingUnitApiCalls"
import { searchData } from "../OrderingUnitList"
import { orderingUnitData } from "../OrderingUnitForm"

export function OrderingUnitSearchPopup(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
	const [orderingUnits, setOrderingUnits] = useState([]);
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
		console.log(search);
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
					console.log(ser);
				}
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${res.data.message}`:''}`);
					setOrderingUnits([]);
					console.log(res.data)
				}
			}
		})
	}

    useEffect(() =>{fetchList()},[currentPage,sortOrder,/*searchClick*/, search.search]);

    useEffect(() =>{
        if (isLoaded==true && actualRow!=null){
            const ord = _.cloneDeep(orderingUnitData);
            ord.pat=actualRow;
            props.getAdd(ord);
            props.handleVisibility(false);
        }
        setIsLoaded(true);
    },[props.retriveObject])
    return <div>
        {connectionError?<h4 className='errors-text'>
		{`Couldn't retrieve data. ${connectionError}`}
	</h4>:''}
            <Collapsible name="Wyszukaj">
				<form className="popup-form" onSubmit={e=> e.preventDefault()}>
					<fieldset className="popup-searchFieldset" ref={parent}>
					
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
                    <input type="submit" onClick={handleClick} className="form-button-submit" value="Szukaj"/>
                </div>
					</fieldset>
				</form>
			</Collapsible>
            <TableComponent
					labelsArray={{
                        shortName:"Nazwa skrocona",
                        name:"Pełna nazwa",
                        country:"Państwo",
                        city:"Miasto",
                        street:"Ulica",
						cretionTimeStamp: "Data utworzenia",
                        updateTimeStamp: "Data aktualizacji"
					}}
					onTableHeaderClick={OnHeaderClick}
			>
                {orderingUnits!=null ? orderingUnits.map(row =>
                	
					<PatientListTableRow
                        onRowClick={onRowClick}
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