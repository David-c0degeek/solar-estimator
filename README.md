# Solar Energy Estimator

This is a web application that estimates solar panel energy generation based on location and system parameters.

## Features

- Address-based solar radiation estimation
- Monthly and annual energy generation projections
- Financial savings calculations
- CO2 offset estimations
- Responsive design with visualization charts

## How to Use

1. Open `index.html` in a modern web browser
2. Enter an address or city (the application currently supports major US cities)
3. Configure your solar system size (kW)
4. Set your local electricity price ($/kWh)
5. Click "Calculate Solar Potential"
6. View the detailed breakdown of your solar energy estimates

## Technical Details

This application uses:
- React for the user interface
- Chart.js for data visualization
- Tailwind CSS for styling
- A simplified solar radiation model based on latitude and season

## Limitations

This is a demonstration application with the following limitations:

- Geocoding is simplified and works primarily with major US cities
- Solar radiation estimates are approximations based on latitude and season
- The model does not account for specific roof orientation, shading, or local weather patterns
- In a production environment, this would connect to an external solar radiation database

## Future Improvements

- Integration with NREL's Solar Resource API for more accurate data
- Support for international locations
- Roof orientation and tilt adjustments
- Integration with Google Maps for address validation
- Panel efficiency options