
export const priv = {
    ROLE_SPECIFIC_DATABASE_INVITATION:'ROLE_SPECIFIC_DATABASE_INVITATION',
    ROLE_SPECIFIC_DATABASE_VISITOR:'ROLE_SPECIFIC_DATABASE_VISITOR',
    ROLE_SPECIFIC_DATABASE_USER:'ROLE_SPECIFIC_DATABASE_USER',   
    ROLE_SPECIFIC_DATABASE_TECHNICIAN:'ROLE_SPECIFIC_DATABASE_TECHNICIAN',
    ROLE_SPECIFIC_DATABASE_SCIENTIST:'ROLE_SPECIFIC_DATABASE_SCIENTIST',
    ROLE_SPECIFIC_DATABASE_ADMIN:'ROLE_SPECIFIC_DATABASE_ADMIN'
}

export const priviligiesHierarchy = [
    'SPECIFIC_DATABASE_INVITATION',
    'SPECIFIC_DATABASE_VISITOR',
    'SPECIFIC_DATABASE_USER',
    'SPECIFIC_DATABASE_TECHNICIAN',
    'SPECIFIC_DATABASE_SCIENTIST',
    'SPECIFIC_DATABASE_ADMIN'
]


export const priviligiesConv = (name) => {
    switch (name){
        case('ROLE_SPECIFIC_DATABASE_INVITATION'):
            return 'Zaproszenie';
        case('ROLE_SPECIFIC_DATABASE_VISITOR'):
            return 'Obserwujący';
        case('ROLE_SPECIFIC_DATABASE_USER'):
            return 'Użytkownik';    
        case('ROLE_SPECIFIC_DATABASE_TECHNICIAN'):
            return 'Technik';
        case('ROLE_SPECIFIC_DATABASE_SCIENTIST'):
            return 'Diagnosta';
        case('ROLE_SPECIFIC_DATABASE_ADMIN'):
        return 'Administrator';
    }
}



export const checkPriviliges = (definedPriviligies, userPriviligies) => {
    const startIndex=priviligiesHierarchy.findIndex(obj=>obj===definedPriviligies);
    if (startIndex===-1) return false;
    return priviligiesHierarchy.includes(userPriviligies,startIndex);
}