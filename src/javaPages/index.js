var btn = document.querySelector("#btn");
var input = document.querySelector("#text");
var form = document.querySelector("#login-form");
var message = document.querySelector("#message");

btn.addEventListener("click", function() {
    var val = input.value;
    window.api.getPokemon(val);
});

window.api.onPokemonData(function(data) {
    console.log(data);
    var name = document.querySelector("h2");
    var img = document.querySelector("#picture");
    if (data.sprites) {
        
        img.src=data.sprites.front_shiny;
        name.innerHTML = data.name;
    } else {
        //name="pokemon not found";
        message.innerHTML = data;
        message.style.color = "red";
    }
    
});

form.addEventListener("submit", function(event) { 
    event.preventDefault(); // Prevent the default form submission
    var username = document.querySelector("#username").value;
    var password = document.querySelector("#password").value;
    window.api.logIn(username, password);
});

window.api.logInResponse(function(data) {
    var message = document.querySelector("#message");
    if (data.success) {
        message.innerHTML = data.message;
        message.style.color = "green";
        document.querySelector("#greeting").innerHTML = "Welcome " + data.username;
    } else {
        message.innerHTML = data.message;
        message.style.color = "red";
    }
});