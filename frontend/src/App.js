import { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import './App.css';
import MovieShowcase from "./components/movieShowcase";
import Profile from "./components/profile";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [hash, setHash] = useState(window.location.hash || "");

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "");
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isProfile = hash === '#profile';

  return (
    <div className="App">
      <Navbar onSearchResults={setSearchResults} />

      {/* Pääsisältö */}
      <main className="main-content">
        {isProfile ? (
          <Profile />
        ) : (
          <>
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
          : 
            <div className="empty-state">
              <h2>Tervetuloa PossuKinoon!</h2>
              <p> Käytä ylänurkan hakupalkkia löytääksesi elokuvia tai ryhmiä.</p>
            </div>
          </>
        
        )}
      </main>
    </div>
  );

}

export default App;
