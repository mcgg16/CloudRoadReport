import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

function Navbar() {
    return (
        <div>
            <div className="flex justify-between h-16 bg-blue">
                <div className="md:flex space-x-8 items-center">
                    <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
                    <a href="/login">Login</a>
                </div>
            </div>
        </div>
    )
}

export default Navbar