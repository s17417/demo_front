import React from "react";
import { useLocation } from "react-router-dom";


function Footer(){
    const location = useLocation();
    return (
        <footer>
            <div className={location.pathname.includes("/lab/")?"content":""}>
		<p> Tomasz Poławski s17417</p>
        </div>
	</footer>
    )
}

export default Footer