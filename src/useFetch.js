import { useState, useEffect } from "react";

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // if (!url) return;
    // console.log("Use Effect ran!");
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw Error("Could not fetch the Blogs data!");
        }
        return res.json();
      })
      .then((data) => {
        // console.log("Data fetched: \n" + JSON.stringify(data, null, 2));
        setData(data);
        setIsPending(false);
        setError(null);
      })
      .catch((err) => {
        // console.log(err.message);
        // or, if we want to store Error message in variable:
        setIsPending(false);
        setError(err.message);
      });
  }, [url]);

  return { data, isPending, error }
};

export default useFetch;
