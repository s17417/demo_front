import { useState, useContext, useEffect } from "react";
import { DoingWork } from "./others/DoingWork";
import { StateContext } from "../App";
import { InputSearchForm, Option, Select } from "./others/SerchBarComponents";
import { addUpdatePhisicians } from "../apiCalls/PhisiciansApiCalls";
import { useNavigate, useParams } from "react-router-dom";
import formMode from "./others/FormMode";
import { getPhisician } from "../apiCalls/PhisiciansApiCalls";
import { addUpdateLaboratoryTest, getLaboratoryTest } from "../apiCalls/LaboratoryTestApiCalls";
import _ from "lodash";
import { getSpecimentTypes } from "../apiCalls/SpecimentTypeApiCalls";

export const laboratoryTestData = {
    ltd: {
        id:null,
        name:null,
        shortName:null,
        description:null,
        specimentType:{
            id:null
        }
    },
    err: {
        name:'',
        shortName:'',
        description:'',
        specimentType:{
            id:''
        }
    }
}

export default function LaboratoryTestForm(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(true);
    const [post,setPost] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { ltdId } = useParams();
    const navigate = useNavigate();
    const currentFormMode = ltdId ? formMode.EDIT : formMode.NEW;
	const [laboratoryTest, setLaboratoryTest] = useState(_.cloneDeep(laboratoryTestData));

    const handleClick = (e) =>{ 
        setPost(true);
        e.preventDefault();
    }

    const handleChange = (event) =>{
        const {name, value } = event.target
        const ltd = _.cloneDeep(laboratoryTest.ltd);
        const errors = _.cloneDeep(laboratoryTest.err);
        _.set(ltd, name, value==''?null:value);
        _.set(errors, name,'');
        
        setLaboratoryTest({
            ltd: ltd,
            err: errors
        });
    }

    const  newLaboratoryTest = async () => {	
        if (post==false) return;
		await addUpdateLaboratoryTest(context.userToken, laboratoryTest.ltd)
		.then(res => {
			switch (res.status){
                case (200):{
                    navigate(`/lab/tenant/laboratoryTests/details/${res.data.id}`);
                };
                break;
				case (201):{
				    setLaboratoryTest(_.cloneDeep(laboratoryTestData));
				    setConnectionError("");
                    navigate(`/lab/tenant/laboratoryTests/details/${res.data.id}`);
				};
				break;
				case (422): {
                    const pat =  _.cloneDeep(laboratoryTest);
					Object.keys(res.data.message)
						.map(key => {
                            if (key!='1062')
                                _.set(pat.err, key, res.data.message[key]);
                            else {
                                console.log(JSON.stringify(res.data.message));
                                const reg= /(LaboratoryTest)([.])([aA-zZ]+)/gm;
                                const k=res.data.message[key].match(reg)[0].split('.')[1]; 
                                _.set(pat.err, k, res.data.message[key]);
                            }    
						})
                    setLaboratoryTest(pat);
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

    const fetchLaboratoryTest = async () => {
        return await getLaboratoryTest(context.userToken, ltdId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    const ltd = _.cloneDeep(laboratoryTest);
                    ltd.ltd=res.data;
                    setLaboratoryTest(ltd);
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
        if (currentFormMode === formMode.EDIT) {fetchLaboratoryTest();}
    },[]);

    useEffect(()=>{
        if (post==true) newLaboratoryTest();
    },[post])

    return !isLoaded ?
    <DoingWork/>:
    (
    <main>
        <div className="content">
		    <h2>Nowy test laboratoryjny</h2>
            {
		    connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
            <>
                <Form currentFormMode={currentFormMode} laboratoryTest={laboratoryTest} handleClick={handleClick} handleChange={handleChange} />
            </>
            }
        </div>
    </main>
    )

}

export function Form ({currentFormMode, laboratoryTest, handleClick, handleChange}){
    const [specimentTypes, setSpecimentTypes] = useState([]);
    const context= useContext(StateContext);

    const fetchSpeciments = async () => {
        return await getSpecimentTypes(context.userToken)
        .then((res) => {
            switch (res.status){
                case (200):{
                    setSpecimentTypes(res.data.filter(obj => obj.isActive==true));
                }
                break;
				default: {
                    setSpecimentTypes([]);
					console.log(res.data);
                }
            }
        })
    }

    useEffect(()=>fetchSpeciments(),[])
    return <>
        <form className="form" onSubmit={handleClick}>
			<fieldset className="searchFieldset">		
				<InputSearchForm
					label = "Skrócona nazwa:"
					name = "shortName"
					type = "text"
					error={laboratoryTest.err.shortName}
                    value={laboratoryTest.ltd.shortName?laboratoryTest.ltd.shortName:''}
					onChange={handleChange}
				/>	
				<InputSearchForm
					label = "Nazwa: "
					name = "name"
					type = "text"
					error={laboratoryTest.err.name}
                    value={laboratoryTest.ltd.name?laboratoryTest.ltd.name:''}
					onChange={handleChange}
				/>
				<InputSearchForm
					label = "Opis:"
					name = "description"
					type = "text"
					error={laboratoryTest.err.description}
					value={laboratoryTest.ltd.description?laboratoryTest.ltd.description:''}
                    onChange={handleChange}
				/>
                <Select
                    disabled={currentFormMode===formMode.EDIT}
                    label = "Materiał:"
                    name = "specimentType.id"
                    size={6}
                    multiply={true}
                    error={laboratoryTest.err.specimentType.id}
                    value={laboratoryTest.ltd.specimentType.id}
                    onChange={handleChange}
                >
                    <option hidden selected disabled label='Wybierz...' value={null}/>
                    {specimentTypes.map(obj => <Option label={obj.speciment} value={obj.id}/>)}
                </Select>

			</fieldset>
            <div className="form-buttons">
                <input type="submit" className="form-button-submit" value="Dodaj"/>
            </div>
		</form>
    </>
}