import { useState, useContext, useEffect } from 'react';
import  { useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import _ from 'lodash';
import { addUser } from '../apiCalls/SignInApiCalls';
import { InputSearchForm } from './others/SerchBarComponents';
import { StateContext } from '../App';

const userData = {
    usr:{
        firstname:null,
        surname:null,
        password:null,
        password2:null,
        email:null
    },
    err:{
        firstname:'',
        surname:'',
        password:'',
        password2:'',
        email:''
    }
}


export function CreateAccountContent (){
        const [user, setUser] = useState(_.cloneDeep(userData));    
        const [connectionError,setConnectionError] = useState('');
        const [passwordSimilarity, setPasswordSimilarity] = useState(true);
        let navigate = useNavigate();

        const handleClick = (event) => {
            event.preventDefault();
            if (passwordSimilarity){
                const usr = _.cloneDeep(user.usr);
                const err = _.cloneDeep(user.err);
                _.set(err, 'password','hasła nieidentyczne');
                setUser({
                    usr: usr,
                    err: err
                });
                return;
            }
            else {
                createUser();
            }

        }

        const handleChange = (event) => {
            const {name, value } = event.target
            const usr = _.cloneDeep(user.usr);
            const err = _.cloneDeep(user.err);
            _.set(usr, name, value==''?null:value);
            _.set(err, name,'');
            setUser({
                usr: usr,
                err: err
            });
            setPasswordSimilarity(user.usr.password==user.usr.password2)
        }

        const createUser = async () => {
            await addUser(user.usr)
            .then(res => {
                switch (res.status){
                    case (201):{
                        setUser(_.cloneDeep(userData));
                        setConnectionError("");
                    };
                    break;
                    case (422): {
                        const usr =  _.cloneDeep(user);
                        Object.keys(res.data.message)
                            .map(key => {
                                if (key!='1062')
                                    _.set(usr.err, key, res.data.message[key]);
                                else {
                                    console.log(JSON.stringify(res.data.message));
                                    const reg= /(User)([.])([aA-zZ]+)/gm;
                                    const k=res.data.message[key].match(reg)[0].split('.')[1]; 
                                    _.set(usr.err, k, res.data.message[key]);
                                }    
                            })
                        setUser(usr);
                    };
                    break;
                    default: {
                        setConnectionError(`Error: ${res.data.error}  ${res.data.message!='' ? ` - Message: ${res.data.message}`:''}`);					
                        console.log(res.data)
                    }
                }
            })
        }

    return (
        <main>
                <h2>Utworzenie użytkownika</h2>
                <form className="form" onSubmit={handleClick} style = {{maxWidth:'400px'}}>
                    <fieldset className="searchFieldset">	
                        <InputSearchForm
                            label = "e-mail:"
                            name = "email"
                            type = "email"
                            error={user.err.email}
                            value={user.usr.email?user.usr.email:''}
                            onChange={handleChange}
                        />	
                        <InputSearchForm
                            label = "Imię:"
                            name = "firstname"
                            type = "text"
                            error={user.err.firstname}
                            value={user.usr.firstname?user.usr.firstname:''}
                            onChange={handleChange}
                        />
                        <InputSearchForm
                            label = "Nazwisko:"
                            name = "surname"
                            type = "text"
                            error={user.err.surname}
                            value={user.usr.surname?user.usr.surname:''}
                            onChange={handleChange}
                        />	
                         <InputSearchForm
                            label = "Hasło:"
                            name = "password"
                            type = "password"
                            error={user.err.password}
                            value={user.usr.password?user.usr.password:''}
                            onChange={handleChange}
                        />
                        <InputSearchForm
                            label = "Powtórz hasło:"
                            name = "password2"
                            type = "password"
                            error={user.err.password2}
                            value={user.usr.password2?user.usr.password2:''}
                            onChange={handleChange}
                        />
                    </fieldset>
                    <div className="form-buttons" style={{alignSelf:'center', margin:'auto'}}>
                    <input type="submit" className="form-button-submit" value="Załóż konto"/>
                </div>
                </form>
                {connectionError!==''?
                <h4 className='errors-text'>
                    {connectionError}
                </h4>:
                ''  
                }
        </main> 
    )
}
