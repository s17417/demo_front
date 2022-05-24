

export function getFormattedDate(dateSource) {
    const dateObject = new Date(dateSource)
    return dateObject.getFullYear() + '-' + ('0' + (dateObject.getMonth()+1)).slice(-2) + "-" + ('0' + dateObject.getDate()).slice(-2)
}

export function getFormattedDateTime(dateSource) {
    const dateObject = new Date(dateSource)
    return dateSource&&dateSource!=''?dateObject
            .getFullYear() + 
            '-' + 
            ('0' + (dateObject.getMonth()+1))
            .slice(-2) + 
            "-" + 
            ('0' + dateObject.getDate())
                .slice(-2) +
            ' ' +
            dateObject.getHours() +
            ":" +
            dateObject.getMinutes()
            :null;
            
}