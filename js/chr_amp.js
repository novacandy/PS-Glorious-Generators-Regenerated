const forceAmplifierResetTooltips = [
    "I'm not removing this from the game for being \"unintuitive\". You'll thank me later.",
    "The issue people are having with timewalls appears to be related to Voltage mechanics. This should be relatively solvable by just providing a way to reset your voltage run for no gain.",
    "A suggestion to replace the amplifier reset button that many people have problems with (I had no issue personally, but I can understand why some get confused): Don't",
    "The \"amplifier reset\" thing makes the game pretty much unplayable. What would be an one hour timewall becomes 4 days.",
    "Having fun so far. My only problem is the place where you have to force amplifier reset. That's not very intuitive.",
    "Pressing \"Force amplifier reset\" allowed me to get the 5e10v for the first upgrade. Not sure if it's a bug but it's very unintuitive if it's intended.",
    "You should make it so each time you buy a voltage upgrade you do an amplifier reset to reset the voltage gain multiplier.",
    "unintuitive 😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂"
]
var randomTooltip = 0
function randomizeTooltip() {
    randomTooltip = Math.floor(Math.random()*forceAmplifierResetTooltips.length)
}

addLayer("c", {

    name: "charge",
    symbol: "C",
    row: 2,
    displayRow: 1,
    position: 2,
    color: "#a197ff",

    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        charge: new Decimal(0),
        unlockOrder: 0,
        batteries: {
            genCharge: new Decimal(0),
            dynCharge: new Decimal(0),
            altCharge: new Decimal(0)
        },
        chargerSlots: [],
        autoPrestigeToggle: false
    }},

    requires() {return player.c.unlockOrder == 1 ? new Decimal(1e170) : new Decimal(1e42)},
    resource: "chargers",
    baseResource: "DC",
    baseAmount() {return player.d.directCurrent},
    type: "static",
    exponent: 3,

    branches: ['d'],
    increaseUnlockOrder: [],

    onPrestige() {
        if (!tmp[this.layer].resetsNothing) player.c.charge = new Decimal(0)
    },
    resetsNothing() {return hasMilestone('c', 8) && false},
    canBuyMax() {return hasMilestone('c', 9)},
    autoPrestige() {return hasMilestone('c', 10) && player.c.autoPrestigeToggle},

    effect() { 
        let effect = Decimal.pow(tmp[this.layer].genBase, player[this.layer].points.add(tmp[this.layer].freeGens)).mul(tmp[this.layer].genPowerMults).sub(1)
        return effect
    },
    effectDescription() {
        return `which are generating ${format(tmp[this.layer].effect)} charge/s, with a limit of ${format(tmp.c.chargeCap)}<br>(Formula: (${format(tmp[this.layer].genBase)}^(n+${format(tmp[this.layer].freeGens)})x${format(tmp[this.layer].genPowerMults)})-1)`
    },
    genPowEffect() {
        let effect = player.c.charge.pow(2).add(1).log(2).add(1).log(2).div(100)
        if (hasUpgrade('c', 13)) effect = effect.mul(upgradeEffect('c', 13))
        return effect
    },

    genPowerMults() {
        let mult = new Decimal(1)
        if (hasUpgrade('c', 11)) mult = mult.mul(upgradeEffect('c', 11))
        if (hasUpgrade('c', 22)) mult = mult.mul(upgradeEffect('c', 22))
        if (hasUpgrade('v', 23)) mult = mult.mul(upgradeEffect('v', 23))
        if (hasUpgrade('d', 33)) mult = mult.mul(upgradeEffect('d', 33)[1])
        return mult
    },
    chargeCap() {
        let cap = Decimal.pow(tmp[this.layer].genBase, player[this.layer].points.add(tmp[this.layer].freeGens)).sub(1).mul(100)
        if (hasUpgrade('g', 42)) cap = cap.mul(upgradeEffect('g', 42))
        if (hasUpgrade('v', 23)) cap = cap.mul(upgradeEffect('v', 23))
        return cap
    },
    genBase() {
        let base = new Decimal(2)
        if (hasUpgrade('v', 13)) base = base.add(upgradeEffect('v', 13))
        if (hasUpgrade('g', 44)) base = base.add(upgradeEffect('g', 44))
        return base
    },
    freeGens() {
        let free = new Decimal(0)
        if (hasUpgrade('g', 43)) free = free.add(upgradeEffect('g', 43))
        if (hasUpgrade('d', 32)) free = free.add(upgradeEffect('d', 32))
        return free
    },
    
    batteries: {
        slots() {
            let slots = 1
            if (hasMilestone('c', 4)) slots++
            if (hasMilestone('c', 7)) slots++
            if (hasMilestone('c', 8)) slots++
            return slots
        },
        total() {
            return this.genBattery.amount().add(this.dynBattery.amount()).add(this.altBattery.amount())
        },
        genBattery: {
            scaling() {
                let scaling = new Decimal(3)
                return scaling
            },

            nextAt() {
                return Decimal.pow(this.scaling(), this.amount().add(1)).sub(1).mul(100)
            },
            amount() {
                return player.c.batteries.genCharge.div(100).add(1).log(this.scaling()).floor()
            },
            effect() {
                return this.amount().mul(4)
            }
        },
        dynBattery: {
            scaling() {
                let scaling = new Decimal(4)
                return scaling
            },

            nextAt() {
                return Decimal.pow(this.scaling(), this.amount().add(1)).sub(1).mul(150)
            },
            amount() {
                return player.c.batteries.dynCharge.div(150).add(1).log(this.scaling()).floor()
            },
            effect() {
                return this.amount().mul(4)
            }
        },
        altBattery: {
            scaling() {
                let scaling = new Decimal(5)
                return scaling
            },

            nextAt() {
                return Decimal.pow(this.scaling(), this.amount().add(1)).sub(1).mul(250000)
            },
            amount() {
                return player.c.batteries.altCharge.div(250000).add(1).log(this.scaling()).floor()
            },
            effect() {
                return this.amount().mul(4)
            }
        }
    },

    upgrades: {
        11: {
            title: "Watt's This?",
            description() {return "Multiply charge generation based on generators. Effect: x" + format(this.effect())},
            cost: new Decimal(3000),
            effect() {
                let effect = player.g.points.add(1).pow(0.75)
                return effect
            },
            unlocked() {return hasMilestone('c', 2) || hasUpgrade(this.layer, this.id) || player.m.unlocked},
            currencyLayer: "c",
            currencyDisplayName: "Q",
            currencyInternalName: "charge",
        },
        12: {
            title: "Battery Boost",
            description() {return "Total filled batteries increase the dynamo base. Effect: +" + format(this.effect())},
            cost: new Decimal(25000),
            effect() {
                let effect = tmp.c.batteries.total.pow(1.25)
                return effect
            },
            unlocked() {return hasUpgrade('c', 11) || hasUpgrade(this.layer, this.id) || player.m.unlocked},
            currencyLayer: "c",
            currencyDisplayName: "Q",
            currencyInternalName: "charge",
        },
        13: {
            title: "Stronger Charge",
            description() {return "Triple the charge effect. Effect: x" + format(this.effect())},
            cost: new Decimal(5000000),
            effect() {
                let effect = new Decimal(3)
                return effect
            },
            unlocked() {return hasUpgrade('c', 12) || hasUpgrade(this.layer, this.id) || player.m.unlocked},
            currencyLayer: "c",
            currencyDisplayName: "Q",
            currencyInternalName: "charge",
        },
        21: {
            title: "Alternator Effectiveness",
            description() {return "Increase generator effectiveness based on alternators. Effect: +" + format(this.effect().mul(100)) + "%"},
            cost: new Decimal(7),
            effect() {
                let effect = player.a.points.add(1).log(10).pow(2).div(100)
                return effect
            },
            unlocked() {return hasUpgrade('c', 11) || hasUpgrade(this.layer, this.id) || player.m.unlocked},
        },
        22: {
            title: "Alternative Power Source",
            description() {return "Earn a multiplier to charge generation based on alternators. Effect: x" + format(this.effect())},
            cost: new Decimal(12),
            effect() {
                let effect = player.a.points.add(1).pow(0.75)
                return effect
            },
            unlocked() {return hasUpgrade('c', 21) || hasUpgrade(this.layer, this.id) || player.m.unlocked},
        },
        23: {
            title: "Multi Charge",
            description() {return "Earn a multiplier to voltage generation (and voltage decay) based on the charger effect. Effect: x" + format(this.effect())},
            cost: new Decimal(18),
            effect() {
                let effect = tmp.c.effect.add(1).log(10).pow(0.5).add(1)
                return effect
            },
            unlocked() {return hasUpgrade('c', 22) || hasUpgrade(this.layer, this.id) || player.m.unlocked},

        }
    },

    milestones: {
        0: {
            requirementDescription: "1 charger",
            effectDescription: "Keep one random generator/dynamo upgrade on reset per charger",
            done() {return player.c.points.gte(1)},
            unlocked() {return true}
        },
        1: {
            requirementDescription: "3 chargers",
            effectDescription: "Unlock the Generator battery",
            done() {return player.c.points.gte(3)},
            unlocked() {return hasMilestone('c', 0)}
        },
        2: {
            requirementDescription: "5 chargers",
            effectDescription: "Unlock the Dynamo battery and charger upgrades",
            done() {return player.c.points.gte(5)},
            unlocked() {return hasMilestone('c', 1)}
        },
        3: {
            requirementDescription: "9 chargers",
            effectDescription: "You can explore an additional row of generator upgrades (which are always kept on charger/amplifier resets)",
            done() {return player.c.points.gte(9)},
            unlocked() {return hasMilestone('c', 2)}
        },
        4: {
            requirementDescription: "11 chargers",
            effectDescription: "Unlock the Alternator battery and add a charger slot",
            done() {return player.c.points.gte(11) && player.c.unlockOrder == 0},
            unlocked() {return hasMilestone('c', 3) && player.c.unlockOrder == 0}
        },
        5: {
            requirementDescription: "13 chargers",
            effectDescription: "You can explore an additional row of dynamo upgrades (which are always kept on charger resets)",
            done() {return player.c.points.gte(13)},
            unlocked() {return hasMilestone('c', 4) || (hasMilestone('c', 3) && player.c.unlockOrder == 0)}
        },
        6: {
            requirementDescription: "15 chargers",
            effectDescription: "Amplifiers behave as if they were unlocked first, and unlock Dynamo Maintenance if not unlocked already.",
            done() {return player.c.points.gte(15) && player.c.unlockOrder == 0},
            onComplete() {player.v.unlockOrder = 0},
            unlocked() {return hasMilestone('c', 5) && player.c.unlockOrder == 0}
        },
        7: {
            requirementDescription: "20 chargers",
            effectDescription: "Add a charger slot",
            done() {return player.c.points.gte(20)},
            unlocked() {return hasMilestone('c', 6)}
        },
        8: {
            requirementDescription: "30 chargers",
            effectDescription: "Add a charger slot",
            done() {return player.c.points.gte(30)},
            unlocked() {return hasMilestone('c', 7)}
        },
        9: {
            requirementDescription: "40 chargers",
            effectDescription: "You can buy max chargers",
            done() {return player.c.points.gte(40)},
            unlocked() {return hasMilestone('c', 8)}
        },
        10: {
            requirementDescription: "100 chargers",
            effectDescription: "Automatically reset for chargers",
            done() {return player.c.points.gte(100)},
            toggles: [['c', 'autoPrestigeToggle']],
            unlocked() {return hasMilestone('c', 9)}
        },
    },

    clickables: {
        11: {
            title() {return player.c.chargerSlots.includes('G') ? "Charging..." : "Charge the Generator Battery"},
            canClick() {return player.c.chargerSlots.length + 1 <= tmp.c.batteries.slots || player.c.chargerSlots.includes('G')},
            onClick() {
                if (player.c.chargerSlots.includes("G")) {
                    const index = player.c.chargerSlots.indexOf("G")
                    if (index > -1) {
                        player.c.chargerSlots.splice(index, 1)
                    }
                } else {
                    player.c.chargerSlots.push("G")
                }
            },
            unlocked() {return hasMilestone('c', 1)}
        },
        12: {
            title() {return player.c.chargerSlots.includes('D') ? "Charging..." : "Charge the Dynamo Battery"},
            canClick() {return player.c.chargerSlots.length + 1 <= tmp.c.batteries.slots || player.c.chargerSlots.includes('D')},
            onClick() {
                if (player.c.chargerSlots.includes("D")) {
                    const index = player.c.chargerSlots.indexOf("D")
                    if (index > -1) {
                        player.c.chargerSlots.splice(index, 1)
                    }
                } else {
                    player.c.chargerSlots.push("D")
                }
            },
            unlocked() {return hasMilestone('c', 2)}
        },
        13: {
            title() {return player.c.chargerSlots.includes('A') ? "Charging..." : "Charge the Alternator Battery"},
            canClick() {return player.c.chargerSlots.length + 1 <= tmp.c.batteries.slots || player.c.chargerSlots.includes('A')},
            onClick() {
                if (player.c.chargerSlots.includes("A")) {
                    const index = player.c.chargerSlots.indexOf("A")
                    if (index > -1) {
                        player.c.chargerSlots.splice(index, 1)
                    }
                } else {
                    player.c.chargerSlots.push("A")
                }
            },
            unlocked() {return hasMilestone('c', 4)}
        },
        21: {
            title() {return "Reset generator battery amount"},
            canClick() {return tmp.c.batteries.genBattery.amount.gte(1)},
            onClick() {
                if (window.confirm("Are you sure you want to reset this battery's amount? This will force a charger reset!")) {
                    player.c.batteries.genCharge = new Decimal(0)
                    doReset('c', true)
                }
            },
            unlocked() {return hasMilestone('c', 1)}
        },
        22: {
            title() {return "Reset dynamo battery amount"},
            canClick() {return tmp.c.batteries.dynBattery.amount.gte(1)},
            onClick() {
                if (window.confirm("Are you sure you want to reset this battery's amount? This will force a charger reset!")) {
                    player.c.batteries.dynCharge = new Decimal(0)
                    doReset('c', true)
                }
            },
            unlocked() {return hasMilestone('c', 2)}
        },
        23: {
            title() {return "Reset alternator battery amount"},
            canClick() {return tmp.c.batteries.altBattery.amount.gte(1)},
            onClick() {
                if (window.confirm("Are you sure you want to reset this battery's amount? This will force a charger reset!")) {
                    player.c.batteries.altCharge = new Decimal(0)
                    doReset('c', true)
                }
            },
            unlocked() {return hasMilestone('c', 4)}
        },
    },

    bars: {
        charge: {
            direction: RIGHT,
            width: 300,
            height: 30,
            progress() {
                if (tmp.c.chargeCap.eq(0)) return 0
                return player.c.charge.div(tmp.c.chargeCap).mag
            },
            display() {
                if (tmp.c.chargeCap.eq(0)) return "Locked"
                return `${format(player.c.charge.div(tmp.c.chargeCap).mul(100))}%`
            },
            unlocked() {return player.c.unlocked},
            fillStyle: {'background-color': () => {return tmp.c.color}},
            baseStyle: {'background-color': '#000000'}
        },
        genBattery: {
            direction: RIGHT,
            width: 200,
            height: 100,
            progress() {
                return player.c.batteries.genCharge.div(tmp.c.batteries.genBattery.nextAt).mag
            },
            display() {
                return `${format(new Decimal(player.c.batteries.genCharge.div(tmp.c.batteries.genBattery.nextAt).mag).mul(100))}%<br>
                        (${format(player.c.batteries.genCharge)} / ${format(tmp.c.batteries.genBattery.nextAt)})`
            },
            unlocked() {return hasMilestone('c', 1)},
            fillStyle: {'background-color': () => {return tmp.g.color}},
            baseStyle: {'background-color': '#000000'}
        },
        dynBattery: {
            direction: RIGHT,
            width: 200,
            height: 100,
            progress() {
                return player.c.batteries.dynCharge.div(tmp.c.batteries.dynBattery.nextAt).mag
            },
            display() {
                return `${format(new Decimal(player.c.batteries.dynCharge.div(tmp.c.batteries.dynBattery.nextAt).mag).mul(100))}%<br>
                        (${format(player.c.batteries.dynCharge)} / ${format(tmp.c.batteries.dynBattery.nextAt)})`
            },
            unlocked() {return hasMilestone('c', 2)},
            fillStyle: {'background-color': () => {return tmp.d.color}},
            baseStyle: {'background-color': '#000000'}
        },
        altBattery: {
            direction: RIGHT,
            width: 200,
            height: 100,
            progress() {
                return player.c.batteries.altCharge.div(tmp.c.batteries.altBattery.nextAt).mag
            },
            display() {
                return `${format(new Decimal(player.c.batteries.altCharge.div(tmp.c.batteries.altBattery.nextAt).mag).mul(100))}%<br>
                        (${format(player.c.batteries.altCharge)} / ${format(tmp.c.batteries.altBattery.nextAt)})`
            },
            unlocked() {return hasMilestone('c', 4)},
            fillStyle: {'background-color': () => {return tmp.a.color}},
            baseStyle: {'background-color': '#000000'}
        },
    },
    
    hotkeys: [
        {key: "c", description: "C: Reset for chargers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    update(diff) {
        if (tmp.c.batteries.slots != player.c.chargerSlots.length) player.c.charge = player.c.charge.add(tmp.c.effect.mul(diff)).min(tmp.c.chargeCap).max(0)
        if (player.c.chargerSlots.includes('G')) player.c.batteries.genCharge = player.c.batteries.genCharge.add(tmp.c.effect.mul(diff)).max(0)
        if (player.c.chargerSlots.includes('D')) player.c.batteries.dynCharge = player.c.batteries.dynCharge.add(tmp.c.effect.mul(diff)).max(0)
        if (player.c.chargerSlots.includes('A')) player.c.batteries.altCharge = player.c.batteries.altCharge.add(tmp.c.effect.mul(diff)).max(0)
    },
    doReset(resettingLayer) {
        let keep = ['milestones', 'best', 'autoPrestigeToggle']
        let keptUpgrades = []
        
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)

        player[this.layer].upgrades.push(...keptUpgrades)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", () => {return `Charger Base: ${format(tmp.c.genBase)}`}],
        ["display-text", () => {if (tmp.c.freeGens.gt(0)) return `Free Chargers: ${format(tmp.c.freeGens)}`}],
        "blank",
        ["display-text", () => {return `You have ${format(player.c.charge)} charge (Q), which are making generators ${format(tmp.c.genPowEffect.mul(100))}% more effective`}],
        ["display-text", () => {if (player.c.chargerSlots.length == tmp.c.batteries.slots) return "You cannot generate charge without an empty Charger Slot"}],
        "blank",
        ["bar", "charge"],
        "blank",
        "milestones",
        "blank",
        ["display-text", () => {if (hasMilestone('c', 1)) return `Charger Slots: ${formatWhole(player.c.chargerSlots.length)}/${formatWhole(tmp.c.batteries.slots)}`}],
        "blank",
        ["row", [
            ["clickable", 11],
            ["bar", "genBattery"],
            ["clickable", 21],
            "blank",
            ["column", [
                ["display-text", () => {if (hasMilestone('c', 1)) return `<b>Generator Battery</b>`}],
                ["display-text", () => {if (hasMilestone('c', 1)) return `You have fully charged the Generator battery ${formatWhole(tmp.c.batteries.genBattery.amount)} times`}],
                ["display-text", () => {if (hasMilestone('c', 1)) return `Increases the generator base and free generators by +${format(tmp.c.batteries.genBattery.effect)}`}],
            ]]
        ]],
        ["row", [
            ["clickable", 12],
            ["bar", "dynBattery"],
            ["clickable", 22],
            "blank",
            ["column", [
                ["display-text", () => {if (hasMilestone('c', 2)) return `<b>Dynamo Battery</b>`}],
                ["display-text", () => {if (hasMilestone('c', 2)) return `You have fully charged the Dynamo battery ${formatWhole(tmp.c.batteries.dynBattery.amount)} times`}],
                ["display-text", () => {if (hasMilestone('c', 2)) return `Increases the dynamo base and free dynamos by +${format(tmp.c.batteries.dynBattery.effect)}`}],
            ]]
        ]],
        ["row", [
            ["clickable", 13],
            ["bar", "altBattery"],
            ["clickable", 23],
            "blank",
            ["column", [
                ["display-text", () => {if (hasMilestone('c', 4)) return `<b>Alternator Battery</b>`}],
                ["display-text", () => {if (hasMilestone('c', 4)) return `You have fully charged the Alternator battery ${formatWhole(tmp.c.batteries.altBattery.amount)} times`}],
                ["display-text", () => {if (hasMilestone('c', 4)) return `Increases the alternator base and free alternators by +${format(tmp.c.batteries.altBattery.effect)}`}],
            ]]
        ]],
        "blank",
        "upgrades"
    ],
    layerShown(){return player.a.unlocked && player.d.unlocked}
})
addLayer("v", {

    name: "amplify",
    symbol: "V",
    row: 2,
    displayRow: 2,
    position: 1,
    color: "#f5ff97",

    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        voltage: new Decimal(0),
        voltageDecay: new Decimal(0),
        unlockOrder: 0,
        autoPrestigeToggle: false
    }},

    requires() {return player.v.unlockOrder == 1 ? new Decimal(1e160) : new Decimal(1e45)},
    resource: "amplifiers",
    baseResource: "AC",
    baseAmount() {return player.a.alternatingCurrent},
    type: "static",
    exponent: 3,

    branches: ['a'],
    increaseUnlockOrder: ['c'],

    onPrestige() {
        player.v.voltage = new Decimal(0)
        player.v.voltageDecay = new Decimal(0)
        randomizeTooltip()
    },
    resetsNothing() {return hasMilestone('v', 7) && false},
    canBuyMax() {return hasMilestone('v', 8)},
    autoPrestige() {return hasMilestone('v', 9) && player.v.autoPrestigeToggle},

    effect() { 
        let effect = Decimal.pow(tmp[this.layer].genBase, player[this.layer].points.add(tmp[this.layer].freeGens)).mul(tmp[this.layer].genPowerMults).sub(1)
        return effect
    },
    effectDescription() {
        return `which are generating a base of ${format(tmp[this.layer].effect)} voltage/s<br>(Formula: (${format(tmp[this.layer].genBase)}^(n+${format(tmp[this.layer].freeGens)})x${format(tmp[this.layer].genPowerMults)})-1)`
    },
    genPowEffect() {
        let effect = player.v.voltage.add(1).max(1).log(10).pow(3)
        if (effect.gte(tmp[this.layer].genPowEffectSoftcap)) effect = effect.div(tmp[this.layer].genPowEffectSoftcap).root(tmp[this.layer].genPowEffectRoot).mul(tmp[this.layer].genPowEffectSoftcap)
        return effect
    },
    genPowEffectSoftcap() {
        let softcapStart = new Decimal(25000)
        return softcapStart
    },
    genPowEffectRoot() {
        let softcapRoot = new Decimal(3)
        return softcapRoot
    },

    genPowerMults() {
        let mult = new Decimal(1)
        if (hasUpgrade('c', 23)) mult = mult.mul(upgradeEffect('c', 23))
        if (hasUpgrade('d', 33)) mult = mult.mul(upgradeEffect('d', 33)[0])
        return mult
    },
    decayRate() {
        let decay = Decimal.pow(tmp[this.layer].genBase, player[this.layer].points.add(tmp[this.layer].freeGens)).sub(1).div(100)
        if (hasUpgrade('g', 31)) decay = decay.div(upgradeEffect('g', 31))
        if (hasUpgrade('v', 12)) decay = decay.mul(player.v.points)
        if (hasUpgrade('c', 23)) decay = decay.mul(upgradeEffect('c', 23))
        return decay
    },
    genBase() {
        let base = new Decimal(2)
        if (hasUpgrade('v', 12)) base = base.add(upgradeEffect('v', 12))
        return base
    },
    freeGens() {
        let free = new Decimal(0)
        if (hasUpgrade('g', 34)) free = free.add(upgradeEffect('g', 34))
        if (hasUpgrade('a', 33)) free = free.add(upgradeEffect('a', 33))
        return free
    },

    upgrades: {
        11: {
            title: "Shock Pulse",
            description() {return "Earn free alternators based on voltage. Effect: +" + format(this.effect())},
            cost: new Decimal(1500),
            effect() {
                let effect = player.v.voltage.add(1).log(5)
                return effect
            },
            unlocked() {return hasMilestone('v', 1) || hasUpgrade(this.layer, this.id) || player.m.unlocked},
            currencyLayer: "v",
            currencyDisplayName: "V",
            currencyInternalName: "voltage",
            onPurchase() {player.v.voltage = new Decimal(0); player.v.voltageDecay = new Decimal(0)}
        },
        12: {
            title: "Nuclear Fission",
            description() {return "Increase the amplifier base based on charge, but amplifiers directly multiply voltage decay. Effect: +" + format(this.effect())},
            cost: new Decimal(300000),
            effect() {
                let effect = player.c.charge.add(1).log(10).add(1).log(10).div(1.5)
                return effect
            },
            unlocked() {return hasUpgrade('v', 11) || hasUpgrade(this.layer, this.id) || player.m.unlocked},
            currencyLayer: "v",
            currencyDisplayName: "V",
            currencyInternalName: "voltage",
            onPurchase() {player.v.voltage = new Decimal(0); player.v.voltageDecay = new Decimal(0)}
        },
        13: {
            title: "Induction Charge",
            description() {return "Increase the charger base based on voltage. Effect: +" + format(this.effect())},
            cost: new Decimal(1.5e10),
            effect() {
                let effect = player.v.voltage.add(1).log(10).add(1).log(10).div(1.5)
                return effect
            },
            unlocked() {return hasUpgrade('v', 12) || hasUpgrade(this.layer, this.id) || player.m.unlocked},
            currencyLayer: "v",
            currencyDisplayName: "V",
            currencyInternalName: "voltage",
            onPurchase() {player.v.voltage = new Decimal(0); player.v.voltageDecay = new Decimal(0)}
        },
        21: {
            title: "Dynamic Cube",
            description() {return "Earn free dynamos based on amplifiers. Effect: +" + format(this.effect())},
            cost: new Decimal(9),
            effect() {
                let effect = player.v.points.pow(0.8).div(3)
                return effect
            },
            unlocked() {return hasUpgrade('v', 11) || hasUpgrade(this.layer, this.id) || player.m.unlocked},
        },
        22: {
            title: "Underutilized Statistics",
            description() {return "Increase generator effectiveness based on amplifiers. Effect: +" + format(this.effect().mul(100)) + "%"},
            cost: new Decimal(13),
            effect() {
                let effect = player.v.points.div(100)
                return effect
            },
            unlocked() {return hasUpgrade('v', 21) || hasUpgrade(this.layer, this.id) || player.m.unlocked},
        },
        23: {
            title: "Multi Amplify",
            description() {return "Earn a multiplier to charge and its limit based on the amplifier effect. Effect: x" + format(this.effect())},
            cost: new Decimal(21),
            effect() {
                let effect = tmp.v.effect.add(1).log(10).pow(2).add(1)
                return effect
            },
            unlocked() {return hasUpgrade('v', 21) || hasUpgrade(this.layer, this.id) || player.m.unlocked},
        }
    },

    challenges: {
        11: {
            name() {return "Generator Maintenance<br>(" + challengeCompletions(this.layer, this.id) + "/5)"},
            fullDisplay() {return `
                The first eight generator upgrades are disabled, and generator stats cannot be increased.<br>
                Goal: ${formatWhole(this.goal())} generators<br>
                Reward: The voltage effect applies to GP with ${format(this.rewardEffect().mul(100))}% efficiency.<br>
                Currently: xlog(n+1)^${format(tmp.v.genPowEffect.mul(this.rewardEffect()))}<br>(x${format(player.g.genPower.add(1).log(10).pow(tmp.v.genPowEffect.mul(this.rewardEffect())).add(1))})
               `
            },
            goal() {
                if (player.v.unlockOrder == 1) return new Decimal(80).add(new Decimal(2).mul(challengeCompletions('v', 11)))
                return new Decimal(35).add(new Decimal(4).mul(challengeCompletions('v', 11)))
            },
            rewardEffect() {
                let effect = new Decimal(0.20).mul(challengeCompletions(this.layer, this.id))
                return effect
            },
            onEnter() {
                player.v.voltage = new Decimal(0)
                player.v.voltageDecay = new Decimal(0)
            },
            onExit() {
                player.v.voltage = new Decimal(0)
                player.v.voltageDecay = new Decimal(0)
            },
            canComplete() {return player.g.points.gte(this.goal())},
            completionLimit: 5,
            unlocked() {return hasMilestone('v', 1)},
            style() {return {
                "width": "325px",
                "height": "325px",
                "border-color": "#a3d9a5",
                "background-color": "#001201",
                "color": "#a3d9a5",
                "text-shadow": "0px 0px 10px #a3d9a5",
                "box-shadow": "0px 0px 10px #a3d9a5",
                "align-content": "center"
            }},
            buttonColor() {return "#a3d9a5"}
        },
        21: {
            name() {return "Alternator Maintenance<br>(" + challengeCompletions(this.layer, this.id) + "/5)"},
            fullDisplay() {return `
                The first eight alternator upgrades are disabled, and alternator stats cannot be increased.<br>
                Goal: ${formatWhole(this.goal())} alternators<br>
                Reward: The voltage effect applies to AC with ${format(this.rewardEffect().mul(100))}% efficiency.<br>
                Currently: xlog(n+1)^${format(tmp.v.genPowEffect.mul(this.rewardEffect()))}<br>(x${format(player.a.alternatingCurrent.add(1).log(10).pow(tmp.v.genPowEffect.mul(this.rewardEffect())).add(1))})
               `
            },
            goal() {
                if (player.v.unlockOrder == 1) return new Decimal(104).add(new Decimal(4).mul(challengeCompletions('v', 21)))
                return new Decimal(70).add(new Decimal(5).mul(challengeCompletions('v', 21)))
            },
            rewardEffect() {
                let effect = new Decimal(0.05).mul(challengeCompletions(this.layer, this.id))
                return effect
            },
            onEnter() {
                player.v.voltage = new Decimal(0)
                player.v.voltageDecay = new Decimal(0)
            },
            onExit() {
                player.v.voltage = new Decimal(0)
                player.v.voltageDecay = new Decimal(0)
            },
            canComplete() {return player.a.points.gte(this.goal())},
            completionLimit: 5,
            unlocked() {return hasMilestone('v', 3)},
            style() {return {
                "width": "325px",
                "height": "325px",
                "border-color": "#ff9797",
                "background-color": "#120000",
                "color": "#ff9797",
                "text-shadow": "0px 0px 10px #ff9797",
                "box-shadow": "0px 0px 10px #ff9797",
                "align-content": "center"
            }},
            buttonColor() {return "#ff9797"}
        },
        22: {
            name() {return "Dynamo Maintenance<br>(" + challengeCompletions(this.layer, this.id) + "/5)"},
            fullDisplay() {return `
                The first eight Dynamo upgrades are disabled, and dynamo stats cannot be increased. Also forces a Charger reset.<br>
                Goal: ${formatWhole(this.goal())} dynamos<br>
                Reward: The voltage effect applies to DC with ${format(this.rewardEffect().mul(100))}% efficiency.<br>
                Currently: xlog(n+1)^${format(tmp.v.genPowEffect.mul(this.rewardEffect()))}<br>(x${format(player.d.directCurrent.add(1).log(10).pow(tmp.v.genPowEffect.mul(this.rewardEffect())).add(1))})
               `
            },
            goal() {
                return new Decimal(129).add(new Decimal(5).mul(challengeCompletions('v', 22)))
            },
            rewardEffect() {
                let effect = new Decimal(0.05).mul(challengeCompletions(this.layer, this.id))
                return effect
            },
            onEnter() {
                player.v.voltage = new Decimal(0)
                player.v.voltageDecay = new Decimal(0)
                player.d.points = new Decimal(0)
                player.d.directCurrent = new Decimal(0)
                player.c.charge = new Decimal(0)
            },
            onExit() {
                player.v.voltage = new Decimal(0)
                player.v.voltageDecay = new Decimal(0)
                player.d.points = new Decimal(0)
                player.d.directCurrent = new Decimal(0)
                player.c.charge = new Decimal(0)
            },
            canComplete() {return player.d.points.gte(this.goal())},
            completionLimit: 5,
            unlocked() {return hasMilestone('v', 5)},
            style() {return {
                "width": "325px",
                "height": "325px",
                "border-color": "#ffce97",
                "background-color": "#120a00",
                "color": "#ffce97",
                "text-shadow": "0px 0px 10px #ffce97",
                "box-shadow": "0px 0px 10px #ffce97",
                "align-content": "center"
            }},
            buttonColor() {return "#ffce97"}
        },
    },

    clickables: {
        11: {
            title() {return "Force amplifier reset"},
            canClick() {return true},
            onClick() {
                if (window.confirm("Are you sure you want to force an amplifier reset? Use this if you don't have any voltage left.")) {
                    doReset('v', true)
                    player.v.voltage = new Decimal(0)
                    player.v.voltageDecay = new Decimal(0)
                    randomizeTooltip()
                }
            },
            unlocked() {return hasMilestone('v', 0)},
            tooltip() {return forceAmplifierResetTooltips[randomTooltip]}
        }
    },

    milestones: {
        0: {
            requirementDescription: "1 amplifier",
            effectDescription: "Keep one random generator/alternator upgrade on reset per charger",
            done() {return player.v.points.gte(1)},
            unlocked() {return true}
        },
        1: {
            requirementDescription: "3 amplifiers",
            effectDescription: "Unlock Generator Maintenance and amplifier upgrades",
            done() {return player.v.points.gte(3)},
            unlocked() {return hasMilestone('v', 0)}
        },
        2: {
            requirementDescription: "5 generator maintenance completions",
            effectDescription: "You can explore an additional row of generator upgrades (which are always kept on charger/amplifier resets)",
            done() {return maxedChallenge('v', 11)},
            unlocked() {return hasMilestone('v', 1)}
        },
        3: {
            requirementDescription: "7 amplifiers",
            effectDescription: "Unlock Alternator Maintenance",
            done() {return player.v.points.gte(7)},
            unlocked() {return hasMilestone('v', 2)}
        },
        4: {
            requirementDescription: "5 alternator maintenance completions",
            effectDescription: "You can explore an additional row of alternator upgrades (which are always kept on amplifier resets)",
            done() {return maxedChallenge('v', 21)},
            unlocked() {return hasMilestone('v', 3)}
        },
        5: {
            requirementDescription: "13 amplifiers",
            effectDescription: "Unlock Dynamo Maintenance",
            done() {return player.v.points.gte(13) && player.v.unlockOrder == 0},
            unlocked() {return hasMilestone('v', 4) && player.v.unlockOrder == 0}
        },
        6: {
            requirementDescription: "5 dynamo maintenance completions",
            effectDescription: "Chargers behave as if they were unlocked first, and unlock the Alternator battery if not unlocked already.",
            done() {return maxedChallenge('v', 22) && player.v.unlockOrder == 0},
            onComplete() {player.c.unlockOrder = 0},
            unlocked() {return hasMilestone('v', 5) && player.v.unlockOrder == 0}
        },
        7: {
            requirementDescription: "32 amplifiers",
            effectDescription: "Voltage can no longer decrease",
            done() {return player.v.points.gte(32)},
            unlocked() {return hasMilestone('v', 6)}
        },
        8: {
            requirementDescription: "48 amplifiers",
            effectDescription: "You can buy max amplifiers",
            done() {return player.v.points.gte(48)},
            unlocked() {return hasMilestone('v', 7)}
        },
        9: {
            requirementDescription: "100 amplifiers",
            effectDescription: "Automatically reset for amplifiers",
            done() {return player.v.points.gte(100)},
            toggles: [['v', 'autoPrestigeToggle']],
            unlocked() {return hasMilestone('v', 8)}
        },
    },
    
    hotkeys: [
        {key: "v", description: "V: Reset for amplifiers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    update(diff) {
        player.v.voltage = player.v.voltage.add((tmp.v.effect.sub(player.v.voltageDecay).max(hasMilestone('v', 7) ? 0 : Decimal.dNegInf)).mul(diff)).max(0)
        player.v.voltageDecay = player.v.voltageDecay.add(tmp.v.decayRate.mul(diff)).max(0)
    },
    doReset(resettingLayer) {
        let keep = ['milestones', 'best', 'autoPrestigeToggle']
        let keptUpgrades = []
        
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)

        player[this.layer].upgrades.push(...keptUpgrades)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", () => {return `Amplifier Base: ${format(tmp.v.genBase)}`}],
        ["display-text", () => {if (tmp.v.freeGens.gt(0)) return `Free Amplifiers: ${format(tmp.v.freeGens)}`}],
        "blank",
        ["display-text", () => {return `You have ${format(player.v.voltage)} volts (V) (${tmp.v.effect.sub(player.v.voltageDecay).sign == -1 ? "" : "+"}${format(tmp.v.effect.sub(player.v.voltageDecay).max(hasMilestone('v', 7) ? 0 : Decimal.dNegInf))} V/s), which are making points multiply themselves by xlog(n+1)^${format(tmp.v.genPowEffect)} (x${format(player.points.add(1).log(10).pow(tmp.v.genPowEffect).add(1))})<br>${tmp.v.genPowEffect.gte(tmp.v.genPowEffectSoftcap) ? " <b style='color: #ff0000'>[SOFTCAPPED]</b>" : ""}`}],
        ["display-text", () => {return `Voltage decay rate: ${format(tmp.v.decayRate)} V/s² (-${format(player.v.voltageDecay)} V/s)`}],
        "blank",
        "milestones",
        "blank",
        ["clickable", 11],
        "blank",
        "challenges",
        "blank",
        ["display-text", () => {if (hasMilestone('v', 1)) return "Purchasing an upgrade that costs Voltage will automatically reset Voltage and Voltage Decay"}],
        "blank",
        "upgrades"
    ],
    layerShown(){return player.a.unlocked && player.d.unlocked}
})