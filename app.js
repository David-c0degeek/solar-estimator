// Solar Energy Estimator Application

// Utility functions for solar calculations
const SolarUtils = {
  // Estimate solar radiation based on latitude and time of year
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
  calculateAnnualGeneration: (latitude, systemSizeKW) => {
    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let annualTotal = 0;
    
    for (let i = 0; i < 12; i++) {
      const radiation = SolarUtils.estimateSolarRadiation(latitude, i);
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i];
      const monthlyGeneration = SolarUtils.calculateEnergyGeneration(systemSizeKW, radiation) * daysInMonth;
      
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
  
  // Geocode address to get latitude/longitude using a mock function
  // In a real app, this would connect to a geocoding API
  geocodeAddress: async (address) => {
    // For demo purposes, return mock data based on city names
    // In a production app, use a real geocoding service
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
        return cityCoordinates[city];
      }
    }
    
    // Default fallback if no city is found (use a central US location)
    return { lat: 39.8283, lng: -98.5795 };
  }
};