import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

function Navbar() {
    return (
        <div>
            <div className="flex justify-between items-center h-16 font-semibold bg-blue-200 p-6 px-2">
                <div className="md:flex space-x-8">
                    <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
                    <div className="flex justify-left">
                        <a href="/login" className="mr-6">Login</a>
                        <a href="/register">Register</a>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

export default Navbar