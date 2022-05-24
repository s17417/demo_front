import { useEffect, useContext, useState } from "react";
import { addPatientComment, getPatient, getPatientComments, getPatientOrders } from "../apiCalls/PatientApiCalls";
import { StateContext } from "../App";
import { PatientListTableRow } from "./others/TableComponent";
import { Link } from "react-router-dom";
import TableComponent from "./others/TableComponent";
import { getFormattedDateTime } from "./others/DateHelper";
import { useParams } from "react-router-dom";
import { DoingWork } from "./others/DoingWork";
import { InputTextArea } from "./others/SerchBarComponents";
import GenericPopupForm from "./popups/AddComment";
import Collapsible from "./fragments/Collapsible";
import PageSizeAndIndexComponent from "./others/PageSizeAndIndexComponent";
import _ from "lodash";
import { checkPriviliges } from "./others/PriviligiesNamesConv";



export default function PatientDetails(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { patId } = useParams();
    const [newComment,setNewComment]=useState({
        comment:null,
        err:''
    })
    const [patientComments, setPatientComments] = useState([]);
    const [orders, setOrders] = useState([]);
    const [patient, setPatient] = useState({
        patId:patId,
        pat: {}
    })
    const [totalPages, setTotalPages] = useState (1);
	const [currentPage,setCurrentPage] = useState(0);
	const [pageSize, setPageSize] = useState(25);
	const [sortOrder, setSortOrder] = useState({
		field: "CREATION_DATE",
		direction: "DESC"
	})

    const [isOpen, setIsOpen]=useState(false);

    const OnHeaderClick = () =>{
        console.log("kddkdk");
    }

    const OnPopupAction = (e) =>{
        console.log(isOpen);
        if (e.target.id==='ok'){
            addComment();
        } else {
            setNewComment({
                comment:null,
                err:''
            });
        }
        return;
    }

    const  addComment = async() => {
        await addPatientComment(context.userToken,patId,newComment.comment)
        .then(res => {
			switch (res.status){
				case (201):{
                    setIsOpen(false);
                    setPatientComments([...patientComments,res.data])
				    setConnectionError("");
                    setNewComment({
                        comment:null,
                        err:''
                    });
				};
				break;
				case (422): {
                    setIsOpen(true);
                    const comment =  {...newComment};
					Object.keys(res.data.message)
					.map(key => {
                        _.set(comment, 'err', res.data.message[key]); 
					})
                    setNewComment(comment);
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${res.data.message}`:''}`);					
					console.log(res.data)
            
				}
			}
		})
    }

    const  fetchPatient = async () => {
        return await getPatient(context.userToken, patId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    const pat = {...patient};
                    pat.pat=res.data;	
				    setPatient(pat);
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const fetchPatientComments = async () =>{
        return await getPatientComments(context.userToken, patId)
        .then((res) => {
            switch (res.status){
                case (200):{	
				    setPatientComments(res.data);
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    const fetchOrders = async () => {
        return await getPatientOrders(context.userToken, currentPage, pageSize, sortOrder, patId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    console.log(res.data);
                    setOrders(res.data.content);
                    setTotalPages(res.data.totalPages);
                    setConnectionError("");
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
                    setOrders([]);
					console.log(res.data);
                }
            }
        })
    }

    useEffect(()=>{
        fetchPatient()
        fetchPatientComments()
        .finally(() =>setIsLoaded(true));
        
    },[]);

    useEffect(()=>{
        fetchOrders();
    },[currentPage,pageSize,sortOrder])


    return !isLoaded ?
    <DoingWork/>:
    <>
    <main>
        <div className="content">
            <h2>Szczegóły pacjenta</h2>
            {
		    connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
            <><div className="details-main-box">
                <div className="details-metadata-box">
                    <div>
                        <b>
                            <p>Dodano: </p>
                            <p>Zmodyfikowano: </p>
                            <p>Utworzył: </p>
                            <p>Zmodyfikował: </p>
                        </b>
                    </div>
                    <div>
                        <p>{getFormattedDateTime(patient.pat.cretionTimeStamp)}</p>
                        <p>{getFormattedDateTime(patient.pat.updateTimeStamp)}</p>
                        <p>{patient.pat.createdBy}</p>
                        <p>{patient.pat.lastModifiedBy}</p>
                    </div>
                </div>
                <div className="details-content-box">
                    <DetailsRow key={patient.id} label="Imię:" value={patient.pat.name}/>
                    <DetailsRow key={patient.id} label="Nazwisko:" value={patient.pat.surname}/>
                    <DetailsRow key={patient.id} label="Płeć:" value={patient.pat.gender}/>
                    <DetailsRow key={patient.id} label="Data Urodzenia:" value={patient.pat.dateOfBirth}/>
                    <DetailsRow key={patient.id} label="PESEL:" value={patient.pat.personalIdentificationNumber}/>
                </div>
            </div>    
            {patient.pat.addresses!=undefined ? patient.pat.addresses.filter(value=> value!=null).map((value,index) =><>
                <h2 key={index}>{`Adres ${index+1}:`}</h2>
                <div key={patient.id} className="details-main-box">
                    <div key={patient.id} className="details-content-box">
                        <DetailsRow key={patient.id} label="Państwo:" value={value.country}/>
                        <DetailsRow key={patient.id} label="Województwo:" value={value.state}/>
                        <DetailsRow key={patient.id} label="Miasto:" value={value.city}/>
                        <DetailsRow key={patient.id} label="Ulica:" value={value.street}/>
                        <DetailsRow key={patient.id} label="Kod pocztowy:" value={value.postalCode}/>
                    </div>
                </div>
            </>
            ):<></>}
            {patient.pat.phoneNumbers!=undefined && patient.pat.phoneNumbers.length>0 ?
                <h2>{`Dane kontaktowe:`}</h2>
                :<></>}
            {patient.pat.phoneNumbers!=undefined ? patient.pat.phoneNumbers.filter(value=> value!=null).map((value,index) =><>
                <div key={patient.id} className="details-main-box">
                    <div key={patient.id} className="details-content-box">
                        <DetailsRow key={patient.id} label="Kontakt:" value={value}/>
                    </div>
                </div>
            </>
            ):<></>}
            <Collapsible name="Komentarze:">
                {patientComments.length>0?<PatientComments comments={patientComments}/>:''}
                {checkPriviliges("SPECIFIC_DATABASE_USER",context.userRole)?
                    <GenericPopupForm
                        triggerClassName='popup-button'
                        name='Dodaj komentarz' 
                        okId="ok"
                        cancelId="return"
                        okName="Dodaj"
                        cancelName="Anuluj"
                        onPopupAction={OnPopupAction}
                        onPopupActionCloseTrigger={isOpen}
                        handleClose={()=>setIsOpen(false)}
                        handleOpen ={()=>setIsOpen(true)}
                    >
                    <form className="popup-form" onSubmit={e=> e.preventDefault()}>
                        <fieldset className="popup-searchFieldset" >
                        <InputTextArea
                            label = "Komentarz"
                            name = "comment" 
                            error={newComment.err}
                            maxLength={4096}
                            value={newComment.comment?newComment.comment:''}
                            onChange={(e)=>setNewComment(
                                e.target.value!=''?
                                {comment:e.target.value,err:''}:
                                {comment:null,err:''}
                                )
                            }
                        />
                        </fieldset>
                    </form>
                    </GenericPopupForm>:''
                }
            </Collapsible>
            <Collapsible name="Przypisane zlecenia:">
                {orders.length>0?<>
                    <TableComponent 
                        labelsArray={{
                            orderIdentificationCode: "Nr. zlecenia",
                            shortName: "Jednostka zlecająca",
                            orderDate: "Data zlecenia",
                            cretionTimeStamp:"Data Utworzenia",
                            updateTimeStamp:"Data aktualizacji"
                        }}
                        onTableHeaderClick={props.OnHeaderClick}
                        >
                        {orders.length>0 ? 
                            orders.map((order) =>
                            <PatientListTableRow key={order.id}
                                patData={order}
                                labels={{
                                    orderIdentificationCode: (v) =><Link to={`/lab/tenant/patientOrders/details/${order.id}`}>{v}</Link>,
                                    "orderingUnit.shortName": (v) =>v?<Link to={`/lab/tenant/orderingUnits/details/${order.orderingUnit.id}`}>{v}</Link>:'',
                                    orderDate: null,
                                    cretionTimeStamp: v=>getFormattedDateTime(v),
                                    updateTimeStamp: v=>getFormattedDateTime(v)
                                }}
                            />):
                            <></>
                        }
                    </TableComponent>
                    <PageSizeAndIndexComponent 
                        totalPages={totalPages} 
                        currentPage={currentPage}
                        onPageClick={(page) => setCurrentPage(page)}
                        onPageSizeSelection={(e) => {setPageSize(e.target.value);setCurrentPage(0)}}
                        pageSizeArray={[25,50,250,500]}
                    /></>:''
                }	
            </Collapsible>

            <div className="page-buttons">
                {checkPriviliges("SPECIFIC_DATABASE_USER",context.userRole)?
				    <Link to={`/lab/tenant/patients/edit/${patId}`} className="button-add">Edytuj</Link>:''
                }
                <Link to="/lab/tenant/patients" className="button-return">Powrót</Link>
            </div>
        </>}
        </div>
    </main>
    </>
}

function DetailsRow(props){
    return <>
        <div className='details-label'><p>{props.label}</p></div>
        <div className = 'details-value'><p>{props.value}</p></div>
    </>
}

function PatientComments(props) {
    const patientComments = props.comments;
    return <TableComponent 
    labelsArray={{
        cretionTimeStamp: "Data utworzenia",
        createdBy: "Utworzył",
        comment: "Komentarz"
    }}
    onTableHeaderClick={props.OnHeaderClick}
    >
       {patientComments.length>0 ? 
            patientComments.map((comment) =><PatientListTableRow key={comment.id}
                patData={comment}
                labels={{
                    cretionTimeStamp: (v) =>getFormattedDateTime(v),
                    createdBy: null,
                    comment: null
                }}
            />):<></>
        }
    </TableComponent>


}

function PatientOrders(props){
    const patientOrders = props.patientOrders;
    return <TableComponent 
    labelsArray={{
        orderIdentificationCode: "Nr. Zlecenia",
        orderingUnit:"Zlecający",
        phisician: "Lekarz",
        orderDate:"Data Zlecenia",
        cretionTimeStamp: "Data utworzenia"
        }}
    onTableHeaderClick={props.OnHeaderClick}
    />
}