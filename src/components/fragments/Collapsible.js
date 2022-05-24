import { Component } from "react"




export default class Collapsible extends Component{
    constructor(props){
        super(props);
        
    this.state = {
        visible: this.props.start
        }
        
    }
    render(
        toggleVisble = () => {
            this.setState({visible: !this.state.visible})
            if (this.props.onClick!=null)this.props.onClick();
        }
    ) {
        return<>
        <h3 type="button" onClick={toggleVisble} className={this.state.visible?"activeCollapsible":'collapsible'}><span>{this.props.name}</span><span>{this.state.visible?'-':'+'}</span></h3>
        <div className="contentCollapsible" style={{display: this.state.visible ? "block" : "none" }}>{this.props.children}</div>
        </>
        
    }


}



