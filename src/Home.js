import BlogList from './BlogList'
import useFetch from "./useFetch";

const Home = () => {
    const { data, isPending, error } = useFetch('/getAllBlogs');
    
    
    return ( 
        <div className="home-content">
            { // or, if we want to store Error message in variable:
            error && <div>{error}</div> }
            
            {isPending && <div>Loading blogs...</div>}
            {data && <BlogList blogs={data} />}
        </div>
     );
}
 
export default Home;