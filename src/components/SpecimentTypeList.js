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
import { getAnalytes } from '../apiCalls/AnalyteApiCalls';
import { checkPriviliges } from './others/PriviligiesNamesConv';
import { addUpdateSpeciment, deleteSpecimentCall, getSpecimentTypes } from '../apiCalls/SpecimentTypeApiCalls';
import GenericPopupForm from './popups/AddComment';
import _ from 'lodash';

const specimentData = {
    spc:{
        id:null,
        speciment:null
    },
    err:{
        speciment:''
    }
}

export default function SpecimentTypeList(){
	const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(false);
	const [specimentTypes, setSpecimentTypes] = useState([]);
	const [connectionError, setConnectionError] = useState("");
	const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState ();
    const [newSpeciment, setNewSpeciment] = useState(_.cloneDeep(specimentData));

    const handleChange = (event) =>{
        const {name, value } = event.target
        const spc = _.cloneDeep(newSpeciment);
        _.set(spc, `spc.${name}`, value==''?null:value);
        _.set(spc, `err.${name}`,'');
        
        setNewSpeciment(spc);
        console.log(spc);
    }

    const OnPopupAction = (e) =>{
        if (e.target.id==='ok'){
            createUpdateSpeciment();
        } else {
            setNewSpeciment(_.cloneDeep(specimentData));
        }
        return;
    }

    const  createUpdateSpeciment = async () => {
		await addUpdateSpeciment(context.userToken, newSpeciment.spc)
		.then(res => {
			switch (res.status){
                case (200):{
                    setNewSpeciment(_.cloneDeep(specimentData))
                    const t=_.cloneDeep(specimentTypes);
                    t[specimentTypes.findIndex(obj=> obj.id==res.data.id)]=res.data;
                    setSpecimentTypes(t);
                    setIsOpen(false);
				    setConnectionError("");
                };
                break;
				case (201):{
                    setNewSpeciment(_.cloneDeep(specimentData))
                    setIsOpen(false);
                    const t=_.cloneDeep(specimentTypes);
                    t.unshift(res.data);
                    setSpecimentTypes(t);
				    setConnectionError("");
				};
				break;
				case (422): {
                    const spc =  _.cloneDeep(newSpeciment);
					Object.keys(res.data.message)
						.map(key => {
                            _.set(spc.err, key, res.data.message[key]);   
						})
                    setNewSpeciment(spc);
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${res.data.message}`:''}`);					
					console.log(res.data)
				}
			}
		});
	}

    const deleteSpeciment = async (specimentTypeId) => {
        return await deleteSpecimentCall(context.userToken, specimentTypeId)
        .then((res) => {
            switch (res.status){
                case (204):{
                    setSpecimentTypes(specimentTypes.filter(obj => obj.id!==specimentTypeId));
                }
                break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);					
				}
            }
        })
    }

	const fetchSpecimentTypes = () => {
		getSpecimentTypes(context.userToken)
		.then(res => {
			switch (res.status){
				case (200):{
                    console.log(res.data);
                    setSpecimentTypes(res.data);
                    setConnectionError("");
				};
				break;
				default: {
					setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${JSON.stringify(res.data.message)}`:''}`);
					setSpecimentTypes([]);
					console.log(res.data);
				}
			}
		})
		.finally(() => {
			setIsLoaded(true)
		});	
	}

	useEffect(() =>{fetchSpecimentTypes()},[]);

    return !isLoaded ?
		<DoingWork/>:
		(
        <main>
    	<div className="content">
		<h2>Lista rodzaju materiałów</h2>
		{
		connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
			<>
                <TableComponent
					labelsArray={{
						speciement:"Nazwa:",
						actions: "Akcje"
					}}
					onTableHeaderClick={()=>{}}
				>
				{specimentTypes!=null&&specimentTypes.length>0 ? specimentTypes.filter(obj => obj.isActive).map(row =>	
					
                    <PatientListTableRow
						patData={row}
						labels={{
							'speciment': null,

						}}
					>
                        {checkPriviliges("SPECIFIC_DATABASE_ADMIN",context.userRole)?
                            <button key={row.id} onClick={()=>deleteSpeciment(row.id)} className="list-actions-button-details">Usuń</button>:''
                        }
                        {checkPriviliges("SPECIFIC_DATABASE_ADMIN",context.userRole)?
							<button key={row.id} onClick={()=>{const t=_.cloneDeep(newSpeciment);t.spc=row;setNewSpeciment(t);setIsOpen(true);}} className="list-actions-button-edit">Edytuj</button>:''
						}
                    </PatientListTableRow>):<></>
				}
				</TableComponent>
				
				
			</>
		}
        {checkPriviliges("SPECIFIC_DATABASE_ADMIN",context.userRole)?

        <GenericPopupForm
        triggerClassName='popup-button'
        name='Dodaj' 
        okId="ok"
        cancelId="return"
        okName="Dodaj"
        cancelName="Anuluj"
        onPopupAction={OnPopupAction}
        onPopupActionCloseTrigger={isOpen}
        handleClose={()=>setIsOpen(false)}
        handleOpen ={()=>setIsOpen(true)}>
        <form className="popup-form" onSubmit={e=> e.preventDefault()}>
            <fieldset className="popup-searchFieldset" >
            <InputSearchForm
                label = "Nazwa:"
                type='text'
                name='speciment'
                error={newSpeciment.err.speciment}
                value={newSpeciment.spc.speciment?newSpeciment.spc.speciment:''}
                onChange={handleChange}
            />
            </fieldset>
        </form>
        </GenericPopupForm>:''
        }
		</div>
	</main>
    )

}

