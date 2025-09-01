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
          <div className="Search">
            <label for="AnimeInput">
              <div className="SearchBox">
                <ul id="AnimeList"></ul>
                <input type="text" id="AnimeInput" placeholder="Enter an anime you've watched."></input>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}


export default App;
