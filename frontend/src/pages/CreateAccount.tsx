import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function CreateAccount() {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    //const [error, setError] = useState('');
    const navigate = useNavigate();
    //const [user, setUser] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState('');

    // Functions
    const handleClick = () => {
        console.log('Button clicked!');
    };

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
                            type="username"
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
                        onClick={handleClick}
                        className="text-white font-bold bg-blue-400 hover:bg-blue-700 py-2 px-4 rounded-2xl"
                    >Create Account</button>
                </div>

                {/* Error display or create account*/}
                {errorMessage && <p className="text-center rounded-lg bg-red-100 text-red-800 outline-2 outline-red-800 mt-5 mb-1 px-2 py-3">{errorMessage}</p>}
                <div className="text-center items-center gap-2.5 mt-15">
                    <p className="text-gray-600 font-semibold">Already have an account?</p>
                    <a href="/login" className="font-semibold underline hover:text-morado-lakers">Log In</a>
                </div>
            </div>
        </div>
    )
}

export default CreateAccount