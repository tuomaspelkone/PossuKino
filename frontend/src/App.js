import { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import './App.css';
import MovieShowcase from "./components/movieShowcase";

function App() {
  const [searchResults, setSearchResults] = useState([]);

  return (
    <div className="App">
      <Navbar onSearchResults={setSearchResults} />
      
      {/* Pääsisältö */}
      <main className="main-content">
        {/* Näytetään aina elokuvagalleria */}
        <MovieShowcase />
        {/*<div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map(result => (
              <div key={result.movie_id || result.group_id} className="result-card">
                <h3>{result.movie_title || result.group_name}</h3>
                {result.movie_description && <p>{result.movie_description}</p>}
                {result.group_description && <p>{result.group_description}</p>}
              </div>
            ))
          ) 
          */}
          : (
            <div className="empty-state">
              <h2>Tervetuloa PossuKinoon!</h2>
              <p> Käytä ylänurkan hakupalkkia löytääksesi elokuvia tai ryhmiä.</p>
            </div>
          )
      </main>
    </div>
  );

}

export default App;
