
import {useEffect, useState } from "react"



export function DoingWork({message}){
    const [time,setTime]=useState(false);
    const after = () => {setInterval( async() =>setTime(true),1000);  }
    useEffect(() => {
        if (time==false) after();
        return (() => setTime(true));
    },[time])
    return time?<main>
        <div className="content-busy">
            <h2>{message}</h2>
            
            <img src={'/img/busy.gif'} />
            </div>
    </main>
    : <main><div className="content-busy"></div></main>
   
}