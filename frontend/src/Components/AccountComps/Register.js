import React from "react";
import './register.css';
class Register extends React.Component {
    
      handleSubmit = async(event) =>  {
        var name = document.getElementById("RegisterName").value;
        var password = document.getElementById("RegisterPassword").value;
        var data = {'Name' : name, 'Password' : password};
        event.preventDefault();
        const response = await fetch('/register', {
        method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
        var body = await response.json();
        if (body['Status'] === true){
          window.localStorage.setItem('Auth', body["Auth"])
          window.location.reload();
        }
        else{
          document.getElementById("RegisteredText").classList.add("ExistingAccount");
        }
        
      }    
    render() {
        return (
           <div className="RegisterForm">
            <h1 className="title">Register</h1>
            <h6 className="subtitle is-6">Already have an account? Log in</h6>
            <hr></hr>
                <div className="field">
                  <div className="field-body">
                    <div className="field">
                      <p className="control is-expanded has-icons-left">
                        <input className="input" type="text" placeholder="Name" id="RegisterName"/>
                        <span className="icon is-small is-left">
                          <i className="fas fa-user"></i>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <div className="field-body">
                    <div className="field">
                      <p className="control is-expanded has-icons-left">
                        <input className="input" type="password"  placeholder="password" id="RegisterPassword"/>
                        <span className="icon is-small is-left">
                          <i className="fas fa-user"></i>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <p id="RegisteredText"className="error-text">You are already registered Login</p>
                <button className="button" onClick={this.handleSubmit}>Submit</button>
            </div>
        );
      }
}
export default Register;

