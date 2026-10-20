import { useEffect, useState } from 'react';
import RegionCard from '../components/RegionCard';
import type { Region } from '../types/types';

function Home() {
  const [regions, setRegions] = useState<Region[]>([]); // List of regions
  const [loading, setLoading] = useState(true); // Loading regions 
  const [error, setError] = useState('');
  const [username, setUsername] = useState(''); // Default will not be logged in 
  const [loggedIn, setLoggedIn] = useState(false);

  // Checks if user is logged in to see if lets them access stuff or not
  useEffect(() => {
    let ignore = false;

    async function getSession() {
      try {
        const response = await fetch('/api/accounts/session');

        // Not logged in might be normal, just checks and exits
        if (response.status === 401) {
          if (!ignore) {
            setUsername('');
            setLoggedIn(false);
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`Could not fetch session (${response.status})`);
        }

        // Gets result of session
        const checkSession = await response.json();

        // There is something defined
        if (checkSession["username"]) {
          // Checks the results of the session
          setUsername(checkSession["username"]);
          setLoggedIn(true);
        } else {
          setUsername('');
          setLoggedIn(false);
        }
      }
      catch (error) {
        if (!ignore) {
          // So it did get the request but could not set them 
          setError(error instanceof Error ? error.message : 'Could not check if user is logged in');
        }
      }
    }

    // Call function itself
    getSession();

    return () => {
      ignore = true;
    };
  }, [])

  // When page loads, it should get all of the reports
  useEffect(() => {
    let ignore = false;

    // Uses here the flask api route to fetch the region reports
    async function loadRegions() {
      try {
        const response = await fetch('/api/reports/regions');

        // Error loadign region
        if (!response.ok) {
          throw new Error(`Could not load reports (${response.status})`);
        }

        // Recieves data 
        const data: Region[] = await response.json();

        if (!ignore) {
          // Tries to establish the regions that should have been obtained 
          setRegions(data);
        }
      } catch (error) {
        if (!ignore) {
          // So it did get the request but could not set them 
          setError(error instanceof Error ? error.message : 'Could not reports');
        }
      } finally {
        // Did work, so finished loading 
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    // Calll funct to load regions 
    loadRegions();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="p-6 px-2">
      {/* Header with report and button to make a report */}
      <div className="flex  w-full items-center justify-between p-4">
        {/* Left side */}
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Road Report</h1>
          <h2 className="text-xl mb-2">Find out what the road conditions are like in Brisbane to plan your morning ride!</h2>
          {loggedIn ? <p>Welcome back {username}!</p> : <p>Log in to make reports!</p>}
        </div>

        {/* Will be the button to make a report */}
        <div>
          <button className="text-white font-bold bg-blue-400 hover:bg-blue-700 py-4 px-4 rounded-2xl">+ Make report</button>
        </div>
      </div>

      {/* Iterate over it to pass the region cards, one row is one region card so it autogenerates them */}
      {loading && <p>Loading regions...</p>}
      {error && <p role="alert">{error}</p>}

      <div className="mt-2">
        {regions.map((region) => (
          <RegionCard
            key={region.id}
            id={region.id}
            name={region.name}
          />
        ))}
      </div>
    </div>
  )
}

export default Home