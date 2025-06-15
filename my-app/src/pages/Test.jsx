// frontend/src/Test.jsx
import { useEffect, useState } from 'react'

export default function Test() {
  const [msg, setMsg] = useState('Loading…') // Use useState to create a state variable 'msg' initialized to 'Loading…'

  useEffect(() => { // Mount the component and fetch data from the API
    fetch('/api/test') // Fetch data from the '/api/test' endpoint
      .then(r => r.json()) // Parse the response as JSON
      .then(data => setMsg(data.message)) // Update the 'msg' state with the message from the response
      .catch(error => setMsg('Error: ' + error.message)) // Handle any errors and update the 'msg' state with the error message
  }, [])

  return <h1>{msg}</h1>
}
