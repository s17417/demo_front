import { words } from "lodash";

export function DetailsRow(props) {
    return <>
        <div className='details-label'><p>{props.label}{props.labelSubs}</p></div>
        <div className='details-value'><p>{props.value ? props.value : ''}{props.value?props.valueSubs:''}</p></div>
    </>;
}

export function DetailsRowRefferential(props) {
    return <>
        <div className='details-label'><p>{props.label}{props.labelSubs}</p></div>
        <div className='details-refferential-value-container'><p>
                {props.value ? props.value : ''}{props.value?props.valueSubs:''}
            </p>
                {props.refferentialValue?props.refferentialValue.map(obj => obj):''}
            </div>
    </>;
}

export function DetailsRowQuantitativeControl(props) {
    return <div style={{ width:'fit-content' , display:'grid', gridColumn:'1/3', gridTemplateColumns:`200px 1fr` }}>
        <div style={{whiteSpace:"pre-wrap", wordBreak:"break-all", display:'grid', gridColumn:'1/2'}}><p>{props.label}</p></div>
        <div style={{display:'grid', gridColumn:'2/3', gridTemplateColumns:'subgrid'}}>
        {props.children}
        </div>
    </div>;
}

export function DetailsRowControlC(props) {
    return <>
        <div style={{display:'grid-inline', gridColumn:'1/2'}}><p>{props.label}</p></div>
        <div style={{textAlign:'left', display:'grid', gridColumn:'2/3'}}><p>{props.value}</p></div>
</>
}



