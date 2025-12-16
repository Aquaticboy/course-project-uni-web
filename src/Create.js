import { useState } from "react";
import {useHistory} from "react-router-dom";

const Create = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [author, setAuthor] = useState('Mario');

    const history = useHistory();

    const handleSubmit = (e) =>{
        e.preventDefault();
        const blog = { title, body, author };

        fetch("/insertNewBlog", {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(blog)
        })
        .then((res)=>{
            if(!res.ok){
                throw Error('Problem with inserting data.');
            }
            console.log(res.statusText);
            history.push("/");

        })
      .catch((err) => {
        console.log(err.message);
        // or, if we want to store Error message in variable:
        // setError(err.message);
      });
    }

  return (
    <div className="create">
      <h2>Add new blog</h2>

      <form onSubmit={handleSubmit}>
        <label>Blog Title:</label>
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}/>

        <label>Blog body:</label>
        <textarea required value={body} onChange={(e) => setBody(e.target.value)}></textarea>

        <label>Blog author:</label>
        <select value={author} onChange={(e) => setAuthor(e.target.value)}>
          <option value="Mario">Mario</option>
          <option value="Tom">Tom</option>
        </select>

        <button>Add blog</button>

      </form>
    </div>
  );
};

export default Create;
