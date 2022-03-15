var cityList = [];
var id = "75ab4ea93723fe2846894413d4958934";

function storeCities() {
  localStorage.setItem("cities", JSON.stringify(cityList));
}
function createCityList() {
  $(".cityList").empty();
  cityList.forEach(function (city) {
    $(".cityList").prepend(
      $(
        `<button class="list-group-item list-group-item-action cityButton" data-city="${city}">${city}</button>`
      )
    );
  });
}

function init() {
  var storedCities = JSON.parse(localStorage.getItem("cities"));
  if (storedCities !== null) {
    cityList = storedCities;
  }
  createCityList();
  if (cityList) {
    var thisCity = cityList[cityList.length - 1];
    getCurrentWeather(thisCity, id);
    getForecast(thisCity, id);
  }
}
function getCurrentWeather(thisCity, id) {
  var weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${thisCity}&units=imperial&appid=${id}`;
  var cityLat;
  var cityLong;
  $.ajax({
    url: weatherURL,
    method: "GET",
  }).then(function (data) {
    console.log(data);
    $(".cityToday").append(
      `<div class="row ml-1">
                <h3 class="mr-3">${data.name} (${
        new Date(1000 * data.dt).getUTCMonth() + 1
      }/${new Date(1000 * data.dt).getUTCDate() - 1}/${new Date(
        1000 * data.dt
      ).getUTCFullYear()})</h3>
                <img src="http://openweathermap.org/img/w/${
                  data.weather[0].icon
                }.png">
            </div>`
    );
    $(".cityToday").append(`<p>Temperature: ${data.main.temp} &degF</p>`);
    $(".cityToday").append(`<p>Humidity: ${data.main.humidity} %</p>`);
    $(".cityToday").append(`<p>Wind: ${data.wind.speed} mph</p>`);
    cityLat = data.coord.lat;
    cityLong = data.coord.lon;
    getUVI(id, cityLat, cityLong);
  });
}
function getForecast(thisCity, id) {
  var forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${thisCity}&units=imperial&appid=${id}`;
  $.ajax({
    url: forecastURL,
    method: "GET",
  }).then(function (data) {
    for (i = 0; i < data.list.length; i++) {
      if (data.list[i].dt_txt.search("15:00:00") != -1) {
        var forecastDate = data.list[i];
        $(".forecast").append(
          `<div class="card bg-primary shadow m-4">
                        <div class="card-body">
                            <h4 class="card-title">${
                              new Date(1000 * forecastDate.dt).getUTCMonth() + 1
                            }/${new Date(
            1000 * forecastDate.dt
          ).getUTCDate()}/${new Date(
            1000 * forecastDate.dt
          ).getUTCFullYear()}</h4>
                            <div class="card-text">
                                <img src="http://openweathermap.org/img/w/${
                                  forecastDate.weather[0].icon
                                }.png">
                                <p class="card-text">Temp: ${
                                  forecastDate.main.temp
                                } &degF</p>
                                <p class="card-text">Humidity: ${
                                  forecastDate.main.humidity
                                } %</p>
                            </div>
                        </div>
                    </div>`
        );
      }
    }
  });
}
function getUVI(id, cityLat, cityLong) {
  var uvURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${cityLat}&lon=${cityLong}&appid=${id}`;
  var color = "secondary";
  $.ajax({
    url: uvURL,
    method: "GET",
  }).then(function (data) {
    if (data.value >= 6) {
      color = "danger";
    } else if (data.value >= 3) {
      color = "warning";
    } else {
      color = "success";
    }
    $(".cityToday").append(
      `<p>UV Index: <span class="badge badge-${color} p-2">${data.value}</span></p>`
    );
  });
}
function displayCityWeather() {
  var thisCity = $(this).attr("data-city");
  $(".cityToday").empty();
  getCurrentWeather(thisCity, id);
  $(".forecast").empty();
  getForecast(thisCity, id);
}
init();

$("form").on("submit", function (event) {
  event.preventDefault();
  console.log("it works!");
  var newCity = $("#citySearchInput").val().trim();
  if (newCity !== "") {
    cityList.push(newCity);
    console.log(newCity);
    createCityList();
    storeCities();
    $("#citySearchInput").val("");
    location.reload();
  }
});

$(".cityList").on("click", ".cityButton", displayCityWeather);
