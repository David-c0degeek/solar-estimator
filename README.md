# Solar Energy Estimator

This is a web application that estimates solar panel energy generation based on location and system parameters, using real-world data from public APIs.

## Features

- Address-based solar radiation estimation using real geocoding data
- Solar radiation data from NREL's Solar Resource Data API
- Roof orientation and angle adjustments
- Monthly and annual energy generation projections
- Financial savings calculations
- CO2 offset estimations
- Responsive design with visualization charts

## APIs Used

1. **OpenCage Geocoding API**
   - Converts addresses to precise latitude/longitude coordinates
   - Provides formatted address information
   - Used with a demo API key (rate limited)

2. **NREL Solar Resource Data API**
   - Provides solar radiation data based on location
   - Returns monthly and annual averages for global horizontal irradiance
   - Used with a demo API key (rate limited)

## How to Use

1. Open `index.html` in a modern web browser
2. Enter an address or city
3. Configure your solar system size (kW)
4. Set your local electricity price ($/kWh)
5. Adjust roof angle and orientation
6. Click "Calculate Solar Potential"
7. View the detailed breakdown of your solar energy estimates

## Calculation Methodology

The application employs a multi-step process to estimate solar energy generation:

1. Geocode the address to obtain latitude/longitude
2. Retrieve location-specific solar radiation data 
3. Apply corrections for roof orientation and angle
4. Calculate monthly energy generation using the formula:
   `Energy = System Size × Solar Radiation × Efficiency × Days in Month × Orientation Factor × Angle Factor`
5. Calculate financial savings and environmental impact

If API data is unavailable, the application falls back to a mathematical model based on latitude and season.

## Technical Details

This application uses:
- React for the user interface
- Chart.js for data visualization
- Axios for API requests
- Tailwind CSS for styling

## Orientation and Angle Factors

The application accounts for panel positioning:

- **Orientation factors:**
  - South: 100% (optimal in Northern Hemisphere)
  - East/West: 85% 
  - North: 65%

- **Angle factors:**
  - Optimal angle is considered to be 30° for this demonstration
  - Performance decreases as the angle deviates from optimal
  - Minimum performance is capped at 70% of optimal

## Limitations

- API keys are limited to demo usage rates
- Solar radiation estimates don't account for local shading or microclimate
- Weather pattern variations year-to-year are not considered
- Financial calculations don't include system installation costs or maintenance

## Future Improvements

- Integration with solar panel installation cost estimators
- Support for multiple system configurations (different panel types)
- Detailed financial analysis with ROI calculations
- Weather data integration for more accurate yearly predictions
- 3D visualization of panel placement on roofs
- Integration with utility company rate structures
- Mobile app version with location services

## Installation for Development

1. Clone the repository:
   ```
   git clone https://github.com/David-c0degeek/solar-estimator.git
   ```

2. Open the project directory:
   ```
   cd solar-estimator
   ```

3. Open `index.html` in your browser or use a local development server

## API Keys

The application uses demo API keys which have usage limitations. For production use, you should:

1. Register for your own API keys at:
   - OpenCage: https://opencagedata.com/
   - NREL: https://developer.nrel.gov/

2. Replace the API keys in the application:
   ```javascript
   // In app.js
   const ApiUtils = {
     nrelApiKey: "YOUR_NREL_API_KEY",
     geocodingApiKey: "YOUR_OPENCAGE_API_KEY",
     // ...
   };
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [NREL](https://www.nrel.gov/) for providing solar resource data
- [OpenCage](https://opencagedata.com/) for geocoding services
- [React](https://reactjs.org/) for the UI framework
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com/) for styling