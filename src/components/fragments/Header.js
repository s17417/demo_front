import React from "react"
import { useLocation } from "react-router-dom"


function Header() {
    const location = useLocation();


    return (
    <header>
        <div className={location.pathname.includes("/lab/")?"content":""}>
		<h1>Medical-Lab</h1>
		</div>
	</header>
    )
}

export default Header