// Solar Energy Estimator Application

// API Integration for real world data
const ApiUtils = {
  // NREL API key - normally would be stored securely, but for demo purposes
  nrelApiKey: "DEMO_KEY",
  
  // OpenCage Geocoding API key - normally would be stored securely
  geocodingApiKey: "77c8845a85cc43c1b91fd62a51ff32bd",
  
  // Geocode address to get latitude/longitude using OpenCage Geocoding API
  geocodeAddress: async (address) => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodedAddress}&key=${ApiUtils.geocodingApiKey}`);
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          lat: result.geometry.lat,
          lng: result.geometry.lng,
          formattedAddress: result.formatted
        };
      } else {
        throw new Error("No geocoding results found");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      
      // Fallback to mock data in case of API failure
      return SolarUtils.mockGeocodeAddress(address);
    }
  },
  
  // Get solar resource data from NREL's API
  getSolarResource: async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${ApiUtils.nrelApiKey}&lat=${lat}&lon=${lng}`
      );
      
      if (response.data && response.data.outputs) {
        // Extract monthly averages from the API response
        const avgDni = response.data.outputs.avg_dni.monthly;
        const avgGhi = response.data.outputs.avg_ghi.monthly;
        
        // Return monthly solar radiation data (we'll use GHI - Global Horizontal Irradiance)
        return {
          // API returns data as object with keys 1-12, convert to array
          monthlyRadiation: Object.values(avgGhi),
          annualAverage: response.data.outputs.avg_ghi.annual
        };
      } else {
        throw new Error("No solar resource data found");
      }
    } catch (error) {
      console.error("Solar resource API error:", error);
      
      // Fallback to calculated values in case of API failure
      return null;
    }
  }
};

// Utility functions for solar calculations
const SolarUtils = {
  // Backup method: Estimate solar radiation based on latitude and time of year
  estimateSolarRadiation: (latitude, month) => {
    // This is a simplified model based on latitude and month
    const baseRadiation = 5.0; // kWh/m²/day base value
    
    // Adjust for latitude (solar intensity decreases as you move away from equator)
    const latitudeAdjustment = Math.cos(Math.abs(latitude) * Math.PI / 180) * 2;
    
    // Adjust for season (northern/southern hemisphere)
    let seasonAdjustment;
    const isNorthernHemisphere = latitude >= 0;
    
    if (isNorthernHemisphere) {
      // Northern hemisphere: more sun in summer (May-Aug)
      seasonAdjustment = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7][month];
    } else {
      // Southern hemisphere: more sun in Dec-Feb
      seasonAdjustment = [1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2][month];
    }
    
    return baseRadiation * latitudeAdjustment * seasonAdjustment;
  },
  
  // Calculate energy generation based on system size, efficiency, and solar radiation
  calculateEnergyGeneration: (systemSizeKW, solarRadiation, efficiency = 0.75) => {
    // Formula: System size (kW) × solar radiation (kWh/m²/day) × efficiency factor
    return systemSizeKW * solarRadiation * efficiency;
  },
  
  // Calculate monthly energy generation for a full year
  calculateAnnualGeneration: (latitude, systemSizeKW, monthlyRadiation = null) => {
    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    let annualTotal = 0;
    
    for (let i = 0; i < 12; i++) {
      // Use either API data or calculated radiation
      const radiation = monthlyRadiation ? monthlyRadiation[i] : SolarUtils.estimateSolarRadiation(latitude, i);
      const monthlyGeneration = SolarUtils.calculateEnergyGeneration(systemSizeKW, radiation) * daysInMonth[i];
      
      annualTotal += monthlyGeneration;
      
      monthlyData.push({
        month: months[i],
        radiation: radiation.toFixed(2),
        generation: monthlyGeneration.toFixed(2),
        daily: SolarUtils.calculateEnergyGeneration(systemSizeKW, radiation).toFixed(2)
      });
    }
    
    return {
      monthlyData,
      annualTotal: annualTotal.toFixed(2)
    };
  },
  
  // Rough estimate of CO2 offset based on energy generation
  estimateCO2Offset: (kwhGenerated) => {
    // Average CO2 emissions per kWh of electricity: ~0.4 kg CO2
    return (kwhGenerated * 0.4).toFixed(2);
  },
  
  // Estimate savings based on energy generation and electricity price
  estimateSavings: (kwhGenerated, electricityPrice) => {
    return (kwhGenerated * electricityPrice).toFixed(2);
  },
  
  // Mock geocode function as fallback when API fails
  mockGeocodeAddress: (address) => {
    // For demo purposes, return mock data based on city names
    const cityCoordinates = {
      'new york': { lat: 40.7128, lng: -74.0060 },
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'houston': { lat: 29.7604, lng: -95.3698 },
      'phoenix': { lat: 33.4484, lng: -112.0740 },
      'philadelphia': { lat: 39.9526, lng: -75.1652 },
      'san antonio': { lat: 29.4241, lng: -98.4936 },
      'san diego': { lat: 32.7157, lng: -117.1611 },
      'dallas': { lat: 32.7767, lng: -96.7970 },
      'san francisco': { lat: 37.7749, lng: -122.4194 },
      'seattle': { lat: 47.6062, lng: -122.3321 },
      'denver': { lat: 39.7392, lng: -104.9903 },
      'boston': { lat: 42.3601, lng: -71.0589 },
      'atlanta': { lat: 33.7490, lng: -84.3880 },
      'miami': { lat: 25.7617, lng: -80.1918 },
    };
    
    // Try to find a matching city
    const lowercaseAddress = address.toLowerCase();
    
    for (const city in cityCoordinates) {
      if (lowercaseAddress.includes(city)) {
        return {
          ...cityCoordinates[city],
          formattedAddress: address
        };
      }
    }
    
    // Default fallback if no city is found (use a central US location)
    return { 
      lat: 39.8283, 
      lng: -98.5795,
      formattedAddress: address
    };
  }
};

// AddressForm Component
const AddressForm = ({ onSubmit, loading }) => {
  const [address, setAddress] = React.useState('');
  const [systemSize, setSystemSize] = React.useState(5);
  const [electricityPrice, setElectricityPrice] = React.useState(0.15);
  const [roofAngle, setRoofAngle] = React.useState(30);
  const [orientation, setOrientation] = React.useState('south');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      address,
      systemSize: parseFloat(systemSize),
      electricityPrice: parseFloat(electricityPrice),
      roofAngle: parseInt(roofAngle, 10),
      orientation
    });
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Enter Your Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address or City
          </label>
          <input
            type="text"
            id="address"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            placeholder="Enter your address or city"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="systemSize" className="block text-sm font-medium text-gray-700">
            Solar System Size (kW)
          </label>
          <input
            type="number"
            id="systemSize"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            value={systemSize}
            onChange={(e) => setSystemSize(e.target.value)}
            min="1"
            max="50"
            step="0.5"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Typical residential systems range from 3kW to 10kW</p>
        </div>
        
        <div>
          <label htmlFor="electricityPrice" className="block text-sm font-medium text-gray-700">
            Electricity Price ($/kWh)
          </label>
          <input
            type="number"
            id="electricityPrice"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            value={electricityPrice}
            onChange={(e) => setElectricityPrice(e.target.value)}
            min="0.05"
            max="1"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label htmlFor="roofAngle" className="block text-sm font-medium text-gray-700">
            Roof Angle (degrees)
          </label>
          <input
            type="range"
            id="roofAngle"
            className="mt-1 block w-full"
            value={roofAngle}
            onChange={(e) => setRoofAngle(e.target.value)}
            min="0"
            max="60"
            step="5"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0° (Flat)</span>
            <span>{roofAngle}°</span>
            <span>60° (Steep)</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Roof Orientation
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['north', 'east', 'south', 'west'].map((dir) => (
              <button
                key={dir}
                type="button"
                className={`py-2 px-4 border rounded-md text-sm capitalize ${
                  orientation === dir
                    ? 'bg-blue-600 border-blue-700 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setOrientation(dir)}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white solar-gradient focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
            ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Calculate Solar Potential'}
        </button>
      </form>
    </div>
  );
};

// Results Component
const ResultsDisplay = ({ results }) => {
  const chartRef = React.useRef(null);
  const [chart, setChart] = React.useState(null);
  
  React.useEffect(() => {
    if (!results || !results.monthlyData) return;
    
    // Prepare chart data
    const labels = results.monthlyData.map(item => item.month);
    const data = results.monthlyData.map(item => parseFloat(item.generation));
    
    if (chart) {
      chart.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monthly Energy Generation (kWh)',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Monthly Solar Energy Generation'
          },
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Energy (kWh)'
            }
          }
        }
      }
    });
    
    setChart(newChart);
    
    // Cleanup function
    return () => {
      newChart.destroy();
    };
  }, [results]);
  
  if (!results) return null;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Solar Energy Estimate Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-blue-900">Annual Generation</h3>
          <p className="text-3xl font-bold text-blue-700">{results.annualTotal} kWh</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-green-900">Annual Savings</h3>
          <p className="text-3xl font-bold text-green-700">${results.annualSavings}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-yellow-900">CO₂ Offset</h3>
          <p className="text-3xl font-bold text-yellow-700">{results.co2Offset} kg</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Location Information</h3>
        <p><span className="font-medium">Address:</span> {results.formattedAddress}</p>
        <p><span className="font-medium">Latitude:</span> {results.latitude}°</p>
        <p><span className="font-medium">Estimated Average Solar Radiation:</span> {results.averageRadiation} kWh/m²/day</p>
        <p><span className="font-medium">Roof Orientation:</span> <span className="capitalize">{results.orientation}</span></p>
        <p><span className="font-medium">Roof Angle:</span> {results.roofAngle}°</p>
        <p className="text-xs text-gray-500 mt-2">{results.dataSource}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Monthly Generation</h3>
        <div className="h-64">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solar Radiation (kWh/m²/day)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Generation (kWh)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Generation (kWh)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.monthlyData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.radiation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.daily}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.generation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Note:</strong> These estimates are based on {results.apiData ? 'real world solar radiation data' : 'simplified calculations'} and may vary from actual production. 
        Factors such as shading, specific panel efficiency, and local weather patterns will affect real-world results.</p>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [results, setResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Geocode the address to get latitude/longitude
      const geoData = await ApiUtils.geocodeAddress(formData.address);
      
      // Try to get solar resource data from NREL API
      let solarData = null;
      let monthlyRadiation = null;
      let dataSource = "Calculated estimates based on location and time of year";
      let apiData = false;
      
      try {
        solarData = await ApiUtils.getSolarResource(geoData.lat, geoData.lng);
        if (solarData) {
          monthlyRadiation = solarData.monthlyRadiation;
          dataSource = "NREL Solar Resource Data API";
          apiData = true;
        }
      } catch (apiError) {
        console.warn("Using fallback solar calculations:", apiError);
      }
      
      // Apply adjustments for roof orientation and angle
      const orientationFactor = getOrientationFactor(formData.orientation);
      const angleFactor = getAngleFactor(formData.roofAngle);
      const adjustmentFactor = orientationFactor * angleFactor;
      
      // Calculate solar generation based on location and system size
      const generationData = SolarUtils.calculateAnnualGeneration(geoData.lat, formData.systemSize * adjustmentFactor, monthlyRadiation);
      
      // Calculate CO2 offset and savings
      const co2Offset = SolarUtils.estimateCO2Offset(generationData.annualTotal);
      const annualSavings = SolarUtils.estimateSavings(generationData.annualTotal, formData.electricityPrice);
      
      // Calculate average solar radiation
      const totalRadiation = generationData.monthlyData.reduce((sum, month) => sum + parseFloat(month.radiation), 0);
      const averageRadiation = (totalRadiation / 12).toFixed(2);
      
      // Set the results
      setResults({
        ...generationData,
        co2Offset,
        annualSavings,
        latitude: geoData.lat.toFixed(4),
        longitude: geoData.lng.toFixed(4),
        formattedAddress: geoData.formattedAddress,
        averageRadiation,
        orientation: formData.orientation,
        roofAngle: formData.roofAngle,
        dataSource,
        apiData
      });
    } catch (err) {
      setError('Error calculating solar potential. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to adjust for roof orientation
  const getOrientationFactor = (orientation) => {
    const factors = {
      'south': 1.0,   // Optimal
      'east': 0.85,   // Good morning sun
      'west': 0.85,   // Good afternoon sun
      'north': 0.65   // Poorest for northern hemisphere
    };
    return factors[orientation] || 1.0;
  };
  
  // Helper function to adjust for roof angle
  const getAngleFactor = (angle) => {
    // Assume optimal angle is latitude-dependent (simplified)
    // For this demo, we'll say 30° is optimal
    const optimalAngle = 30;
    const angleDiff = Math.abs(angle - optimalAngle);
    
    // Less efficient as we move away from optimal, with a floor of 70% efficiency
    return Math.max(1 - (angleDiff * 0.01), 0.7);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900">Solar Energy Estimator</h1>
        <p className="text-gray-600 mt-2">Estimate your potential solar energy production and savings using real-world data</p>
      </header>
      
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <AddressForm onSubmit={handleFormSubmit} loading={loading} />
          </div>
          
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 p-4 rounded-lg shadow-md text-red-700 mb-4">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-lg text-gray-600">Calculating solar potential...</p>
                <div className="mt-4 flex justify-center">
                  <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            ) : results ? (
              <ResultsDisplay results={results} />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl text-gray-600 mt-4">Enter your address to calculate your solar potential</h3>
                <p className="text-gray-500 mt-2">Get an estimate of how much energy solar panels could generate at your location</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Solar Energy Estimator | Demo Application</p>
        <p className="mt-1">Data powered by OpenCage Geocoding API and NREL's Solar Resource Data API</p>
        <p className="mt-1">Note: This application is for educational purposes and preliminary estimates only.</p>
      </footer>
    </div>
  );
};

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));