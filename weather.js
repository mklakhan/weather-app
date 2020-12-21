$(document).ready(function () {
   // localStorage.clear()
   console.log(localStorage.getItem('searches')); 
   var myresults = localStorage.getItem('searches') 
   var parsedData = JSON.parse(myresults)
  // parsedData[parsedData.length-1]
    var searches = JSON.parse(localStorage.getItem("searches")) || [];

    // Searches in local storage
    function renderHistory() {
        $("#search-history").empty();

        // Search History - last 10
        var lastTen = searches.slice(0, 10);
        for (var i = 0; i < lastTen.length; i++) {
            $("#search-history").append($("<a href='' class='city list-group-item'>").text(lastTen[i]));
        };
    };

    // Event listener on search submit
    $("form").on("submit", function (event) {
        event.preventDefault();

        // Return city from input
        var city = $("#search").val().trim();

        // Weather data from API 
        searchCityForTemps(city)
    

        // UV data 
        


        // 5 day forecast from API
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=b027a244f5303ae877ccc26ea82e7a28",
            method: "GET"
        }).then(function (response) {
            $("#weather-tiles").empty();

            // current date within title 
            for (var i = 1; i < 6; i++) {
                var tile = $("<div>")
                 tile.attr("style", "margin-right: 10px; padding-top: -15px");
                 tile.attr("class", "bg-primary");
                var tileCol = $("<div class='col-md-2 bg-primary'>");
                var title = $("<h5>");
                var img = $("<img>").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + ".png").attr("style", "width: 100px;")
                var p1 = $("<p>").text("Temp: " + response.list[i].main.temp_max + " °F");
                var p2 = $("<p>").text("Humidity: " + response.list[i].main.humidity + "%");

                $("#weather-tiles").append(tile.append(tileCol.append((title).text(moment().add(i, "day").format('L')), img, p1, p2)))
            }
        });
    });

    $(document).on("click", ".city", function () {
    });

    function searchCityForTemps(city) {
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=b027a244f5303ae877ccc26ea82e7a28`,
            method: "GET"
        }).then(function (response) {
            // Add city to last ten search history
            if (!searches.includes(response.name)) {
                searches.push(response.name);
            }
            localStorage.setItem("searches", JSON.stringify(searches));
            $("#search").val("");
            renderHistory();

            // Data within current weather 
            var box = $("#current-weather");
            box.append($("#City").text(response.name + " (" + moment().format('L') + ")"));
            box.append($("#Temperature").text("Current Temperature (F): " + response.main.temp.toFixed(2)));
            box.append($("#Humidity").text("Humidity: " + response.main.humidity + "%"));
            box.append($("#Wind_Speed").text("Wind Speed: " + response.wind.speed + " MPH"));
            $("#current-weather").append(box);

            // Pass lat lon to UV data
            var cityCoord = [response.coord.lat, response.coord.lon];
            getUVindex(cityCoord);
        });   
    }
    function getUVindex(cityCoord) {
        // current UV data for current city
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/uvi?lat=${cityCoord[0]}&lon=${cityCoord[1]}&appid=b027a244f5303ae877ccc26ea82e7a28`,
            method: "GET"
        }).then(function (response) {
            var currentWeather = $("#current-weather");
            // $("#UV_Index").html(`UV Index: <span class="bg-success" style="display: inline-block; padding: 5px;" >${response.value}</span>`);
            // $("#UV_Index").attr('class', 'bg-success');

            // currentWeather.append($("#UV_Index").text("UV Index: " + response.value));
            var uvStatus;
            if(response.value < 3) {
                uvStatus = 'bg-success'
            } else if (response.value >= 3 && response.value <=5) {
                uvStatus = 'bg-warning'
            } else {
                uvStatus = 'bg-danger'
            }

            currentWeather.append($("#UV_Index").html(`UV Index: <span class="${uvStatus}" style="display: inline-block; padding: 5px;" >${response.value}</span>`));
        });
    };


    renderHistory();
});