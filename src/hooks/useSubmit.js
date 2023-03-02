import {useState} from "react";




const useSubmit = () => {
  const [isLoading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const submit = async (url, data) => {
    setLoading(true);
    try {
      const response = await fetch (url, { //using fetch to make a POST request to the 'url' withe data object as the body of the resquest
        method:'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body:JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      setResponse({
        type: 'success',
        message: `Thanks for your submission ${data.firstName}, I will get back to you shortly!`,
      })
    } catch (error) {
      setResponse({
        type: 'error',
        message: 'Something went wrong, please try again later!',
      })
    } finally {
      setLoading(false);
    }
  };

  return { isLoading, response, submit };
}

export default useSubmit;
