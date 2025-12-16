import {useParams, useHistory} from "react-router-dom";
import useFetch from "./useFetch";

const BlogDetails = () => {
    const {id} = useParams();
    const {data: blog, isPending, error} = useFetch("/getAllBlogs/" + id);
    const history = useHistory();

    const handleDelete = () => {
        fetch('/deleteBlogByID/' + blog.id, {
            method: "DELETE"
        })
        .then((res) => {
            history.push('/');
        })
        
    };


    return ( 
        <div className="blog-details">
            <h2>Blog details</h2>
            { isPending && <div>Loading details...</div> }
            { error && <div>{ error }</div> }
            { blog && (
                <article>
                    <h2>{ blog.title }</h2>
                    <p>Written by: {blog.author}</p>
                    <div>{blog.body}</div>
                    <button onClick={handleDelete}>Delete blog</button>
                </article>
            )}
        </div>
     );
}
 
export default BlogDetails;