import { useState, useContext, useEffect } from "react";
import { DoingWork } from "./others/DoingWork";
import { StateContext } from "../App";
import { InputSearchForm, InputTextArea } from "./others/SerchBarComponents";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import formMode from "./others/FormMode";
import { addUpdateOrderingUnit, getOrderingUnit } from "../apiCalls/OrderingUnitApiCalls";

export const orderingUnitData = {
    pat: {
        id:null,
        shortName:null,
        name:null,
        address:{
            country: null,
            state: null,
            city: null,
            street: null,
            postalCode: null
        }
    },
    err: {
        shortName:'',
        name:'',
        address:{
            country: '',
            state: '',
            city: '',
            street: '',
            postalCode: ''
        }
    }
}

export default function OrderingUnitForm(props){
    const context= useContext(StateContext);
	const [isLoaded, setIsLoaded] = useState(true);
    const [post,setPost] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const { ordId } = useParams();
    const navigate = useNavigate();
    const currentFormMode = ordId ? formMode.EDIT : formMode.NEW;
	const [orderingUnit, setOrderingUnit] = useState(_.cloneDeep(orderingUnitData));
    
    const handleClick = (e) =>{ 
        setPost(true);
        e.preventDefault();
    }

    const handleChange = (event) =>{
        const {name, value } = event.target
        const ord = _.cloneDeep(orderingUnit);
        _.set(ord.pat, name, value==''?null:value);
        _.set(ord.err, name,'');
        setOrderingUnit(ord);
    }

    const  create = async () => {	
        if (post==false) return;
		await addUpdateOrderingUnit(context.userToken, orderingUnit.pat)
		.then(res => {
			switch (res.status){
                case (200):{
                    navigate(`/lab/tenant/orderingUnits/details/${ordId}`);
                };
                break;
				case (201):{
				    //setOrderingUnit(_.cloneDeep(orderingUnitData));
				    setConnectionError("");
                    navigate(`/lab/tenant/orderingUnits/details/${ordId}`);
				};
				break;
				case (422): {
                    const ord =  _.cloneDeep(orderingUnit);
					Object.keys(res.data.message)
						.map(key => {
                            if (key!='1062')
                                _.set(ord.err, key, res.data.message[key]);
                            else {
                                console.log(JSON.stringify(res.data.message));
                                const reg= /(OrderingUnit)([.])([aA-zZ]+)/gm;
                                const k=res.data.message[key].match(reg)[0].split('.')[1]; 
                                _.set(ord.err, k, res.data.message[key]);
                            }    
						})
                    setOrderingUnit(ord);
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

    const fetchOrderingUnit = async () => {
        return await getOrderingUnit(context.userToken, ordId)
        .then((res) => {
            switch (res.status){
                case (200):{
                    const ord = _.cloneDeep(orderingUnit);
                    ord.pat=res.data;
                    setOrderingUnit(ord);
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
        if (currentFormMode === formMode.EDIT) {fetchOrderingUnit();}
    },[]);

    useEffect(()=>{if (post==true) create()},[post])

    return !isLoaded ?
    <DoingWork/>:
    (
    <main>
        <div className="content">
		    <h2>Nowa jednostka zlecająca</h2>
            {
		    connectionError!="" ? 
			<h4 className='errors-text'>
				{`Couldn't retrieve data. ${connectionError}`}
			</h4>:
            <>
                <Form orderingUnit={orderingUnit} handleClick={handleClick} handleChange={handleChange} />
            </>
            }
        </div>
    </main>
    )

}

export function Form ({orderingUnit, handleClick, handleChange}){
    return <>
        <form className="form" onSubmit={handleClick}>
			<fieldset className="searchFieldset">	
                <InputSearchForm
					label = "Skrócona nazwa:"
					name = "shortName"
					type = "text"
					error={orderingUnit.err.shortName}
                    value={orderingUnit.pat.shortName?orderingUnit.pat.shortName:''}
					onChange={handleChange}
				/>	
				<InputTextArea
                    rows ={4}
                    maxLength={255}
					label = "Pełna nazwa:"
					name = "name"
					type = "text"
					error={orderingUnit.err.name}
                    value={orderingUnit.pat.name?orderingUnit.pat.name:''}
					onChange={handleChange}
				/>	
				<InputSearchForm
					label = "Państwo:"
					name = "address.country"
					type = "text"
					error={orderingUnit.err.address.country}
                    value={orderingUnit.pat.address.country?orderingUnit.pat.address.country:''}
					onChange={handleChange}
				/>
                <InputSearchForm
					label = "Miasto:"
					name = "address.city"
					type = "text"
					error={orderingUnit.err.address.city}
                    value={orderingUnit.pat.address.city?orderingUnit.pat.address.city:''}
					onChange={handleChange}
				/>
                <InputSearchForm
					label = "Ulica:"
					name = "address.street"
					type = "text"
					error={orderingUnit.err.address.street}
                    value={orderingUnit.pat.address.street?orderingUnit.pat.address.street:''}
					onChange={handleChange}
				/>
                  <InputSearchForm
					label = "Kod Pocztowy:"
					name = "address.postalCode"
					type = "text"
					error={orderingUnit.err.address.postalCode}
                    value={orderingUnit.pat.address.postalCode?orderingUnit.pat.address.postalCode:''}
					onChange={handleChange}
				/>
				
			</fieldset>
            <div className="form-buttons">
                <input type="submit" className="form-button-submit" value="Dodaj"/>
            </div>
		</form>
    </>
}