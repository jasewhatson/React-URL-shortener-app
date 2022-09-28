/*
TODO: Logic to not submit duplicate URL's which are already in our DB
TODO: Provide msg on success copy to clipboard to user & success URL shorten
TODO: Remove use of !important in App.css - temp quick fix to resolve conflicts
*/
import './App.css';
import './css/main.css';
import { React, useState } from "react";
import axios from "axios";

const Results = (props) => (
  <div className="errorMessage">
    Error: {props.msg}
  </div>
)

function App() {

  const [userInput, setUserInput] = useState("");
  var savedLinks = JSON.parse(window.localStorage.getItem('users_short_links'));
  const [shortenedLinks, setShortenedLinks] = useState(savedLinks ?? []); //https://usefulangle.com/post/281/javascript-default-value-if-null-or-undefined
  const [showError, setShowError] = useState(false);
  const [showErrorMsg, setShowErrorMsg] = useState("");

  const isValidHttpUrl = (string) => {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  const fetchShortURL = async () => {

    if(userInput == ""){
      setShowError(true);
      setShowErrorMsg("No value provided");
      console.log("No value provided");
      return;
    }else if(isValidHttpUrl(userInput) == false){
      setShowError(true);
      setShowErrorMsg("Invalid url provided");
      console.log("Invalid url provided");
      return;
    }else{
      setShowError(false);
      setShowErrorMsg("");
    }

    try {
      const response = await axios(
        `https://api.shrtco.de/v2/shorten?url=${userInput}`
      );

      var newLinkJSON = {
        "orig_url": userInput,
        "short_url": response.data.result.full_short_link,
        "time_created": Date.now()
      };

      var newShortenedLinks = shortenedLinks.slice();   //https://stackoverflow.com/questions/26505064/what-is-the-best-way-to-add-a-value-to-an-array-in-state
      newShortenedLinks.push(newLinkJSON);
      window.localStorage.setItem('users_short_links', JSON.stringify(newShortenedLinks));
      setShortenedLinks(newShortenedLinks); //https://bobbyhadz.com/blog/react-map-array-reverse

    } catch (e) {
      setShowError(true);
      setShowErrorMsg("Error on api call - " + e.toString());
      console.log(e);
    }
  };

  return (

    <div>
      <h1>URL shortener app</h1>
      <br></br>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Original URL</th>
            <th scope="col">Short URL</th>
            <th scope="col">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {
            shortenedLinks.map((link, index) => (
              <tr key={link.time_created} id={link.time_created}>
                <th scope="row">{index + 1}</th>
                <td>{link.orig_url}</td>
                <td>{link.short_url}</td>
                <td><button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(shortenedLinks[index].short_url) }}>Copy to clipboard</button></td>
              </tr>
            ))}
        </tbody>
      </table>
      { showError ? <Results msg={showErrorMsg}/> : null }           
      <input
        className="form-control"
        type="text"
        placeholder="Enter link to be shortened"
        value={userInput}
        onChange={(e) => {
          setUserInput(e.target.value);
        }}
      />
      <div>
        <button
          className="btn btn-primary btn-submit-url"
          onClick={() => {
            fetchShortURL();
          }}
        >
          Submit URL
        </button>
      </div>
    </div>
  );
}

export default App;
