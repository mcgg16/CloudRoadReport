//import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // To check when page changes

    // Checks if user is logged in to see if lets them access stuff or not
    useEffect(() => {
        let ignore = false;

        // API request
        async function getSession() {
            try {
                const response = await fetch('/api/accounts/session');

                // Had error so not logged in
                if (response.status === 401) {
                    if (!ignore) {
                        setLoggedIn(false);
                        return;
                    }
                }

                if (!response.ok) {
                    throw new Error(`Could not check session (${response.status})`);
                }

                // Results from db 
                const data = await response.json();

                // Set login status
                if (!ignore) {
                    setLoggedIn(Boolean(data.username));
                }
            } catch (error) {
                if (!ignore) {
                    setLoggedIn(false);
                    console.error('Navbar could not establish session:', error);
                }
            }
        }

        getSession();

        return () => {
            ignore = true;
        };
    }, [location.pathname]); // Sets loc 

    // Helper funct to log user out
    async function logOut() {
        setLoggingOut(true);

        try {
            const response = await fetch('/api/accounts/logout', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(`Could not log out (${response.status})`);
            }

            setLoggedIn(false);
            window.location.replace('/'); // Forces window to refresh
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <div>
            <nav className="flex justify-between items-center h-16 font-semibold bg-blue-200 p-6 px-10">

                <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
                {!loggedIn ?
                    <div className="flex justify-right">
                        <a href="/login" className="mr-6">Login</a>
                        <a href="/register">Register</a>
                    </div>
                    :
                    <div>
                        <button
                            type="button"
                            onClick={logOut}
                            disabled={loggingOut}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            {loggingOut ? 'Logging Out...' : 'Log Out'}
                        </button>
                    </div>
                }
            </nav>

        </div>
    )
}

export default Navbar