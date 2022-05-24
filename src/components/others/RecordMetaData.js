


export function RecordMetaData(props){

    return<>
            <div className="details-metadata-box">
                <div>
                    <b>
                        <p>{props.creationTimeLabel}</p>
                        <p>{props.updateTimeLabel}</p>
                        <p>{props.createdByLabel}</p>
                        <p>{props.updatedByLabel}</p>
                    </b>
                </div>
                <div>
                    <p>{props.creationTime?props.creationTime:<br/>}</p>
                    <p>{props.updateTime?props.updateTime:<br/>}</p>
                    <p>{props.createdBy?props.createdBy:<br/>}</p>
                    <p>{props.updatedBy?props.updatedBy:<br/>}</p>
                </div>
            </div>    
        </>
}

export function OrderRecordMetaData(props){

    return<>
            <div className="details-metadata-box">
                <div>
                    <b>
                        <p>{props.orderDateLabel}</p>
                        <p>{props.orderCreationDateLabel}</p>
                    </b>
                </div>
                <div>
                    <p>{props.orderDate?props.orderDate:<br/>}</p>
                    <p>{props.orderCreationDate?props.orderCreationDate:<br/>}</p>
                </div>
            </div>    
        </>
}