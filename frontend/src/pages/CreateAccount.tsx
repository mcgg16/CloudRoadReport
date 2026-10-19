import { useState } from 'react'
import { useNavigate } from "react-router-dom";

function CreateAccount() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Create account 
    async function handleClick() {
        console.log("Handle the click");
        setErrorMessage('');

        // Check information 
        if (username.length === 0 && password.length === 0) {
            setErrorMessage("Please enter a username and password")
        }
        else if (username.length === 0) {
            setErrorMessage("Please enter a username");
        }
        else if (password.length === 0) {
            setErrorMessage("Please enter a password");
        } else {
            // Shows that it is going to load
            setLoading(true);

            // Sends the query 
            try {
                const response = await fetch('/api/accounts/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                });

                // Waits to see what endpoint says
                const data = await response.json();

                // Something died
                if (!response.ok) {
                    throw new Error(data.error || 'Could not create account');
                }

                console.log('Created user');
                navigate('/'); // Successful, takes them home with session
            } catch (error) {
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : 'Could not create account'
                );
            } finally {
                setLoading(false);
            }
        }

    }

    return (
        <div className="flex items-center justify-center overflow-hidden">
            {/* Centered login card */}
            <div className="relative flex flex-col items-center w-full max-w-sm px-8 py-10">

                <h1 className="text-2xl font-bold text-center mb-1">Register</h1>
                <p className="text-gray-600 text-center mb-6">Join and help submit reports for your fellow riders!</p>

                {/* Capture data, first email/username */}
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-1">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="h-11 px-4 bg-gray-100 rounded-2xl text-zinc-600 focus:outline-2"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Create new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 px-4 bg-gray-100 rounded-2xl text-zinc-600 focus:outline-2"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleClick}
                        disabled={loading}
                        className="text-white font-bold bg-blue-400 hover:bg-blue-700 py-2 px-4 rounded-2xl disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </div>

                {/* Error display or go login or home */}
                {errorMessage && <p className="text-center rounded-lg bg-red-100 text-red-800 outline-2 outline-red-800 mt-5 mb-1 px-2 py-3">{errorMessage}</p>}
                <div className="flex flex-col text-center items-center gap-2.5 mt-15 col-1">
                    <p className="text-black font-semibold">Already have an account?</p>
                    <a href="/login" className="text-blue-400 hover:text-blue-700 font-semibold underline">Log in</a>
                    <a href="/" className="text-zinc-600 underline hover:text-blue-700 mt-5">Return Home</a>
                </div>
            </div>
        </div>
    )
}

export default CreateAccount