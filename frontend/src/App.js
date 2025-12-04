
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./components/navbar";
import './App.css';
import MovieShowcase from "./components/movieShowcase";
import Profile from "./components/profile";
import ReactPaginate from 'react-paginate';
import MovieDetail from "./components/movieDetail";
import GroupPage from "./components/groupPage";
import SharedFavorites from "./components/sharedFavorites";



function App() {
  const [searchResults, setSearchResults] = useState([]);
  // searchResults now can be an object { results: [], page, total_pages }
  const [searchResultsObj, setSearchResultsObj] = useState({ results: [], page: 1, total_pages: 0 });
  const [hash, setHash] = useState(window.location.hash || "");
  const [searchPage, setSearchPage] = useState(1);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "");
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const isProfile = hash === '#profile';
  const isGroups = hash.startsWith('#groups');
  const isMovieDetail = hash.startsWith('#movie/');
  const movieId = isMovieDetail ? hash.replace('#movie/', '') : null;


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/shared-favorites/:userId" element={<SharedFavorites />} />
        <Route path="*" element={
          <div className="App">
            <Navbar onSearchResults={(data) => {
              // normalize incoming data from SearchBar
              if (Array.isArray(data)) setSearchResultsObj({ results: data, page: 1, total_pages: 0 });
              else setSearchResultsObj({ results: data.results || [], page: data.page || 1, total_pages: data.total_pages || 0 });
            }} page={searchPage} onPageChange={setSearchPage} />

            {/* Pääsisältö */}
            <main className="main-content">
        {isProfile ? (
          <Profile />
        ) : isGroups ? (
          <GroupPage />
        ) : isMovieDetail ? (
          <MovieDetail movieId={movieId} />
        ) : (
          <>
            {/* Näytetään aina elokuvagalleria */}
            <MovieShowcase />

            {/* Hakutulokset TMDB:stä (jos olemassa) */}
            {searchResultsObj && searchResultsObj.results && searchResultsObj.results.length > 0 && (
              <div className="search-results-showcase">
                <h2>🔍 Hakutulokset</h2>
                <div className="movies-grid">
                  {searchResultsObj.results.map(result => {
                    const isGroup = result.group_id !== undefined;
                    const handleClick = () => {
                      if (isGroup) {
                        window.location.hash = `#groups?gid=${result.group_id}`;
                      } else {
                        try { sessionStorage.setItem('returnTo', '#home'); } catch(e){}
                        window.location.hash = `#movie/${result.tmdb_id || result.movie_id}`;
                      }
                    };
                    
                    return (
                      <div 
                        key={result.movie_id || result.tmdb_id || result.group_id} 
                        className="movie-card"
                        onClick={handleClick}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="movie-poster">
                          {isGroup ? (
                            <div className="group-icon">
                              <span style={{ fontSize: '4rem' }}>👥</span>
                            </div>
                          ) : result.movie_image ? (
                            <img src={result.movie_image} alt={result.movie_title} onError={(e) => e.target.style.display = 'none'} />
                          ) : (
                            <div className="no-poster">Ei kuvaa</div>
                          )}
                        </div>
                        <div className="movie-info">
                          <h3>{result.movie_title || result.group_name}</h3>
                          {result.movie_certification && <p className="certification">📋 {result.movie_certification}</p>}
                          {result.movie_description && <p className="description">{result.movie_description.substring(0, 100)}...</p>}
                          {result.group_description && <p className="description">{result.group_description.substring(0, 100)}...</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {searchResultsObj.total_pages > 1 && (
                  <div className="pagination-wrapper">
                  <ReactPaginate
                    breakLabel="..."
                    nextLabel=">"
                    onPageChange={(e) => {
                      const newPage = e.selected + 1;
                      setSearchPage(newPage);
                    }}
                    pageRangeDisplayed={5}
                    pageCount={searchResultsObj.total_pages}
                    previousLabel="<"
                    forcePage={(searchResultsObj.page || 1) - 1}
                    renderOnZeroPageCount={null}
                  />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );

}

export default App;
