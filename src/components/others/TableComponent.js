import PageSizeAndIndexComponent from "./PageSizeAndIndexComponent";
import { Link } from "react-router-dom";
import _ from "lodash";
import { Children } from "react";

export default function TableComponent(props){
	
	return (
		<>
		<table className='table-list'>
			<thead>
				<tr>
                    {Object.entries(props.labelsArray).map(([key,value]) => <th id={`th-${key}`} className={props.className!=undefined?props.className:''} key={key} onClick={()=>props.onTableHeaderClick(key)}>{value}</th>)}
				</tr>
			</thead>
			<tbody>{props.children}</tbody>	
		</table>
		</>
	)
}



export function PatientListTableRow(props){
	const deactivated=props.deactivated
	const patient = props.patData;
	const labels = props.labels;
	const children = Children.toArray(props.children);
	const onRowClick = props.onRowClick?props.onRowClick:()=>{};
	return <tr style={deactivated?{color:"lightgray",backgroundColor:"white"}:{}} onClick={()=>onRowClick(patient)} id={patient.id}>
				{Object.entries(labels).map(([label, values]) => {
					return <td id={`td-${label}`} key={label}>
						{values==null?_.get(patient,label):values(_.get(patient,label))}
					</td>
					})}
				{children&&children.length>0?
				<td className="actions-headers" id={patient.id}>
					<ul className="list-actions">
						{Children.map(children,(children,index)=>{
							return <li key={index}>{children}</li>
						})}	
					</ul>
				</td>:''}
			</tr>
	
}

/*

export default function PatientTableComponent({props, onRowClick, data, Actions, labelsArray, onTableHeaderClick}){
    const labels=Object.entries(labelsArray);
	
	return (
		<>
		<table className="table-list">
			<thead>
				<tr>
                    {Object.entries(labelsArray).map(([key,value]) => <th key={key} onClick={()=>onTableHeaderClick(key)}>{value[0]}</th>)}
					{Actions!=undefined ? <th className="actions-headers" onClick={onTableHeaderClick}>Akcje</th> :''}
				</tr>
			</thead>
			<tbody>
				{data!=null ? data.map(row =>
					<PatientListTableRow Actions={Actions} onRowClick={onRowClick} labels={labels} patData={row} key={row.id} id={row.id}/>
					):""}
			</tbody>
			
			
		</table>
		</>
	)

}



function PatientListTableRow({labels, patData, Actions, onRowClick, id}){
	const patient = patData;
	return (
		<tr>

            {labels.map(([label, values]) => {
				return <>
					<td id={id} key={label}>{values.length==1 ? patient[label] : values[1](patient[label])}</td>
		
			
				
				</>
				})
			}
			<td id={patient.id}>
				<ul className="list-actions">
					{Actions.detailsLink!=undefined ? <li><Link key={id} to={`${Actions.detailsLink}${id}`} className="list-actions-button-details">Szczegóły</Link></li>:''}
					{Actions.editLink!=undefined ? <li><Link key={id} to={`${Actions.editLink}${id}`} className="list-actions-button-edit">Edytuj</Link></li>:''}
				</ul>
			</td>
			
		</tr>
	)


*/ 