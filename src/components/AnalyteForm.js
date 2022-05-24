import { useState, useContext, useEffect } from "react";
import { DoingWork } from "./others/DoingWork";
import { StateContext } from "../App";
import { InputSearchForm, InputTextArea } from "./others/SerchBarComponents";
import { addUpdatePhisicians } from "../apiCalls/PhisiciansApiCalls";
import { useNavigate, useParams } from "react-router-dom";
import formMode from "./others/FormMode";
import { getPhisician } from "../apiCalls/PhisiciansApiCalls";
import { addUpdateAnalyte, getAnalyte } from "../apiCalls/AnalyteApiCalls";
import _ from "lodash";

export const analyteData = {
    ana: {
        id:null,
        name:null,
        shortName:null,
        description:null
    },
    err: {
        name:'',
        shortName:'',
        description:''
    }
}

export default function AnalyteForm(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(true);
    const [post,setPost] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { anaId } = useParams();
    const navigate = useNavigate();
    const currentFormMode = anaId ? formMode.EDIT : formMode.NEW;
	const [analyte, setAnalyte] = useState(_.cloneDeep(analyteData));
    
    const handleClick = (e) =>{ 
        setPost(true);
        e.preventDefault();
    }

    const handleChange = (event) =>{
        const {name, value } = event.target
        const ana = _.cloneDeep(analyte.ana);
        const errors = _.cloneDeep(analyte.err);
        _.set(ana, name, value==''?null:value);
        _.set(errors, name,'');
        
        setAnalyte({
            ana: ana,
            err: errors
        });
    }

    const  createUpdateAnalyte = async () => {	
        if (post==false) return;
		await addUpdateAnalyte(context.userToken, analyte.ana)
		.then(res => {
			switch (res.status){
                case (200):{
                    navigate(`/lab/tenant/analytes/details/${res.data.id}`);
                };
                break;
				case (201):{
				    setAnalyte(_.cloneDeep(analyteData));
				    setConnectionError("");
                    navigate(`/lab/tenant/analytes/details/${res.data.id}`);
				};
				break;
				case (422): {
                    const ana =  _.cloneDeep(analyte);
					Object.keys(res.data.message)
						.map(key => {
                            if (key!='1062')
                                _.set(ana.err, key, res.data.message[key]);
                            else {
                                console.log(JSON.stringify(res.data.message));
                                const reg= /(Analyte)([.])([aA-zZ]+)/gm;
                                const k=res.data.message[key].match(reg)[0].split('.')[1]; 
                                _.set(ana.err, k, res.data.message[key]);
                            }    
						})
                    setAnalyte(ana);
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

    const fetchAnalyte = async () => {
        return await getAnalyte(context.userToken, anaId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    console.log(res.data);
                    const p = _.cloneDeep(analyte);
                    p.ana=res.data;
                    setAnalyte(p);
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
        if (currentFormMode === formMode.EDIT) {fetchAnalyte();}
    },[]);

    useEffect(()=>{if (post==true) createUpdateAnalyte()},[post])

    return !isLoaded ?
    <DoingWork/>:
    (
    <main>
        <div className="content">
		    <h2>Nowy analit</h2>
            {
		    connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
            <>
                <Form analyte={analyte} handleClick={handleClick} handleChange={handleChange} />
            </>
            }
        </div>
    </main>
    )

}

export function Form ({analyte, handleClick, handleChange}){
    return <>
        <form className="form" onSubmit={handleClick}>
			<fieldset className="searchFieldset">		
				<InputSearchForm
					label = "Nazwa:"
					name = "name"
					type = "text"
					error={analyte.err.name}
                    value={analyte.ana.name?analyte.ana.name:''}
					onChange={handleChange}
				/>	
				<InputSearchForm
					label = "Skrócon Nazwa:"
					name = "shortName"
					type = "text"
					error={analyte.err.shortName}
                    value={analyte.ana.shortName?analyte.ana.shortName:''}
					onChange={handleChange}
				/>
				<InputTextArea
					label = "Opis:"
					name = "description"
					type = "text"
					error={analyte.err.description}
					value={analyte.ana.description?analyte.ana.description:''}
                    onChange={handleChange}
				/>
			</fieldset>
            <div className="form-buttons">
                <input type="submit" className="form-button-submit" value="Dodaj"/>
            </div>
		</form>
    </>
}