import React from 'react';
import { useState, useEffect} from 'react';
import { useRef } from 'react';
import Popup from 'reactjs-popup';
import { InputSearchForm } from '../others/SerchBarComponents';


export function GenericPopupDetails(props){
    return <Popup 
    
    trigger={props.trigger}
    position="top left"
    modal   
    closeOnDocumentClick
    on='click'
    >
    {close =>(
        <>
            <div>    
		        {props.children}    
            </div>
            <div className="popup-page-buttons">
                <button className='popup-button-return' onClick={close}>{props.cancelLabel}</button>
            </div>
        </>
    )}
    </Popup>
}

export default function GenericPopupForm(props){
    const parent = useRef(null);
    const [isOpen, setIsOpen]=useState(false);
    
    
    useEffect(()=>{
            setIsOpen(props.onPopupActionCloseTrigger);
        },
        [props.onPopupActionCloseTrigger]
    )


    return <Popup
    trigger={<button onFocusCapture={e =>{e.target.blur()}} onClick={(e)=> {e.currentTarget.blur();e.stopPropagation()}} className={props.triggerClassName?props.triggerClassName:'popup-button-add'}>{props.name}</button>}
    position="top left"
    modal
    closeOnDocumentClick={false}
    on='click'
    open={isOpen}
    onClose={props.handleClose}
    onOpen={props.handleOpen}
    >
        {close =>
        (<div>
            {/*<form className="popup-form" onSubmit={(e)=> e.preventDefault()}>
			    <fieldset className="popup-searchFieldset">*/}
				    {props.children}
                {/*</fieldset>
            </form>*/}
            <div className="popup-page-buttons">
                <button
                    name={props.okId}
                    id={props.okId}
                    onClick={(e)=>{if(props.onPopupAction)props.onPopupAction(e); e.preventDefault()}}
                    className='popup-button-add'
                >
                    {props.okName}
                </button>
                <button
                    name={props.returnId}
                    id={props.cancelId}
                    onClick={(e)=>{if(props.onPopupAction)props.onPopupAction(e);close()}}
                    className='popup-button-return'
                >
                    {props.cancelName}
                </button>
            </div>	    
        </div>)
    }
    </Popup>
}

export function GenericPopupFormWithoutButton(props){
    const parent = useRef(null);
    const [isOpen, setIsOpen]=useState(false);
    
    
    useEffect(()=>{
            setIsOpen(props.onPopupActionCloseTrigger);
        },
        [props.onPopupActionCloseTrigger]
    )


    return <Popup
    position="top left"
    modal
    closeOnDocumentClick={false}
    on='click'
    open={isOpen}
    onClose={props.handleClose}
    onOpen={props.handleOpen}
    >
        {close =>
        (<div>
            {/*<form className="popup-form" onSubmit={(e)=> e.preventDefault()}>
			    <fieldset className="popup-searchFieldset">*/}
				    {props.children}
                {/*</fieldset>
            </form>*/}
            <div className="popup-page-buttons">
                <button
                    name={props.okId}
                    id={props.okId}
                    onClick={(e)=>{if(props.onPopupAction)props.onPopupAction(e); e.preventDefault()}}
                    className='popup-button-add'
                >
                    {props.okName}
                </button>
                <button
                    name={props.returnId}
                    id={props.cancelId}
                    onClick={(e)=>{if(props.onPopupAction)props.onPopupAction(e);close()}}
                    className='popup-button-return'
                >
                    {props.cancelName}
                </button>
            </div>	    
        </div>)
    }
    </Popup>
}