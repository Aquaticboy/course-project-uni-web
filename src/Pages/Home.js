import BlogList from './BlogList'
import useFetch from "../useFetch";
import Demo from '../MantineCompon/CarouselDemo/Demo';



const Home = () => {


    const { data, isPending, error } = useFetch('http://localhost:3001/getFeaturedMovies');
    // console.log("Home.js data: \n" + JSON.stringify(data, null, 2));

    return ( 
        <div className="home-content">
            { // or, if we want to store Error message in variable:
            error && <div>{error}</div> }
            
            {isPending && <div>Loading films...</div>}
            {data && <Demo data={data}/>}
        </div>
     );
}
 
export default Home;