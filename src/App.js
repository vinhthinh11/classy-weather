import React from 'react';
function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], '☀️'],
    [[1], '🌤'],
    [[2], '⛅️'],
    [[3], '☁️'],
    [[45, 48], '🌫'],
    [[51, 56, 61, 66, 80], '🌦'],
    [[53, 55, 63, 65, 57, 67, 81, 82], '🌧'],
    [[71, 73, 75, 77, 85, 86], '🌨'],
    [[95], '🌩'],
    [[96, 99], '⛈'],
  ]);
  const arr = [...icons.keys()].find(key => key.includes(wmoCode));
  if (!arr) return 'NOT FOUND';
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

class App extends React.Component {
  state = {
    city: '',
    isLoading: false,
    error: '',
    displayLocation: '',
    weather: {},
  };

  fecthWeather = async () => {
    this.setState({ error: '' });
    if (!this.state.city) {
      this.setState({ error: 'Please select a city' });
      return this.setState({ weather: {} });
    }
    try {
      this.setState({ isLoading: true });

      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.city}&`
      );
      const geoData = await geoRes.json();

      if (!geoData.results) throw new Error('Location not found');

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);
      console.log(`${name} ${convertToFlag(country_code)}`);
      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
    } catch (err) {
      console.error(err);
      this.setState({ error: err.message });
    } finally {
      this.setState({ isLoading: false });
    }
  };
  setCity = e => {
    e.preventDefault();
    this.setState({ city: e.target.value });
  };
  componentDidMount = () => {
    this.fecthWeather();
    this.setState({ city: localStorage.getItem('city') || '' });
  };
  componentDidUpdate = (preProps, preState) => {
    if (this.state.city !== preState.city) {
      this.fecthWeather();
      localStorage.setItem('city', this.state.city);
    }
  };

  render() {
    return (
      <div className="app">
        <form
          onSubmit={e => {
            e.preventDefault();
            this.fecthWeather();
          }}
        >
          <div>
            <h1>Classy weather</h1>
            <div>
              <Input city={this.state.city} setCity={this.setCity} />
            </div>
            <div>
              <button onClick={this.fecthWeather}>Get the weather</button>
              {this.state.isLoading ? (
                <p className="loader">Loading weather ...</p>
              ) : (
                <></>
              )}
              {this.state.error && <p className="error">{this.state.error}</p>}
              {!this.state.error &&
                this.state.weather.weathercode &&
                !this.state.isLoading &&
                this.state.city && (
                  <Weather
                    location={this.state.displayLocation}
                    weather={this.state.weather}
                  />
                )}
            </div>
          </div>
        </form>
      </div>
    );
  }
}
export default App;

class Input extends React.Component {
  render() {
    return (
      <input
        type="text"
        placeholder="Enter the city you want to check the current weahter"
        value={this.props.city}
        onChange={this.props.setCity}
      />
    );
  }
}

// create them 1 class the su dung nhu Weather component
class Weather extends React.Component {
  componentWillUnmount = () => {
    console.log('this component is unmounted');
  };
  // khi city cua input nhap vao thay doi thi can phai update lai weather component => state weather
  render() {
    const {
      weather: {
        temperature_2m_max: max,
        temperature_2m_min: min,
        time: date,
        weathercode,
      },
      location,
    } = this.props;
    return (
      <div>
        <h2>Weather {location}</h2>
        <ul className="weather">
          {date.map((value, i) => (
            <Date
              key={i}
              date={value}
              min={min.at(i)}
              max={max.at(i)}
              weathercode={weathercode.at(i)}
            />
          ))}
        </ul>
      </div>
    );
  }
}
class Date extends React.Component {
  render() {
    // destructure
    const { date, min, max, weathercode: code } = this.props;
    return (
      <li className="day">
        <span>{getWeatherIcon(code)}</span>
        <p>{date}</p>
        <p>
          <strong>{min}&deg;</strong> &mdash; <strong>{max}&deg;</strong>
        </p>
      </li>
    );
  }
}
