//Main.jsx file for a React application
import React, {StrictMode} from 'react' // Importing React and StrictMode for strict mode checks
import { createRoot } from 'react-dom/client' // Importing createRoot from react-dom/client
import { BrowserRouter } from 'react-router-dom' // Importing BrowserRouter for routing
import App from './App.jsx' // Importing the App component from App.jsx
import { AuthProvider } from './context/AuthContext.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>                                                        
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
