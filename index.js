import { Header, Footer, Main, Nav } from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { capitalize } from "lodash";
import axios from "axios";

const router = new Navigo("/");

function render(state = store.Home) {
  document.querySelector("#root").innerHTML = `
  ${Header(state)}
  ${Nav(store.Links)}
  ${Main(state)}
  ${Footer()}
  `;
  // afterRender(state);
  router.updatePageLinks();
}

// function afterRender(state) {
//   if (state.view === "Solo") {
//   }
// }

router.hooks({
  before: (done, params) => {
    const view =
      params && params.data && params.data.view
        ? capitalize(params.data.view)
        : "Home";

    // Add a switch case statement to handle multiple routes
    switch (view) {
      case "Home":
        axios
          .get(
            `https://api.openweathermap.org/data/2.5/weather?q=st%20louis&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}`
          )
          .then(response => {
            const kelvinToFahrenheit = kelvinTemp =>
              Math.round((kelvinTemp - 273.15) * (9 / 5) + 32);

            store.Home.weather = {};
            store.Home.weather.city = response.data.name;
            store.Home.weather.temp = kelvinToFahrenheit(
              response.data.main.temp
            );
            store.Home.weather.feelsLike = kelvinToFahrenheit(
              response.data.main.feels_like
            );
            store.Home.weather.description = response.data.weather[0].main;
            done();
          })
          .catch(err => console.log(err));
        break;

      case "Solo":
        axios
          .get(
            `https://developer.nps.gov/api/v1/activities/parks?parkCode=acad&api_key=${process.env.NATIONAL_PARK_API_KEY}`
          )
          .then(response => {
            console.log(response.data.data[0]);
            store.Solo.parks.fullName = response.data.data[0].parks[0].fullName;
            store.Solo.parks.states = response.data.data[0].parks[0].states;
            store.Solo.parks.activity = response.data.data[0].name;
            store.Solo.parks.url = response.data.data[0].parks[0].url;
            done();
          })
          .catch(err => console.log(err));
        break;
      default:
        done();
    }
  }
});

router
  .on({
    "/": () => render(),
    ":view": params => {
      let view = capitalize(params.data.view);
      render(store[view]);
    }
  })
  .resolve();
