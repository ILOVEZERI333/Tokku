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
      <header className="App-header">
        <h1>Tokku</h1>
        <MALSignIn/>
        <ArrowToNextPage/>
      </header>
    </div>
  );
}


export default App;
