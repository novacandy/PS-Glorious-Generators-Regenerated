function getSaveFromId(id) {
    return JSON.parse(atob(localStorage[id]))
}
addLayer("saveHub", {

    name: "saveHub",
    symbol: "S",
    row: "side",
    color: "#d997ff",
    tooltip: "Save Hub",



    tabFormat: [
        ['display-text', 
           `<h2>Welcome to the Save Hub!</h2>
            <p>Here, you can manage your saves throughout the entirety of the Prestigious Saplings series.</p>
            <p>On rare occasions, you may encounter features dependent on save data from other saplings.</p>
            <p>If you are currently playing on novacandy.github.io, your save data from other saplings will automatically update as you play. However, if you are playing on an external site (such as Galaxy), your save data unfortunately cannot automatically be transferred between saplings.</p>
            <p>If you wish to manually transfer your save data from other saplings, you may do so here.</p>
            <br>`
        ],
        ['display-text', () => {
            const id = "Prestigious-Saplings:-Miniscule-Multipliers-Rescripted!-pixelium_"
            if (localStorage[id] == undefined) return `<b>Miniscule Multipliers</b>: No save data found.`

            let points = getSaveFromId(id).points
            let playtime = getSaveFromId(id).timePlayed
            return `<b>Miniscule Multipliers</b>: ${format(points)} points, played for ${formatTime(playtime)}`
        }],
        ['display-text', () => {
            return `<b>Glorious Generators</b>: You are here!`
        }],
        ['display-text', () => {
            const id = "Prestigious-Saplings:-Exponential-Enhancement!-novacandy"
            if (localStorage[id] == undefined) return `<b>Exponential Enhancement</b>: No save data found.`

            let points = getSaveFromId(id).points
            let playtime = getSaveFromId(id).timePlayed
            return `<b>Exponential Enhancement</b>: ${format(points)} points, played for ${formatTime(playtime)}`
        }],
    ],
    layerShown(){return true}
})