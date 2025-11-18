import { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import './App.css';
import MovieShowcase from "./components/movieShowcase";

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
              <>
                <div className="profile-empty">
                  <div className="profile-icon">
                    <img src="/profile-placeholder.svg" alt="Profiilikuva" width="60" height="60" />
                  </div>
                  <div className="profile-info">
                    <div>Käyttäjä nimi: Juukelis</div>
                    <div>Sähköposti: juupelis@gmail.com</div>
                  </div>
                  <button className="btn">Muokkaa profiilitietoja</button>
                </div>

                <div className="profile-favourites">
                  {/* Tyhjä laatikko suosikeille */}
                  <p>Suosikit:</p>
                </div>
                <div className="profile-groups">
                  {/* Tyhjä laatikko ryhmille */}
                  <p className="section-title">Omat ryhmät:</p>

                  <div className="group-row">
                    <div className="group-name">Oma ryhmä</div>
                    <div className="group-actions">
                      <button className="btn">Poista ryhmä</button>
                      <button className="btn">linkki ryhmään</button>
                    </div>
                  </div>
                </div>
                <div className="profile-reviews">
                  {/* Tyhjä laatikko arvosteluille */}
                  <p className="section-title">Selaa arvostelujasi:</p>

                </div>
              </>

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
          : (
            <div className="empty-state">
              <h2>Tervetuloa PossuKinoon!</h2>
              <p> Käytä ylänurkan hakupalkkia löytääksesi elokuvia tai ryhmiä.</p>
            </div>
          )
          </>
        )}
      </main>
    </div>
  );

}

export default App;
