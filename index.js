let navContent = document.getElementById("navigation");
let mainContent = document.getElementById("content");
let navGen = document.querySelector("#tabs > ul");

let pokemonSelected = {};
let pokemonsList = [];
let pokemonsListFiltered = [];
let allPokemons = [];
let versionState = 0;
let pageState = 1;
let nbByPage = 20;

let generations = [{
    generation: 1,
    start: 1,
    end: 151
}, {
    generation: 2,
    start: 152,
    end: 251
}, {
    generation: 3,
    start: 252,
    end: 386
}, {
    generation: 4,
    start: 387,
    end: 493
}, {
    generation: 5,
    start: 494,
    end: 649
}, {
    generation: 6,
    start: 650,
    end: 722
}];
let types = ["", "bug", "dark", "dragon", "electric", "fairy", "fighting", "fire", "flying", "ghost", "grass", "ground", "ice", "normal", "poison", "psychic", "rock", "steel", "water"];
let filter = "";

// Create navigation menu for generations
generations.forEach((e, i) => {
    let li = document.createElement("li");
    li.textContent = `${i + 1}G`;
    li.setAttribute("data-id", i);
    li.onclick = function () {
        versionState = i;
        pageState = 1;
        createList();
        checkActiveGen();
    };
    navGen.appendChild(li);
});
checkActiveGen();

// INITIALIZATION !!

axios.get("https://pokeapi.co/api/v2/pokemon?limit=721").then(response => {
    generateListAllPokemons(response.data.results);
}).catch(function (error) {
    console.log(error)
});

// Generate list of all pokemon to database in allPokemons
function generateListAllPokemons(list) {
    list.forEach(e => {
        allPokemons.push(e);
    });
    createList();
}

// Create and show the list of pokemons for the selected generation
function createList() {
    activateFilter();
    let pokemonInPage = [];
    if (filter === "") {
        getGenList();
        pokemonInPage = selectPokemonFromPage();
    } else {
        pokemonInPage = selectPokemonFiltered();
    }
    renderListNav(pokemonInPage);
}

// CHECK TAB & FILTER ACTIVATED

function checkActiveGen() {
    let list = document.querySelectorAll("#tabs li");
    list.forEach(e => e.classList.remove("active"));
    list.item(versionState).classList.add("active");
}

function checkActiveFilter() {
    let list = document.querySelectorAll("aside .filters li");
    list.forEach(e => e.classList.remove("active"));
    list.item(types.indexOf(filter)).classList.add("active");
    console.log(filter);
    console.log(types.indexOf(filter));
}

function clearList() {
    pokemonsList = [];
    navContent.innerHTML = "";
}

// Create pagination to only show pages of nbByPage pokemons
function pagination() {
    let leftArrow = document.createElement("button");
    leftArrow.textContent = "<<";
    leftArrow.classList.add("button");
    leftArrow.onclick = function () {
        if (pageState === 1)
            return;
        pageState--;
        createList();
    };
    let rightArrow = document.createElement("button");
    rightArrow.textContent = ">>";
    rightArrow.classList.add("button");
    rightArrow.onclick = function () {
        if (pageState === Math.round(pokemonsList.length / nbByPage))
            return;
        pageState++;
        createList();
    };
    let showPage = document.createElement("span");
    showPage.textContent = pageState + "/" + Math.round(pokemonsList.length / nbByPage);
    showPage.classList.add("show-page");
    let navArrows = document.createElement("div");
    navArrows.classList.add("nav");
    navArrows.appendChild(leftArrow);
    navArrows.appendChild(showPage);
    navArrows.appendChild(rightArrow);
    navContent.appendChild(navArrows);
}

function filterChoices() {
    let content = document.createElement("div");
    content.classList.add("filters");
    let ul = document.createElement("ul");
    types.forEach(e => {
        let li = document.createElement("li");
        li.textContent = e === "" ? "None" : e;
        li.onclick = function () {
            filter = e;
            createList();
            checkActiveFilter();
        }
        ul.appendChild(li);
    });
    content.appendChild(ul);
    navContent.appendChild(content);
    checkActiveFilter()
}

function activateFilter() {
    if (filter === "") {
        pokemonsListFiltered = selectPokemonFromPage();
    } else {
        filterEveryShown();
    }
}

function testPromises(url) {
    return new Promise((resolve) => {
        fetch(url).then((resp) => resp.json()).then((data) => {
            resolve(data);
        })
    })
}

function filterEveryShown() {
    pokemonsListFiltered = [];
    let list = selectPokemonFromPage();
    let newList = [];
    list.forEach(e => {
        newList.push(testPromises(e.url));
    });
    Promise.all(newList).then((t) => render(t));
}

function render(t) {
    let newTab = [];
    t.forEach(e => {
        e.types.forEach(type => {
            if (type.type.name === filter) {
                newTab.push({
                    name: e.name,
                    url: "https://pokeapi.co/api/v2/pokemon/" + e.name
                });
            }
        });
    });
    pokemonsListFiltered = newTab;
    renderListNav(pokemonsListFiltered);
}

function renderListNav(pokemonInPage) {
    navContent.innerHTML = "";
    let ul = document.createElement("ul");
    pokemonInPage.forEach(e => {
        let li = document.createElement("li");
        let name = e.name.split("-");
        name = name[0];
        li.textContent = name;
        li.onclick = function () {
            getPokemon(e.url)
            pokemonSelected = e;
        };
        ul.appendChild(li);
    })
    navContent.appendChild(ul);
    pagination();
    filterChoices();
}

function selectPokemonFromPage() {
    let list = [...pokemonsList];
    list.splice(pageState * nbByPage);
    if (pageState > 1)
        list.splice(0, (pageState - 1) * nbByPage);
    return list;
}

function selectPokemonFiltered() {
    // console.log(filter);
    let newArr = [];
    // I need to check what this does, I don't remember ! and since that does nothing... WTF ?!
    newArr = allPokemons.filter(e => {
        // console.log(pokemonsListFiltered);
        pokemonsListFiltered.forEach(f => {
            // e.name === f.name
            console.log(f)
        });
    });
    // console.log(newArr);
    return newArr;
}

// Generate list of all pokemon the selected generation in PokemonsList
function getGenList() {
    clearList();
    let genList = [...allPokemons];
    let genStart = generations[versionState].start - 1;
    let genEnd = generations[versionState].end - 1;
    genList.splice(genEnd);
    genList.splice(0, genStart);
    pokemonsList = genList;
}

// Request to take the pokemon informations
function getPokemon(url) {
    axios.get(url).then(response => {
        showInfosPokemon(response.data);
    }).catch(function (error) {
        console.log(error)
    });
}

// Show the bloc infos of a specific pokemon
function showInfosPokemon(pokemon) {
    pokemonSelected = {
        ...pokemon
    };
    console.log(pokemon)
    let infos = `<h2>${pokemonSelected.name}</h2>`;
    infos += `<img src=${pokemonSelected.sprites.front_default} alt="${pokemonSelected.name} sprite" class="sprite">`
    infos += `<div class="pokedatas">`;
    infos += `<div class="data"><span>National N°</span> <strong>${pokemonSelected.id}</strong></div>`;
    infos += `<div class="data"><span>Type</span> <strong>`;
    let type = pokemonSelected.types.reverse();
    type.forEach(e => {
        infos += `<img src="assets/types/${e.type.name}.gif" alt="${e.type.name}"> `;
    });
    infos += `</strong></div>`;
    infos += `<div class="data"><span>Height</span> <strong>${calculData(pokemonSelected.height)}m</strong></div>`;
    infos += `<div class="data"><span>Weight</span> <strong>${calculData(pokemonSelected.weight)}kg</strong></div>`;
    let abilities = pokemonSelected.abilities;
    abilities.sort((a, b) => {
        return a.slot - b.slot;
    })
    infos += `<div class="data"><span>Abilities</span> <ol>`;
    abilities.forEach(e => {
        let hidden = e.is_hidden ? "(hidden)" : "";
        infos += `<li><strong>${e.ability.name}</strong> ${hidden}</li>`;
    });
    infos += `</ol></div>`;
    infos += `</div>`;

    infos += `<table class="statbloc">`;
    infos += `<thead>`;
    infos += `<tr>`;
    infos += `<th colspan="4">Stat bloc</th>`;
    infos += `</tr>`;
    infos += `</thead>`;
    infos += `<tr>`;
    infos += `<td>HP</td>`;
    infos += `<td>${pokemonSelected.stats[5].base_stat}</td>`;
    infos += `<td>Speed</td>`;
    infos += `<td>${pokemonSelected.stats[0].base_stat}</td>`;
    infos += `</tr>`;
    infos += `<tr>`;
    infos += `<td>Attack</td>`;
    infos += `<td>${pokemonSelected.stats[4].base_stat}</td>`;
    infos += `<td>Defense</td>`;
    infos += `<td>${pokemonSelected.stats[3].base_stat}</td>`;
    infos += `</tr>`;
    infos += `<tr>`;
    infos += `<td>Sp. Attack</td>`;
    infos += `<td>${pokemonSelected.stats[2].base_stat}</td>`;
    infos += `<td>Sp. Defense</td>`;
    infos += `<td>${pokemonSelected.stats[1].base_stat}</td>`;
    infos += `</tr>`;
    infos += `</table>`;
    mainContent.innerHTML = infos;
}

function calculData(value) {
    return value / 10;
}