import { useState, useContext, useEffect } from "react";
import { DoingWork } from "./others/DoingWork";
import { StateContext } from "../App";
import { InputSearchForm } from "./others/SerchBarComponents";
import _, { add, set } from "lodash";
import { addUpdatePhisicians } from "../apiCalls/PhisiciansApiCalls";
import { useNavigate, useParams } from "react-router-dom";
import formMode from "./others/FormMode";
import { getPhisician } from "../apiCalls/PhisiciansApiCalls";

export const phisicianData = {
    pat: {
        id:null,
        name:null,
        surname:null,
        personalIdentificationNumber:null,
    },
    err: {
        name:'',
        surname:'',
        personalIdentificationNumber:'',
    }
}

export default function PhisicianForm(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(true);
    const [post,setPost] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { phiId } = useParams();
    const navigate = useNavigate();
    const currentFormMode = phiId ? formMode.EDIT : formMode.NEW;
	const [phisician, setPhisician] = useState(_.cloneDeep(phisicianData));
    
    const handleClick = (e) =>{ 
        setPost(true);
        e.preventDefault();
    }

    const handleChange = (event) =>{
        const {name, value } = event.target
        const pat = _.cloneDeep(phisician.pat);
        const errors = _.cloneDeep(phisician.err);
        _.set(pat, name, value==''?null:value);
        _.set(errors, name,'');
        
        setPhisician({
            pat: pat,
            err: errors
        });
    }

    const  fetchList = async () => {	
        if (post==false) return;
		await addUpdatePhisicians(context.userToken, phisician.pat)
		.then(res => {
			switch (res.status){
                case (200):{
                    navigate(`/lab/tenant/phisicians/details/${res.data.id}`);
                };
                break;
				case (201):{
				    setPhisician(_.cloneDeep(phisicianData));
				    setConnectionError("");
                    navigate(`/lab/tenant/phisicians/details/${res.data.id}`);
				};
				break;
				case (422): {
                    const pat =  _.cloneDeep(phisician);
					Object.keys(res.data.message)
						.map(key => {
                            if (key!='1062')
                                _.set(pat.err, key, res.data.message[key]);
                            else {
                                console.log(JSON.stringify(res.data.message));
                                const reg= /(Phisician)([.])([aA-zZ]+)/gm;
                                const k=res.data.message[key].match(reg)[0].split('.')[1]; 
                                _.set(pat.err, k, res.data.message[key]);
                            }    
						})
                    setPhisician(pat);
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${res.data.message}`:''}`);					
					console.log(res.data)
				}
			}
		})
		.finally(() => {
            setPost(false);
		})
	}

    const fetchPhisician = async () => {
        return await getPhisician(context.userToken, phiId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    const p = _.cloneDeep(phisician);
                    p.pat=res.data;
                    setPhisician(p);
                    setIsLoaded(true);      
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

    useEffect(()=>{
        if (currentFormMode === formMode.EDIT) {fetchPhisician();}
    },[]);

    useEffect(()=>{if (post==true) fetchList()},[post])

    return !isLoaded ?
    <DoingWork/>:
    (
    <main>
        <div className="content">
		    <h2>Nowy lekarz</h2>
            {
		    connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
            <>
                <Form phisician={phisician} handleClick={handleClick} handleChange={handleChange} />
            </>
            }
        </div>
    </main>
    )

}

export function Form ({phisician, handleClick, handleChange}){
    return <>
        <form className="form" onSubmit={handleClick}>
			<fieldset className="searchFieldset">		
				<InputSearchForm
					label = "Imię:"
					name = "name"
					type = "text"
					error={phisician.err.name}
                    value={phisician.pat.name?phisician.pat.name:''}
					onChange={handleChange}
				/>	
				<InputSearchForm
					label = "Nazwisko:"
					name = "surname"
					type = "text"
					error={phisician.err.surname}
                    value={phisician.pat.surname?phisician.pat.surname:''}
					onChange={handleChange}
				/>
				<InputSearchForm
					label = "Nr. Prawa Wykonywania Zawodu:"
					name = "personalIdentificationNumber"
					type = "text"
					error={phisician.err.personalIdentificationNumber}
					value={phisician.pat.personalIdentificationNumber?phisician.pat.personalIdentificationNumber:''}
                    onChange={handleChange}
				/>
			</fieldset>
            <div className="form-buttons">
                <input type="submit" className="form-button-submit" value="Dodaj"/>
            </div>
		</form>
    </>
}