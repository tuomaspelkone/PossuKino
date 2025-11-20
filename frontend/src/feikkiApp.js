import './App.css';
import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';



function FeikkiApp(){
    const [movies, setMovies] = useState([])
    const [page, setPage] = useState(1)
    const [pageCount, setPageCount] = useState(0)
    const [query, setQuery] = useState('')

    const Movies = () =>  {
        return (
            <table>
                { movies && movies.map(movie=>(
                    <tr key={movie.id}><td>{movie.title}</td></tr>
                ))}

            </table>
        )
    }


    const search = () => {
        fetch('https://api.themoviedb.org/3/search/movie?query=' + query + 'include_adult=false&language=en-US&page=1' + page,{
             headers:{
                 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmNmUwNzI0Y2Y3ZjM2MjEyOTU5YWFkZmQwMTQ3NDIxNSIsIm5iZiI6MTc2MjkzODQwNy42NDcsInN1YiI6IjY5MTQ0ZTI3NDRkOTc0YjdlOTljNGEyMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.rDWb-2s30Nb5OgqH-nMejMR_BRJvULmNX-HqavfzdPw',
                 'Content-Type':'application/json'
             }
         }).then(response => response.json())
         .then(json => {
             //console.log(json)
             setMovies(json.result)
             setPageCount(json.total_pages)
         })
         .catch(error => {
             console.log(error)
         })

    }


    useEffect(() => {
        search()
    }, [page])
    

    
    
    
    return (
        <div id="container">
            <h3>Search movies</h3>
            <input value={query} onChange={e => setQuery(e.target.value)}></input><button onClick={search} type="button">Search</button>
            <ReactPaginate
                breakLabel="..."
                nextLabel="next >"
                onPageChange={(e) => setPage(e.selected + 1)}
                pageRangeDisplayed={5}
                pageCount={pageCount}
                previousLabel="< previous"
                renderOnZeroPageCount={null}
            />
            <Movies />
        </div>
    );
}

export default FeikkiApp;
