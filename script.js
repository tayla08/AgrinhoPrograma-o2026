const cidades = [
    {nome:"Curitiba", lat:-25.42, lon:-49.27},
    {nome:"Londrina", lat:-23.31, lon:-51.16},
    {nome:"Maringá", lat:-23.42, lon:-51.93},
    {nome:"Ponta Grossa", lat:-25.09, lon:-50.16},
    {nome:"Cascavel", lat:-24.95, lon:-53.45},
    {nome:"Foz do Iguaçu", lat:-25.54, lon:-54.58},
    {nome:"Guarapuava", lat:-25.39, lon:-51.45},
    {nome:"Paranaguá", lat:-25.51, lon:-48.51},
    {nome:"Umuarama", lat:-23.76, lon:-53.32},
    {nome:"Apucarana", lat:-23.55, lon:-51.46},
    {nome:"Toledo", lat:-24.71, lon:-53.74},
    {nome:"Campo Mourão", lat:-24.04, lon:-52.37},
    {nome:"Francisco Beltrão", lat:-26.08, lon:-53.05},
    {nome:"Paranavaí", lat:-23.08, lon:-52.46},
    {nome:"Cianorte", lat:-23.66, lon:-52.60},
    {nome:"Araucária", lat:-25.59, lon:-49.40},
    {nome:"Pato Branco", lat:-26.22, lon:-52.67},
    {nome:"Irati", lat:-25.47, lon:-50.65},
    {nome:"Jacarezinho", lat:-23.16, lon:-49.97},
    {nome:"Cornélio Procópio", lat:-23.18, lon:-50.65},
    {nome:"Telêmaco Borba", lat:-24.32, lon:-50.61},
    {nome:"Palmas", lat:-26.48, lon:-51.99},
    {nome:"União da Vitória", lat:-26.23, lon:-51.08},
    {nome:"Santo Antônio da Platina", lat:-23.30, lon:-50.08},
    {nome:"Lapa", lat:-25.77, lon:-49.72}
];

const select = document.getElementById("cidadeSelect");

cidades.forEach((cidade, index)=>{
    let option = document.createElement("option");
    option.value = index;
    option.textContent = cidade.nome;
    select.appendChild(option);
});

const map = L.map("map").setView([-24.7, -51.5], 7);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);

let marcadores = [];

async function atualizarMapa(){

    marcadores.forEach(m => map.removeLayer(m));
    marcadores = [];

    for(const cidade of cidades){

        const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${cidade.lat}&longitude=${cidade.lon}&daily=precipitation_sum,temperature_2m_max&timezone=auto`;

        const resposta = await fetch(url);
        const dados = await resposta.json();

        const chuva = dados.daily.precipitation_sum[0];

        let cor = "green";

        if(chuva > 10){
            cor = "red";
        }
        else if(chuva > 3){
            cor = "orange";
        }

        const marcador = L.circleMarker(
            [cidade.lat, cidade.lon],
            {
                radius:12,
                color:cor,
                fillColor:cor,
                fillOpacity:0.8
            }
        ).addTo(map);

        marcador.bindPopup(`
            <b>${cidade.nome}</b><br>
            🌧️ Chuva: ${chuva} mm
        `);

        marcadores.push(marcador);
    }
}

async function buscarCidade(){

    const cidade = cidades[select.value];

    const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${cidade.lat}&longitude=${cidade.lon}&daily=precipitation_sum,temperature_2m_max&timezone=auto`;

    const resposta = await fetch(url);
    const dados = await resposta.json();

    const chuva = dados.daily.precipitation_sum[0];
    const temp = dados.daily.temperature_2m_max[0];

    const hectares =
    Number(document.getElementById("hectares").value);

    let aguaNormal = hectares * 40000;
    let aguaRecomendada = aguaNormal;

    if(chuva > 10){
        aguaRecomendada = 0;
    }
    else if(chuva > 3){
        aguaRecomendada = aguaNormal * 0.5;
    }

    const economia = aguaNormal - aguaRecomendada;

    document.getElementById("cidadeNome").innerHTML = cidade.nome;
    document.getElementById("chuva").innerHTML = chuva;
    document.getElementById("temp").innerHTML = temp;
    document.getElementById("agua").innerHTML = aguaRecomendada;
    document.getElementById("economia").innerHTML = economia;

    const resultado =
    document.getElementById("resultado");

    if(chuva > 10){

        resultado.innerHTML =
        "⛈️ Chuva forte prevista. Não irrigar hoje. Sustentabilidade máxima!";

        resultado.className =
        "resultado verde";
    }

    else if(chuva > 3){

        resultado.innerHTML =
        "🌦️ Chuva moderada. Reduza a irrigação e economize água.";

        resultado.className =
        "resultado amarelo";
    }

    else{

        resultado.innerHTML =
        "☀️ Pouca chuva prevista. Irrigação necessária hoje.";

        resultado.className =
        "resultado vermelho";
    }

    map.setView([cidade.lat, cidade.lon], 8);
}

select.addEventListener("change", buscarCidade);

document
.getElementById("hectares")
.addEventListener("input", buscarCidade);

buscarCidade();
atualizarMapa();