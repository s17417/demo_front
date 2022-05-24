import { useState } from "react/cjs/react.production.min";
import { InputTextArea, Option, Select } from "./SerchBarComponents";



export function QuantitativeInput(props){
    const className = props.error === '' ? '' : 'error-input'
    const name = props.name
    const errorSpanId = 'error' + name[0].toUpperCase() + name.slice(1)
    const method = props.method;

    return <>
    <label htmlFor={props.name}>
        {props.label}<sub>{method.units}</sub>
    </label>
    <input
        onKeyDownCapture={(e)=>{if (e.key==='ArrowUp'||e.key==='ArrowDown') e.preventDefault();}}
        formNoValidate={true}
        autoComplete={props.autoComplete}
        disabled={props.disabled}
        list={props.list}
        ref={props.referential}
        type={'number'}
        className={className}
        name={props.name}
        min={props.min}
        max={props.max}
        group={props.group}
        id={props.name}
        placeholder={props.placeholder}
        value={props.value}
        onKeyDown={props.onKeyDown}       
        onChange={props.onChange}/>
    
        <span id={errorSpanId} className="errors-text">{props.error}</span>   
    </>
}

export function QualitativeInput(props){
    const className = props.error === '' ? '' : 'error-input'
    const name = props.name
    const errorSpanId = 'error' + name[0].toUpperCase() + name.slice(1)
    const method = props.method;

    return <>
     <Select
            label = {props.label}
            style={{borderBottom:"none"}}
            name = {props.selectName}  
            type = 'text'
            error = ''
            value ={''}
            onChange={props.onChange}
        >
            <option selected disabled label='Wybierz...' value={null}/>
            {method.resultTemplates?method.resultTemplates.map(obj => <Option label={obj.length>50?obj.slice(0,50)+'...':obj} value={obj}/>):''}
            
        </Select>   
    <InputTextArea
        rows={4}
        autoComplete={props.autoComplete}
        disabled={props.disabled}
        list={props.list}
        ref={props.referential}
        type={'text'}
        className={className}
        name={props.name}
        min={props.min}
        max={props.max}
        group={props.group}
        id={props.name}
        placeholder={props.placeholder}
        value={props.value}
        onKeyDown={props.onKeyDown}       
        onChange={props.onChange}/>
        <span   id={errorSpanId} className="errors-text">{props.error}</span>   
    </>
}


export function QuantitativeControlInput(props){
    const className = props.error === '' ? '' : 'error-input'
    const name = props.name
    const errorSpanId = 'error' + name[0].toUpperCase() + name.slice(1)
    const method = props.method;

    return <>
    <label htmlFor={props.name}>
        {props.label}<sub>{method.units}</sub>
    </label>
    <input
        onKeyDownCapture={(e)=>{if (e.key==='ArrowUp'||e.key==='ArrowDown') e.preventDefault();}}
        formNoValidate={true}
        autoComplete={props.autoComplete}
        disabled={props.disabled}
        list={props.list}
        ref={props.referential}
        type={'number'}
        className={className}
        name={props.name}
        min={props.min}
        max={props.max}
        group={props.group}
        id={props.name}
        placeholder={props.placeholder}
        value={props.value}
        onKeyDown={props.onKeyDown}       
        onChange={props.onChange}/>
    
        <span id={errorSpanId} className="errors-text">{props.error}</span>   
    </>
}

export function QualitativeControlInput(props){
    const className = props.error === '' ? '' : 'error-input'
    const name = props.name
    const errorSpanId = 'error' + name[0].toUpperCase() + name.slice(1)
    const method = props.method;

    return <>
     <Select
            label = {props.label}
            style={{borderBottom:"none"}}
            name = {props.selectName}  
            type = 'text'
            error = ''
            value ={''}
            onChange={props.onChange}
        >
            <option selected disabled label='Wybierz...' value={null}/>
            {method.resultTemplates?method.resultTemplates.map(obj => <Option label={obj.length>50?obj.slice(0,50)+'...':obj} value={obj}/>):''}
            
        </Select>   
    <InputTextArea
        rows={4}
        autoComplete={props.autoComplete}
        disabled={props.disabled}
        list={props.list}
        ref={props.referential}
        type={'text'}
        className={className}
        name={props.name}
        min={props.min}
        max={props.max}
        group={props.group}
        id={props.name}
        placeholder={props.placeholder}
        value={props.value}
        onKeyDown={props.onKeyDown}       
        onChange={props.onChange}/>
        <span   id={errorSpanId} className="errors-text">{props.error}</span>   
    </>
}