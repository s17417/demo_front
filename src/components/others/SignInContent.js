import { useState, useContext, useEffect } from 'react';
import  { useNavigate } from 'react-router-dom';
import { AuthContext, StateContext } from '../../App';
import { Navigate } from 'react-router-dom';
function SignInContent (){
        const [email, setemail] = useState("");
        const [password, setPassword] = useState("");
        const [errors, setErrors] = useState("");
        let navigate = useNavigate();
        const authContext = useContext(AuthContext);
        const state = useContext(StateContext);

        useEffect(()=> {console.log(state)},[state])

        const onSubmit = (e) => {
          
          e.preventDefault(); 
          authContext.signInUser(email,password)
          .then(() => {})
          .catch(err => setErrors(err.message))       
        }

        return (
            <main>
                <h2>Logowanie</h2>
                <div id="login" className="loginForm">
			        <form  onSubmit={onSubmit} className="loginForm2">
				        <label htmlFor="email">e-mail</label>
				        <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setemail(e.target.value)}
                        />
			
				        <label htmlFor="password">password</label>
				        <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
		   
				        <input type="submit" value="Zaloguj"/>
			        </form>
              <span className='errors-text' >{errors}</span>
            </div>
            </main> 
        )
    }

export default SignInContent