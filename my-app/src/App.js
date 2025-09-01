import './App.css';

function MALSignIn() {
  return(
    <button className="MAL-sign-in-button">Sign in with MyAnimeList</button>
  );
}

function ArrowToNextPage() {
  return(
    <img src="/downarrow.png" className="Arrow" alt="Arrow to next page"></img>
  )
}

function App() {
  return (
    <div className="App">
      <div className="Pages">
        <div className="FrontPage">
            <h1>Tokku</h1>
            <MALSignIn/>
            <ArrowToNextPage/>
        </div>
        <div className="SearchPage">
          <p>This is what the search page is supposed to be</p>
        </div>
      </div>
    </div>
  );
}


export default App;
