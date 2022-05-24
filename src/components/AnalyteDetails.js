import { useEffect, useContext, useState } from "react";
import { StateContext } from "../App";
import { PatientListTableRow } from "./others/TableComponent";
import { Link } from "react-router-dom";
import TableComponent from "./others/TableComponent";
import { getFormattedDateTime } from "./others/DateHelper";
import { useParams } from "react-router-dom";
import { DoingWork } from "./others/DoingWork";
import _ from "lodash";
import { getAnalyte } from "../apiCalls/AnalyteApiCalls";
import { checkPriviliges } from "./others/PriviligiesNamesConv";


export default function AnalyteDetails(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { anaId } = useParams();
    const [laboratoryTests, setLaboratoryTests] = useState([]);
    const [analyte, setAnalyte] = useState({
        ana: {}
    })

    const OnHeaderClick = () =>{
        console.log("kddkdk");
    }

    const  fetchAnalyte = async () => {
        return await getAnalyte(context.userToken, anaId)
        .then((res) => {
            switch (res.status){
                case (200):{	
				    setAnalyte({ana: res.data});
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    useEffect(()=>{
        fetchAnalyte().finally(() =>setIsLoaded(true));   
    },[]);

    return !isLoaded ?
    <DoingWork/>:
    <>
    <main>
        <div className="content">
            <h2>Szczegóły analitu</h2>
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
                        <p>{getFormattedDateTime(analyte.ana.cretionTimeStamp)}</p>
                        <p>{getFormattedDateTime(analyte.ana.updateTimeStamp)}</p>
                        <p>{analyte.ana.createdBy}</p>
                        <p>{analyte.ana.lastModifiedBy}</p>
                    </div>
                </div>
                <div className="details-content-box">
                    <DetailsRow key={analyte.id} label="Skrócona nazwa:" value={analyte.ana.shortName}/>
                    <DetailsRow key={analyte.id} label="Nazwa:" value={analyte.ana.name}/>
                    <DetailsRow key={analyte.id} label="Opis:" value={analyte.ana.description}/>
                </div>
            </div>
            
            <div className="page-buttons">
				{checkPriviliges("SPECIFIC_DATABASE_ADMIN",context.userRole)?
                    <Link to={`/lab/tenant/analytes/edit/${anaId}`} className="button-add">Edytuj</Link>:''
                }
                <Link to="/lab/tenant/analytes" className="button-return">Powrót</Link>
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
