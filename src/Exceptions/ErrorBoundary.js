import { Component } from "react";


export class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error:"" };
    }

    handleClick = () => {
      this.setState({ hasError: false, error: "" });
    }
    
  
    componentDidCatch(error, info) {
      // Display fallback UI
      this.setState({ hasError: true, error: error.toString() });
      // You can also log the error to an error reporting service
      //logErrorToMyService(error, info);
    }
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return <main><div className="content">
        <div><h4>{this.state.error}</h4></div>
        <button className="button" onClick={this.handleClick}>Click Me</button>
        </div>
        </main>
      }
      return this.props.children;
    }
  }