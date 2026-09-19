let modInfo = {
	name: "Prestigious Saplings: Glorious Generators: Regenerated!",
	author: "nobody",
	pointsName: "points",
	modFiles: ["gen_alt_dyn.js", "chr_amp.js", "metaGens.js", "saveHub.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "1.0",
	name: "Initial Release (but cooler)",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v1.0</h3><br>
		- Added `

let winText = `Oops! You weren't supposed to see this yet! Please report this to the developer (me)!`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	gain = gain.mul(tmp.g.genPowEffect)

	if (hasUpgrade('g', 11)) gain = gain.mul(upgradeEffect('g', 11))
	if (hasUpgrade('g', 22)) gain = gain.mul(upgradeEffect('g', 22))
	if (hasUpgrade('g', 23)) gain = gain.mul(upgradeEffect('g', 23))
	if (hasUpgrade('g', 24)) gain = gain.mul(upgradeEffect('g', 24))

	if (hasUpgrade('a', 11)) gain = gain.mul(upgradeEffect('a', 11))
	if (hasUpgrade('a', 21)) gain = gain.mul(upgradeEffect('a', 21))
	if (hasUpgrade('a', 24)) gain = gain.mul(upgradeEffect('a', 24))

	if (hasUpgrade('d', 11)) gain = gain.mul(upgradeEffect('d', 11))
	if (hasUpgrade('d', 24)) gain = gain.mul(upgradeEffect('d', 24))

	if (player.v.unlocked) gain = gain.mul(player.points.add(1).log(10).pow(tmp.v.genPowEffect).add(1))

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	"Layers only reset along branches",
	"Reach e1.00e9 points to beat the game!"
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(0.25) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}