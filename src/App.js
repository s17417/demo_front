import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom'
import Header from './components/fragments/Header';
import Navigation from './components/fragments/Navigation';
import MainContent from './components/others/MainContent';
import PatientList from './components/PatientList';
import Footer from './components/fragments/Footer';
import SignInContent from './components/others/SignInContent';
import AuthStateReducer, { AuthMemo } from './tokenHanle/AuthState';
import { useEffect } from 'react';
import TenantSignInContent from './components/others/TenantSignInContent';
import { ErrorBoundary } from './Exceptions/ErrorBoundary';
import { useState } from 'react';
import PatientForm from './components/others/PatientForm';
import PatientDetails from './components/PatientDetails';
import PatientOrderForm from './components/PatientOrderForm';
import PatientOrderList from './components/PatientOrderList';
import PhisicianList from './components/PhisicianList';
import PhisicianForm from './components/PhisicianForm';
import OrderingUnits from './components/OrderingUnitList';
import OrderingUnitForm from './components/OrderingUnitForm';
import PhisicianDetails from './components/PhisicianDetails';
import OrderingUnitDetails from './components/OrderingUnitDetails';
import PatientOrdersDetails from './components/PatientOrderDetails';
import AnalyteForm from './components/AnalyteForm';
import AnalytesList from './components/AnalytesList';
import AnalyteDetails from './components/AnalyteDetails';
import LaboratoryTestsList from './components/LaboratoryTestsList';
import LaboratoryTestForm from './components/LaboratoryTestForm';
import LaboratoryTestDetails from './components/LaboratoryTestDetails';
import ResultFormDetails from './components/ResultFormDetails';
import Popup from 'reactjs-popup';
import { GenericPopupDetails } from './components/popups/AddComment';
import ControlOrderForm from './components/ControlOrderForm';
import ControlOrderList from './components/ControlOrderList';
import ControlOrdersDetails from './components/ControlOrderDetails';
import ControlResultFormDetails from './components/ControlResultFormDetails';
import OrderResultList from './components/OrderResultList';
import { CreateAccountContent } from './components/CreateAccount';
import { ActivateAccountContent } from './components/AcitvateAccountComponent';
import UserDetails from './components/UserDetails';
import UsersListComponent from './components/Users';
import { checkPriviliges } from './components/others/PriviligiesNamesConv';
import SpecimentTypeList from './components/SpecimentTypeList';


export const StateContext = React.createContext();
export const AuthContext = React.createContext(); 

const PrivateRoute = ({ auth: { isAuthenticated }, children }) => {
  return isAuthenticated ? children : <Navigate to="/signIn" />;
};

const PrivateRouteTenant = ({ auth: { isAuthenticated }, children }) => {
  return isAuthenticated ? children : <Navigate to="/lab/tenantSignIn" />;
};




function App() {
  const [state, dispatch] = AuthStateReducer();
  const memo = AuthMemo(dispatch);
  const [tokenRestored, setTokenRestored]=useState(false);

  useEffect (async () =>{
    memo.restoreToken().finally(() =>setTokenRestored(true))
  },[]);

  useEffect ( async () => {
    window.onunhandledrejection = async (err) => {
      console.log(err);
        if (err.reason.message.includes("401")){
          //alert("token expired");
          await memo.signOut().finally(() => {alert("session expired");});
        }
        if (err.reason.message.includes("403"))
          alert("Access Denied")
    }
  },[])

  

   
 
    
  return ( !tokenRestored ? <></>:
    <Router >
      <div>   
      <StateContext.Provider value={state}>
      <Header/>
      <AuthContext.Provider value={memo}>
      <Navigation/>
      <ErrorBoundary >
        <Routes>
          <Route path ="/" element={<MainContent/>}/>
          
          {state.signedIn==false 
            ? (<>
            <Route path="/signIn" element={<SignInContent/>}/>
            <Route path="/createUser" element={<CreateAccountContent/>}/>
            <Route path="/activateAccount/" element={<ActivateAccountContent/>}/>         
            </>)
          : (<></>)}
          {/*state.signedIn==true&&state.signedTenant!==null 
            ? (
            <Route path="/lab/patients" element={<PatientList/>}/>
            
            )
            : (<></>)*/}

          
          {/*state.signedIn==true 
            ? (<><Route path ="/lab/tenantSignIn"  element={<TenantSignInContent/>}/></>)
            : (<></>)
          */}
          <Route path="/lab/tenantSignIn"
            element={
              <PrivateRoute auth={{isAuthenticated: state.signedIn}}>
                <TenantSignInContent />
              </PrivateRoute>
            }
          />

          <Route path="/lab/userDetails"
            element={
              <PrivateRoute auth={{isAuthenticated: state.signedIn}}>
                <UserDetails />
              </PrivateRoute>
            }
          />

          

          <Route path="/lab/tenant/users"
            element={
              
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_ADMIN",state.userRole)}}>
                <UsersListComponent/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/analytes"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <AnalytesList/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/specimentTypes"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <SpecimentTypeList/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/laboratoryTests"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <LaboratoryTestsList/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/patients"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_VISITOR",state.userRole)}}>
                <PatientList/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/phisicians"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <PhisicianList/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/orderingUnits"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <OrderingUnits/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/patientOrders"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_VISITOR",state.userRole)}}>
                <PatientOrderList/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/orderResults"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_VISITOR",state.userRole)}}>
                <OrderResultList/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/controlOrders"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null &&checkPriviliges("SPECIFIC_DATABASE_VISITOR",state.userRole)}}>
                <ControlOrderList/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/patientOrders/add"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <PatientOrderForm/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/controlOrders/add"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null}&&checkPriviliges("SPECIFIC_DATABASE_TECHNICIAN",state.userRole)}>
                <ControlOrderForm/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/laboratoryTests/add"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_ADMIN",state.userRole)}}>
                <LaboratoryTestForm/>
              </PrivateRouteTenant>
            }
          />

          <Route path="/lab/tenant/analytes/add"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_ADMIN",state.userRole)}}>
                <AnalyteForm/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/patients/add"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <PatientForm/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/phisicians/add"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <PhisicianForm/>
              </PrivateRouteTenant>
              
            }
          />

<         Route path="/lab/tenant/orderingUnits/add"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <OrderingUnitForm/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/laboratoryTests/details/:ltdId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <LaboratoryTestDetails/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/analytes/details/:anaId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <AnalyteDetails/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/patients/details/:patId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_VISITOR",state.userRole)}}>
                <PatientDetails/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/phisicians/details/:phiId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <PhisicianDetails/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/orderingUnits/details/:ordId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <OrderingUnitDetails/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/patientOrders/details/:ordId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_VISITOR",state.userRole)}}>
                <PatientOrdersDetails/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/controlOrders/details/:ordId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <ControlOrdersDetails/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/laboratoryTests/edit/:ltdId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_ADMIN",state.userRole)}}>
                <LaboratoryTestForm/>
              </PrivateRouteTenant>
              
            }
          />


          <Route path="/lab/tenant/analytes/edit/:anaId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_ADMIN",state.userRole)}}>
                <AnalyteForm/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/patients/edit/:patId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <PatientForm/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/phisicians/edit/:phiId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <PhisicianForm/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/orderingUnits/edit/:ordId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <OrderingUnitForm/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/patientOrders/edit/:ordId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <PatientOrderForm/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/controlOrders/edit/:ordId"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_TECHNICIAN",state.userRole)}}>
                <ControlOrderForm/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/patientOrders/:patId/patientSamples/:splId/ordersResults/:ordId/analytesResults"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_VISITOR",state.userRole)}}>
                <ResultFormDetails/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/patientOrders/:patId/patientSamples/:splId/ordersResults/:ordId/analytesResults/:mode"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_TECHNICIAN",state.userRole)}}>
                <ResultFormDetails/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/controlOrders/:contId/controlSamples/:splId/controlResults/:ordId/analytesResults"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_USER",state.userRole)}}>
                <ControlResultFormDetails/>
              </PrivateRouteTenant>
              
            }
          />

          <Route path="/lab/tenant/controlOrders/:contId/controlSamples/:splId/controlResults/:ordId/analytesResults/:mode"
            element={
              <PrivateRouteTenant auth={{isAuthenticated: state.signedIn&&state.signedTenant!=null&&checkPriviliges("SPECIFIC_DATABASE_TECHNICIAN",state.userRole)}}>
                <ControlResultFormDetails/>
              </PrivateRouteTenant>
              
            }
          />

        <Route path ="*" element={<Navigate to={"/"}/> }/>

        {/*state.signedIn==true&&state.signedTenant==null
        
          ?(<><Route path ="/lab/*" element={<Navigate to={"/lab/tenantSignIn"} />}/></>)
        :(<></>)*/}

       
        </Routes>
        </ErrorBoundary>
        </AuthContext.Provider> 
        </StateContext.Provider>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;

