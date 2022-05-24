
import {Link} from 'react-router-dom';
import { useState, useEffect, useRef, useContext, Component } from "react";
import {useLocation} from 'react-router-dom';
import { StateContext } from "../../App";
import { AuthContext } from '../../App';
import { checkPriviliges } from '../others/PriviligiesNamesConv';

function Navigation (){
	const authContext = useContext(AuthContext);
	const stateContext = useContext(StateContext);
	const [activeIndex, setActiveIndex] = useState();
	const [clickedMenu, setClickedMenu] = useState();
	const [isClicked, setClicked] = useState();
	const useClick = (index) =>setActiveIndex(index);
	const location = useLocation();
	const ref = useRef();
	
	const showMenu = (key) =>{
		if (clickedMenu!=key){
			setClicked(key)
			setClickedMenu(key);
		}
		else {
			setClicked();
			setClickedMenu();
		}
		
	};
	 
	const handleClickOutside = (event) => {
		if (ref.current && !ref.current.contains(event.target)) {
			setClicked(false);
			setClicked();
		}
	};

	useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);
	


	
    return(
    <nav className={location.pathname.includes("/lab/")?"sidebar":""}>
		<ul>
			<li>
				<MyLink  name="Strona Główna" to="/" onClick={useClick} isActive={activeIndex === 0} index={0} />
			
			</li>		
			
			{stateContext.signedTenant!=null
			? (<>
			

			{checkPriviliges("SPECIFIC_DATABASE_USER",stateContext.userRole)?
			<li>
				<div className="dropdown">
					<button className="dropdown-btn" onClick={() => showMenu(80)}>Testy</button>
						<div ref={ref} className={isClicked===80 ? "show" : "dropdown-container"}>
							<MyLink name="Lista testów" to="/lab/tenant/laboratoryTests" onClick={useClick} isActive={activeIndex === 81} index={81}/>
							{checkPriviliges("SPECIFIC_DATABASE_ADMIN",stateContext.userRole)?
							<>	
								<MyLink name="Dodaj test" to="/lab/tenant/laboratoryTests/add" onClick={useClick} isActive={activeIndex === 82} index={82}/>
								<MyLink name="Dodaj analit" to="/lab/tenant/analytes/add" onClick={useClick} isActive={activeIndex === 83} index={83}/>			
							</>:''
							}
							<MyLink name="Lista analitów" to="/lab/tenant/analytes/" onClick={useClick} isActive={activeIndex === 84} index={84}/>
							<MyLink name="Materiał" to="/lab/tenant/specimentTypes/" onClick={useClick} isActive={activeIndex === 85} index={85}/>										
						</div>
				</div>
			</li>:''
			}

			{checkPriviliges("SPECIFIC_DATABASE_USER",stateContext.userRole)?
			<li>
				<div className="dropdown">
					<button className="dropdown-btn" onClick={() => showMenu(50)}>Zlecajacy</button>
					<div ref={ref} className={(isClicked===50) ? "show" : "dropdown-container"}>
						<MyLink name="Jednostki" to="/lab/tenant/orderingUnits" onClick={useClick} isActive={activeIndex === 51} index={51}/>
						<MyLink name="Dodaj Jednostkę" to="/lab/tenant/orderingUnits/add" onClick={useClick} isActive={activeIndex === 52} index={52}/>
						<MyLink name="Lekarze" to="/lab/tenant/phisicians" onClick={useClick} isActive={activeIndex === 53} index={53}/>
						<MyLink name="Dodaj lekarza" to="/lab/tenant/phisicians/add" onClick={useClick} isActive={activeIndex === 54} index={54}/>
					</div>
				</div>
			</li>
			:''}

			<li>
				<div className="dropdown">
					<button className="dropdown-btn" onClick={() => showMenu(20)}>Zlecenia</button>
					<div ref={ref} className={isClicked===20 ? "show" : "dropdown-container"}>
						<MyLink name="Zlecenia" to="/lab/tenant/patientOrders" onClick={useClick} isActive={activeIndex === 21} index={21}/>
						<MyLink name="Analizy" to="/lab/tenant/orderResults" onClick={useClick} isActive={activeIndex === 24} index={24}/>
						{checkPriviliges("SPECIFIC_DATABASE_USER",stateContext.userRole)?
							<MyLink name="Dodaj" to="/lab/tenant/patientOrders/add" onClick={useClick} isActive={activeIndex === 22} index={22}/>:''
						}
						{checkPriviliges("SPECIFIC_DATABASE_USER",stateContext.userRole)?
							<MyLink name="Kontrole" to="/lab/tenant/controlOrders" onClick={useClick} isActive={activeIndex === 23} index={23}/>:''
						}
					</div>
				</div>
			</li>

			<li>
				<div className="dropdown">
					<button className="dropdown-btn" onClick={() => showMenu(10)}>Pacjenci</button>
					<div ref={ref} className={(isClicked===10) ? "show" : "dropdown-container"}>
						<MyLink name="Wyszukaj" to="/lab/tenant/patients" onClick={useClick} isActive={activeIndex === 11} index={11}/>
						{checkPriviliges("SPECIFIC_DATABASE_USER",stateContext.userRole)?<MyLink name="Dodaj" to="/lab/tenant/patients/add" onClick={useClick} isActive={activeIndex === 12} index={12}/>:''}
					</div>
				</div>
			</li>
			
			</>)
			: (<></>)}

			{console.log(stateContext.userRole)}
			{stateContext.signedTenant!=null&&stateContext.userRole==='SPECIFIC_DATABASE_ADMIN'?
			<li>
				
				<MyLink name="Użytkownicy" to="/lab/tenant/users" onClick={useClick} isActive={activeIndex === 91} index={91}/>			
		
			</li>
			:''}
			






				{stateContext.signedIn==false
				? (<>
					<li><MyLink name="Zaloguj" to="/signIn" onClick={useClick} isActive={activeIndex === 10} index={10}></MyLink></li>
					<li><MyLink name="Utwórz konto" to="/createUser" onClick={useClick} isActive={activeIndex === 11} index={11}></MyLink></li>

				</>)
				: (<></>)}
				{stateContext.signedIn==true
				? (<>
					<li><MyLink name="Wyloguj" to="/" onClick={() => authContext.signOut()} isActive={activeIndex === 12} index={12}></MyLink></li>
				</>)
				: (<></>)}

				{stateContext.signedIn==true
				? (<>
					<li>
						<MyLink name='Konto' to="/lab/userDetails" onClick={useClick} isActive={activeIndex === 13} index={13}/>
					</li>
					<li>
						<MyLink name="Laboratoria" to="/lab/tenantSignIn" onClick={useClick} isActive={activeIndex === 14} index={14}/>
					</li>

				</>)
				: (<></>)}
				
			</ul>
	</nav>
    )
}

class MyLink extends Component{
	handleClick = () => this.props.onClick(this.props.index);
	render(){
		return(<Link to={this.props.to} onClick={this.handleClick} className={this.props.isActive ? 'active':''}>{this.props.name}</Link>)
	}
}


export default Navigation

