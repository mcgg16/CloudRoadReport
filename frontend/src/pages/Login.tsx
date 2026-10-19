import { useState } from 'react';

function Login() {
    //const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    //const navigate = useNavigate();
    const [errorMessage] = useState(''); //setErrorMessage] = useState('');

    /*const logInUser = () => {
        if(username.length === 0 && password.length === 0) {
            setErrorMessage("Please enter a username and password")
        }
        else if(username.length === 0) {
          setErrorMessage("Please enter a username");
        }
        else if(password.length === 0) {
          setErrorMessage("Please enter a password");
        }
        else {
            axios.post('http://127.0.0.1:5000/login', {
                username: username,
                password: password
            })
            .then(function (response) {
                console.log(response);
                navigate("/");
            })
            .catch(function (error) {
                console.log(error, 'error');
                if (error.response.status === 401) {
                    setErrorMessage("Invalid credentials");
                }
            });
        }
    }*/

    return (
        <div className="flex items-center justify-center overflow-hidden">
            {/* Centered login card */}
            <div className="relative flex flex-col items-center w-full max-w-sm px-8 py-10">

                <h1 className="text-2xl font-bold text-center mb-1">Log In</h1>
                <p className="text-gray-600 mb-6">Glad you're back!</p>

                {/* Capture data, first email/username */}
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-1">
                        <label>Username</label>
                        <input
                            type="username"
                            placeholder="Username"
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
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 px-4 bg-gray-100 rounded-2xl text-zinc-600 focus:outline-2"
                        />
                    </div>

                    <button className="text-white font-bold bg-blue-400 hover:bg-blue-700 py-2 px-4 rounded-2xl">Sign In</button>
                </div>

                {/* Error display or create account*/}
                {errorMessage && <p className="text-center rounded-lg bg-red-100 text-red-800 outline-2 outline-red-800 mt-5 mb-1 px-2 py-3">{errorMessage}</p>}
                <div className="flex flex-col text-center items-center gap-2.5 mt-15 col-1">
                    <p className="text-black font-semibold">Don't have an account yet?</p>
                    <a href="/register" className="text-blue-400 hover:text-blue-700 font-semibold underline">Sign Up</a>
                    <a href="/" className="text-zinc-600 underline hover:text-blue-700 mt-5">Return Home</a>
                </div>
            </div>
        </div>
    )
}

export default Login