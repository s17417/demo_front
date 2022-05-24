import React from "react";
import { useLocation } from "react-router-dom"

function MainContent(){
    const location = useLocation();

    return (
        <main>
        <div  className={location.pathname.includes("/signIn")?"content":""}>
		<h2>Strona główna</h2>
		<p>lorem ipsum.....</p>
        </div>
	</main> 
    );
}

export default MainContent