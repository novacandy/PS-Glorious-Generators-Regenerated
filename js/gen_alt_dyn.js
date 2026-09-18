addLayer("g", {

    name: "generators",
    symbol: "G",
    row: 0,
    position: 0,
    color: "#a3d9a5",

    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        genPower: new Decimal(0),
        autoPrestigeToggle: false,
        pseudoUnlocks: []
    }},

    requires: new Decimal(10),
    resource: "generators",
    baseResource: "points",
    baseAmount() {return player.points},
    type: "static",
    exponent: 1.65,

    onPrestige() {
        if (!tmp[this.layer].resetsNothing) player.g.genPower = new Decimal(0)
    },
    resetsNothing() {return hasMilestone('g', 0)},
    canBuyMax() {return hasMilestone('g', 1)},
    autoPrestige() {return hasMilestone('g', 2) && player.g.autoPrestigeToggle},

    effect() { 
        let effect = Decimal.pow(tmp[this.layer].genBase, player[this.layer].points.mul(tmp[this.layer].genEffectiveness).add(tmp[this.layer].freeGens)).mul(tmp[this.layer].genPowerMults).sub(1).max(0)
        return effect
    },
    effectDescription() {
        if (player.c.unlocked) return `which are generating ${format(tmp[this.layer].effect)} generator power/s<br>(Formula: (${format(tmp[this.layer].genBase)}^(n*${format(tmp[this.layer].genEffectiveness)}+${format(tmp[this.layer].freeGens)})x${format(tmp[this.layer].genPowerMults)})-1)`
        return `which are generating ${format(tmp[this.layer].effect)} generator power/s<br>(Formula: (${format(tmp[this.layer].genBase)}^(n+${format(tmp[this.layer].freeGens)})x${format(tmp[this.layer].genPowerMults)})-1)`
    },
    genPowEffect() {
        let effect = player.g.genPower.add(1).pow(0.5)
        if (hasUpgrade('g', 14)) effect = effect.pow(upgradeEffect('g', 14))
        return effect
    },

    genPowerMults() {
        let mult = new Decimal(1)
        if (hasUpgrade('g', 12)) mult = mult.mul(upgradeEffect('g', 12))
        if (hasUpgrade('a', 22)) mult = mult.mul(upgradeEffect('a', 22))
        if (hasUpgrade('d', 21)) mult = mult.mul(upgradeEffect('d', 21))
        if (hasChallenge('v', 11)) mult = mult.mul(player.g.genPower.add(1).log(10).pow(tmp.v.genPowEffect.mul(tmp.v.challenges[11].rewardEffect)).add(1))
        return mult
    },
    genBase() {
        let base = new Decimal(2)
        if (hasUpgrade('g', 21)) base = base.add(upgradeEffect('g', 21))
        base = base.add(tmp.a.genPowEffect)
        if (hasUpgrade('d', 22)) base = base.add(upgradeEffect('d', 22))
        base = base.add(tmp.c.batteries.genBattery.effect)

        if (inChallenge('v', 11)) base = new Decimal(2)

        return base
    },
    freeGens() {
        let free = new Decimal(0)
        if (hasUpgrade('g', 13)) free = free.add(upgradeEffect('g', 13))
        if (hasUpgrade('a', 13)) free = free.add(upgradeEffect('a', 13))
        free = free.add(tmp.d.genPowEffect)
        free = free.add(tmp.c.batteries.genBattery.effect)
        
        if (inChallenge('v', 11)) free = new Decimal(0)
        
        return free
    },
    genEffectiveness() {
        let eff = new Decimal(1)
        eff = eff.add(tmp.c.genPowEffect)
        if (hasUpgrade('c', 21)) eff = eff.add(upgradeEffect('c', 21))
        if (hasUpgrade('v', 22)) eff = eff.add(upgradeEffect('v', 22))

        if (inChallenge('v', 11)) eff = new Decimal(0)

        return eff
    },

    upgrades: {
        11: {
            title: "Stronger Generators",
            description() {return "Earn a multiplier to points based on generators. Effect: x" + format(this.effect())},
            cost: new Decimal(3),
            effect() {
                let effect = player.g.points.pow(0.9).add(1)
                if (inChallenge('v', 11)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return true}
        },
        12: {
            title: "Faster Generators",
            description() {return "Earn a multiplier to GP generation based on points. Effect: x" + format(this.effect())},
            cost: new Decimal(5),
            effect() {
                let effect = player.points.add(1).log(2).add(1)
                if (inChallenge('v', 11)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return hasUpgrade('g', 11) || hasUpgrade(this.layer, this.id)}
        },
        13: {
            title: "More Generators",
            description() {return "Earn free generators based on GP. Effect: +" + format(this.effect())},
            cost: new Decimal(7),
            effect() {
                let effect = player.g.genPower.add(1).pow(0.1).log(10).add(1)
                if (inChallenge('v', 11)) effect = new Decimal(0)
                return effect
            },
            unlocked() {return hasUpgrade('g', 12) || hasUpgrade(this.layer, this.id)}
        },
        14: {
            title: "Stronger Power",
            description() {return "Square the GP effect. Effect: ^" + format(this.effect())},
            cost: new Decimal(9),
            effect() {
                let effect = new Decimal(2)
                if (inChallenge('v', 11)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return hasUpgrade('g', 13) || hasUpgrade(this.layer, this.id)}
        },
        21: {
            title: "Better Generators",
            description() {return "Increase the generator base based on GP. Effect: +" + format(this.effect())},
            cost: new Decimal(250),
            effect() {
                let effect = player.g.genPower.add(1).log10().div(5)
                if (inChallenge('v', 11)) effect = new Decimal(0)
                return effect
            },
            unlocked() {return hasUpgrade('g', 11) || hasUpgrade(this.layer, this.id)},
            currencyLayer: "g",
            currencyDisplayName: "GP",
            currencyInternalName: "genPower",
        },
        22: {
            title: "Self Generation",
            description() {return "Earn a multiplier to points based on itself. Effect: x" + format(this.effect())},
            cost: new Decimal(1000),
            effect() {
                let effect = player.points.add(1).log10().add(1)
                if (inChallenge('v', 11)) effect = new Decimal(1)              
                return effect
            },
            unlocked() {return hasUpgrade('g', 21) || hasUpgrade(this.layer, this.id)},
            currencyLayer: "g",
            currencyDisplayName: "GP",
            currencyInternalName: "genPower",
        },
        23: {
            title: "Base Point",
            description() {return "Earn a multiplier to points based on the generator base. Effect: x" + format(this.effect())},
            cost: new Decimal(25000),
            effect() {
                let effect = tmp.g.genBase.pow(3)
                if (inChallenge('v', 11)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return hasUpgrade('g', 22) || hasUpgrade(this.layer, this.id)},
            currencyLayer: "g",
            currencyDisplayName: "GP",
            currencyInternalName: "genPower",
        },
        24: {
            title: "Multi Generation",
            description() {return "Earn a multiplier to points based on the generator effect. Effect: x" + format(this.effect())},
            cost: new Decimal(5000000),
            effect() {
                let effect = tmp.g.effect.pow(0.25).add(1)
                if (inChallenge('v', 11)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return hasUpgrade('g', 23) || hasUpgrade(this.layer, this.id)},
            currencyLayer: "g",
            currencyDisplayName: "GP",
            currencyInternalName: "genPower",
        },

        // Pseudo upgrades
        31: {
            title: "Slow Burn",
            description() {return "Slow down voltage decay based on generators. Effect: /" + format(this.effect())},
            effect() {
                let effect = player.g.points.add(1).log(10).add(1)
                return effect
            },

            currencyCost() {return new Decimal(player.v.unlockOrder == 1 ? '1e2370' : '1e970')}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "g",
            currencyInternalName: "genPower",
            currencyDisplayName: "GP",

            unlocked() {return hasMilestone('v', 2)},
            pseudoReq() {return player.g.points.gte(player.v.unlockOrder == 1 ? 96 : 66) && inChallenge('v', 11)},
            pseudoReqDisplay() {return (player.v.unlockOrder == 1 ? "96" : "66") + " generators inside of <b>Generator Maintenance</b>"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.g.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.g.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        32: {
            title: "Dynamite",
            description() {return "Increase the dynamo base based on generators. Effect: +" + format(this.effect())},
            effect() {
                let effect = player.g.points.add(1).log(10).pow(2).add(1)
                return effect
            },

            currencyCost() {return new Decimal(player.v.unlockOrder == 1 ? '3.33e3333' : '1e1540')}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "g",
            currencyInternalName: "genPower",
            currencyDisplayName: "GP",

            unlocked() {return hasMilestone('v', 2)},
            pseudoReq() {return player.points.gte(player.v.unlockOrder == 1 ? '2.34e567' : '1e500') && inChallenge('v', 11) && player.g.points.eq(0)},
            pseudoReqDisplay() {return (player.v.unlockOrder == 1 ? "2.34e567" : "1.00e500") + " points inside of <b>Generator Maintenance</b> and without any generators"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.g.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.g.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        33: {
            title: "Servo Amp",
            description() {return "Earn free alternators based on amplifiers. Effect: +" + format(this.effect())},
            effect() {
                let effect = player.v.points.pow(1.1)
                return effect
            },

            currencyCost() {return new Decimal('1e69000')}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "g",
            currencyInternalName: "genPower",
            currencyDisplayName: "GP",

            unlocked() {return hasMilestone('v', 2)},
            pseudoReq() {return tmp.g.genEffectiveness.gte(1.5)},
            pseudoReqDisplay() {return '150% generator effectiveness'},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.g.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.g.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        34: {
            title: "Power-Added Efficiency",
            description() {return "Earn free amplifiers based on GP. Effect: +" + format(this.effect())},
            effect() {
                let effect = player.g.genPower.add(1).log(10).add(1).log(10).pow(0.2)
                return effect
            },

            currencyCost() {return new Decimal('1e81000')}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "g",
            currencyInternalName: "genPower",
            currencyDisplayName: "GP",

            unlocked() {return hasMilestone('v', 2)},
            pseudoReq() {return player.g.genPower.gte('1e27000') && player.g.points.eq(0) && player.a.points.eq(0) && player.d.points.eq(0)},
            pseudoReqDisplay() {return '1e27000 GP without generators, alternators, or dynamos'},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.g.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.g.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        41: {
            title: "Multi Generation II",
            description() {return "Earn a multiplier to DC based on the generator effect. Effect: x" + format(this.effect())},
            effect() {
                let effect = tmp.g.effect.add(1).log(2).pow(5).add(1)
                return effect
            },

            currencyCost() {return new Decimal(player.c.unlockOrder == 1 ? 375 : 194)}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "g",
            currencyInternalName: "points",
            currencyDisplayName: "generators",

            unlocked() {return hasMilestone('c', 3)},
            pseudoReq() {return player.g.genPower.gte(player.c.unlockOrder == 1 ? '1e1350' : 1e230) && player.g.points.eq(0)},
            pseudoReqDisplay() {return (player.c.unlockOrder == 1 ? "1e1350" : "1.00e230") + " GP without any non-free generators"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.g.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.g.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        42: {
            title: "At My Limit",
            description() {return "Multiply the charge limit based on GP. Effect: x" + format(this.effect())},
            effect() {
                let effect = player.g.genPower.add(1).log(10).pow(0.75).add(1)
                return effect
            },

            currencyCost() {return new Decimal(player.c.unlockOrder == 1 ? 403 : 205)}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "g",
            currencyInternalName: "points",
            currencyDisplayName: "generators",

            unlocked() {return hasMilestone('c', 3)},
            pseudoReq() {return player.g.points.gte(player.c.unlockOrder == 1 ? 376 : 158) && tmp.c.batteries.genBattery.amount.eq(0)},
            pseudoReqDisplay() {return (player.c.unlockOrder == 1 ? "376" : "158") + " generators without filling up the generator battery once"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.g.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.g.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        43: {
            title: "USB-C",
            description() {return "Earn free chargers based on AC. Effect: +" + format(this.effect())},
            effect() {
                let effect = player.a.alternatingCurrent.add(1).log(10).add(1).log(10)
                return effect
            },

            currencyCost() {return new Decimal(2350)}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "g",
            currencyInternalName: "points",
            currencyDisplayName: "generators",

            unlocked() {return hasMilestone('c', 3)},
            pseudoReq() {return player.points.gte('1e13800') && inChallenge('g', 11) && tmp.c.batteries.genBattery.amount().eq(0) && player.g.points.eq(0)},
            pseudoReqDisplay() {return "1e13800 points without generators, generator batteries, and inside <b>Generator Maintenance</b>"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.g.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.g.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        44: {
            title: "Power Banks",
            description() {return "Total filled batteries increase the charger base. Effect: +" + format(this.effect())},
            effect() {
                let effect = tmp.c.batteries.total.add(1).log(1000).add(1)
                return effect
            },

            currencyCost() {return new Decimal(3390)}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "g",
            currencyInternalName: "points",
            currencyDisplayName: "generators",

            unlocked() {return hasMilestone('c', 3)},
            pseudoReq() {return player.points.gte('1e200000')},
            pseudoReqDisplay() {return "1e200000 points"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.g.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.g.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
    },

    milestones: {
        0: {
            requirementDescription: "15 generators",
            effectDescription: "Generators reset nothing",
            done() {return player.g.points.gte(15)},
            unlocked() {return player.a.unlocked || player.d.unlocked}
        },
        1: {
            requirementDescription: "20 generators",
            effectDescription: "You can buy max generators",
            done() {return player.g.points.gte(20)},
            unlocked() {return hasMilestone('g', 0)}
        },
        2: {
            requirementDescription: "25 generators",
            effectDescription: "Automatically reset for generators",
            done() {return player.g.points.gte(25)},
            toggles: [['g', 'autoPrestigeToggle']],
            unlocked() {return hasMilestone('g', 1)}
        },
    },
    
    hotkeys: [
        {key: "g", description: "G: Reset for generators", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer) {
        let keep = ['milestones', 'best', 'autoPrestigeToggle']
        let keptUpgrades = []
        
        if (resettingLayer == 'a') {
            toKeep = [11, 12, 13, 14, 21, 22, 23, 24]
            amountToKeep = player.a.best.gte(8) ? 8 : player.a.best.mag

            for (let i = 0; i < amountToKeep; i++) {
                let randomID = Math.floor(Math.random()*(toKeep.length))
                keptUpgrades.push(toKeep[randomID])
                toKeep.splice(randomID, 1) 
            }
        }
        if (resettingLayer == 'd') {
            toKeep = [11, 12, 13, 14, 21, 22, 23, 24]
            amountToKeep = player.d.best.gte(8) ? 8 : player.d.best.mag

            for (let i = 0; i < amountToKeep; i++) {
                let randomID = Math.floor(Math.random()*(toKeep.length))
                keptUpgrades.push(toKeep[randomID])
                toKeep.splice(randomID, 1) 
            }
        }
        if (resettingLayer == 'c') {
            toKeep = [11, 12, 13, 14, 21, 22, 23, 24]
            amountToKeep = player.c.best.gte(8) ? 8 : player.c.best.mag

            for (let i = 0; i < amountToKeep; i++) {
                let randomID = Math.floor(Math.random()*(toKeep.length))
                keptUpgrades.push(toKeep[randomID])
                toKeep.splice(randomID, 1) 
            }
        }
        if (resettingLayer == 'v') {
            toKeep = [11, 12, 13, 14, 21, 22, 23, 24]
            amountToKeep = player.v.best.gte(8) ? 8 : player.v.best.mag

            for (let i = 0; i < amountToKeep; i++) {
                let randomID = Math.floor(Math.random()*(toKeep.length))
                keptUpgrades.push(toKeep[randomID])
                toKeep.splice(randomID, 1) 
            }
        }

        if (hasUpgrade('g', 31)) keptUpgrades.push(31)
        if (hasUpgrade('g', 32)) keptUpgrades.push(32)
        if (hasUpgrade('g', 33)) keptUpgrades.push(33)
        if (hasUpgrade('g', 34)) keptUpgrades.push(34)
        if (hasUpgrade('g', 41)) keptUpgrades.push(41)
        if (hasUpgrade('g', 42)) keptUpgrades.push(42)
        if (hasUpgrade('g', 43)) keptUpgrades.push(43)
        if (hasUpgrade('g', 44)) keptUpgrades.push(44)
        
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)

        player[this.layer].upgrades.push(...keptUpgrades)
    },
    update(diff) {
        player.g.genPower = player.g.genPower.add(tmp.g.effect.mul(diff)).max(0)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", () => {return `Generator Base: ${format(tmp.g.genBase)}`}],
        ["display-text", () => {if (tmp.g.freeGens.gt(0)) return `Free Generators: ${format(tmp.g.freeGens)}`}],
        ["display-text", () => {if (tmp.g.genEffectiveness.gt(1)) return `Generator Effectiveness: ${format(tmp.g.genEffectiveness.mul(100))}%`}],
        "blank",
        ["display-text", () => {return `You have ${format(player.g.genPower)} generator power (GP), which are multiplying point gain by x${format(tmp.g.genPowEffect)}`}],
        "blank",
        "milestones",
        "blank",
        "upgrades"
    ],
    layerShown(){return true}
})
addLayer("a", {

    name: "alternators",
    symbol: "A",
    row: 1,
    displayRow: 2,
    position: 0,
    color: "#ff9797",

    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        alternatingCurrent: new Decimal(0),
        autoPrestigeToggle: false,
        unlockOrder: 0,
        pseudoUnlocks: []
    }},

    requires() {return player.a.unlockOrder == 1 ? new Decimal(1e100) : new Decimal(1e21)},
    resource: "alternators",
    baseResource: "points",
    baseAmount() {return player.points},
    type: "static",
    exponent() {return 2 + (player.a.unlockOrder * 0.5)},

    branches: ['g'],
    increaseUnlockOrder: ['d'],

    onPrestige() {
        if (!tmp[this.layer].resetsNothing) player.a.alternatingCurrent = new Decimal(0)
    },
    resetsNothing() {return hasMilestone('a', 1)},
    canBuyMax() {return hasMilestone('a', 2)},
    autoPrestige() {return hasMilestone('a', 4) && player.a.autoPrestigeToggle},

    effect() { 
        let effect = Decimal.pow(tmp[this.layer].genBase, player[this.layer].points.add(tmp[this.layer].freeGens)).mul(tmp[this.layer].genPowerMults).sub(1).max(0)
        return effect
    },
    effectDescription() {
        return `which are generating ${format(tmp[this.layer].effect)} alternating current/s<br>(Formula: (${format(tmp[this.layer].genBase)}^(n+${format(tmp[this.layer].freeGens)})x${format(tmp[this.layer].genPowerMults)})-1)`
    },
    genPowEffect() {
        let effect = player.a.alternatingCurrent.add(1).log(10).div(5)
        if (hasUpgrade('a', 31)) effect = effect.mul(upgradeEffect('a', 31))
        return effect
    },

    genPowerMults() {
        let mult = new Decimal(1)
        if (hasUpgrade('a', 14)) mult = mult.mul(upgradeEffect('a', 14))
        if (hasChallenge('v', 21)) mult = mult.mul(player.a.alternatingCurrent.add(1).log(10).pow(tmp.v.genPowEffect.mul(tmp.v.challenges[21].rewardEffect)).add(1))
        if (hasUpgrade('a', 32)) mult = mult.mul(upgradeEffect('a', 32)[0])
        return mult
    },
    genBase() {
        let base = new Decimal(2)
        if (hasUpgrade('a', 12)) base = base.add(upgradeEffect('a', 12))
        base = base.add(tmp.c.batteries.altBattery.effect)

        if (inChallenge('v', 21)) base = new Decimal(2)

        return base
    },
    freeGens() {
        let free = new Decimal(0)
        if (hasUpgrade('a', 23)) free = free.add(upgradeEffect('a', 23))
        if (hasUpgrade('v', 11)) free = free.add(upgradeEffect('v', 11))
        free = free.add(tmp.c.batteries.altBattery.effect)
        if (hasUpgrade('g', 33)) free = free.add(upgradeEffect('g', 33))
        if (hasUpgrade('d', 34)) free = free.add(upgradeEffect('d', 34))

        if (inChallenge('v', 21)) free = new Decimal(0)

        return free
    },

    upgrades: {
        11: {
            title: "Point Wire",
            description() {return "Earn a multiplier to points based on AC. Effect: x" + format(this.effect())},
            cost: new Decimal(250),
            effect() {
                let effect = player.a.alternatingCurrent.add(1).pow(0.5)
                if (inChallenge('v', 21)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return true},
            currencyLayer: "a",
            currencyDisplayName: "AC",
            currencyInternalName: "alternatingCurrent",
        },
        12: {
            title: "Better Alternators",
            description() {return "Increase the alternator base based on AC. Effect: +" + format(this.effect())},
            cost: new Decimal(5000),
            effect() {
                let effect = player.a.alternatingCurrent.pow(0.25).add(1).log(10)
                if (inChallenge('v', 21)) effect = new Decimal(0)
                return effect
            },
            unlocked() {return hasUpgrade('a', 11)},
            currencyLayer: "a",
            currencyDisplayName: "AC",
            currencyInternalName: "alternatingCurrent",
        },
        13: {
            title: "Bonus Stacker",
            description() {return "Earn free generators based on the alternator base. Effect: +" + format(this.effect())},
            cost: new Decimal(10000000),
            effect() {
                let effect = tmp.a.genBase.pow(0.6)
                if (inChallenge('v', 21)) effect = new Decimal(0)
                return effect
            },
            unlocked() {return hasUpgrade('a', 12)},
            currencyLayer: "a",
            currencyDisplayName: "AC",
            currencyInternalName: "alternatingCurrent",
        },
        14: {
            title: "Generator Current",
            description() {return "Earn a multiplier to AC generation based on GP. Effect: x" + format(this.effect())},
            cost: new Decimal(1e11),
            effect() {
                let effect = player.g.genPower.add(1).log(10).pow(2).add(1)
                if (inChallenge('v', 21)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return hasUpgrade('a', 13)},
            currencyLayer: "a",
            currencyDisplayName: "AC",
            currencyInternalName: "alternatingCurrent",
        },
        21: {
            title: "Stronger Alternators",
            description() {return "Earn a multiplier to points based on alterators. Effect: x" + format(this.effect())},
            cost: new Decimal(5),
            effect() {
                let effect = player.a.points.add(1).pow(1.5)
                if (inChallenge('v', 21)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return hasUpgrade('a', 11)},
        },
        22: {
            title: "Self Generation II",
            description() {return "Earn a multiplier to GP based on itself. Effect: x" + format(this.effect())},
            cost: new Decimal(8),
            effect() {
                let effect = player.g.genPower.add(1).log(20).add(1)
                if (inChallenge('v', 21)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return hasUpgrade('a', 21)},
        },
        23: {
            title: "More Alternators",
            description() {return "Earn free alternators based on AC. Effect: +" + format(this.effect())},
            cost: new Decimal(13),
            effect() {
                let effect = player.a.alternatingCurrent.add(1).log(100).pow(0.2)
                if (inChallenge('v', 21)) effect = new Decimal(0)
                return effect
            },
            unlocked() {return hasUpgrade('a', 21)},
        },
        24: {
            title: "Multi Alternation",
            description() {return "Earn a multiplier to points based on the alternator effect. Effect: x" + format(this.effect())},
            cost: new Decimal(15),
            effect() {
                let effect = tmp.a.effect.add(1).pow(0.125)
                if (inChallenge('v', 21)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return hasUpgrade('a', 21)},
        },

        // Pseudo upgrades
        31: {
            title: "Stronger Current",
            description() {return "Quintuple the alternator effect. Effect: x" + format(this.effect())},
            effect() {
                let effect = new Decimal(5)
                return effect
            },

            currencyCost() {return new Decimal(player.v.unlockOrder == 1 ? '1e444' : '1e512')}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "a",
            currencyInternalName: "alternatingCurrent",
            currencyDisplayName: "AC",

            unlocked() {return hasMilestone('v', 4)},
            pseudoReq() {return player.a.points.gte(player.v.unlockOrder == 1 ? 135 : 152) && inChallenge('v', 21)},
            pseudoReqDisplay() {return (player.v.unlockOrder == 1 ? "135" : "152") + " alternators inside of <b>Alternator Maintenance</b>"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.a.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.a.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        32: {
            title: "Synchronized Generation",
            description() {return "Earn a multiplier to AC and DC gains based on each other. Effect: x" + format(this.effect()[0]) + " AC, x" + format(this.effect()[1]) + " DC"},
            effect() {
                let effect = [player.d.directCurrent.add(1).log(10).pow(333).add(1), player.a.alternatingCurrent.add(1).log(10).pow(333).add(1)]
                return effect
            },

            currencyCost() {return new Decimal(1000)}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "a",
            currencyInternalName: "points",
            currencyDisplayName: "alternators",

            unlocked() {return hasMilestone('v', 4)},
            pseudoReq() {return player.a.alternatingCurrent.gte('1e5000') && player.a.points.eq(0) && inChallenge('v', 21)},
            pseudoReqDisplay() {return "1.00e5000 AC without any alternators and inside of <b>Alternator Maintenance</b>"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.a.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.a.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        33: {
            title: "Overclock Overflow",
            description() {return "Earn free amplifiers based on non-free amplifiers. Effect: +" + format(this.effect())},
            effect() {
                let effect = player.v.points.add(1).log(10)
                return effect
            },

            currencyCost() {return new Decimal('1e20450')}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "a",
            currencyInternalName: "alternatingCurrent",
            currencyDisplayName: "AC",

            unlocked() {return hasMilestone('v', 4)},
            pseudoReq() {return player.a.points.gte(600) && inChallenge('v', 11)},
            pseudoReqDisplay() {return "600 alternators inside of <b>Generator Maintenance</b>"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.a.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.a.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        34: {
            title: "Alternate Direction",
            description() {return "Earn free dynamos based on alternators. Effect: +" + format(this.effect())},
            effect() {
                let effect = player.a.points.div(10)
                return effect
            },

            currencyCost() {return new Decimal(2500)}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "a",
            currencyInternalName: "points",
            currencyDisplayName: "alternators",

            unlocked() {return hasMilestone('v', 4)},
            pseudoReq() {return player.a.alternatingCurrent.gte('1e50000')},
            pseudoReqDisplay() {return "1e48000 AC"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.a.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.a.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        }
    },

    milestones: {
        0: {
            requirementDescription: "1 alternator",
            effectDescription: "Keep one random generator upgrade on reset per alternator",
            done() {return player.a.points.gte(1)},
        },
        1: {
            requirementDescription: "15 alternators",
            effectDescription: "Alternators reset nothing",
            done() {return player.a.points.gte(15)},
            unlocked() {return hasMilestone('a', 0)}
        },
        2: {
            requirementDescription: "21 alternators",
            effectDescription: "Dynamos behave as if you unlocked them first",
            done() {return player.a.points.gte(21)},
            unlocked() {return hasMilestone('a', 1)},
            onComplete() {player.d.unlockOrder = 0}
        },
        3: {
            requirementDescription: "40 alternators",
            effectDescription: "You can buy max alternators",
            done() {return player.a.points.gte(40)},
            unlocked() {return hasMilestone('a', 2)},
        },
        4: {
            requirementDescription: "75 alternators",
            effectDescription: "Automatically reset for alternators",
            done() {return player.a.points.gte(75)},
            toggles: [['a', 'autoPrestigeToggle']],
            unlocked() {return hasMilestone('a', 3)}
        },
    },
    
    hotkeys: [
        {key: "a", description: "A: Reset for alternators", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    update(diff) {
        player.a.alternatingCurrent = player.a.alternatingCurrent.add(tmp.a.effect.mul(diff)).max(0)
    },
    doReset(resettingLayer) {
        let keep = ['milestones', 'best', 'autoPrestigeToggle']
        let keptUpgrades = []
        
        if (resettingLayer == 'c') return

        if (resettingLayer == 'v') {
            toKeep = [11, 12, 13, 14, 21, 22, 23, 24]
            amountToKeep = player.v.best.gte(8) ? 8 : player.v.best.mag

            for (let i = 0; i < amountToKeep; i++) {
                let randomID = Math.floor(Math.random()*(toKeep.length))
                keptUpgrades.push(toKeep[randomID])
                toKeep.splice(randomID, 1) 
            }
        }
        if (hasUpgrade('a', 31)) keptUpgrades.push(31)
        if (hasUpgrade('a', 32)) keptUpgrades.push(32)
        if (hasUpgrade('a', 33)) keptUpgrades.push(33)
        if (hasUpgrade('a', 34)) keptUpgrades.push(34)

        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)

        player[this.layer].upgrades.push(...keptUpgrades)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", () => {return `Alternator Base: ${format(tmp.a.genBase)}`}],
        ["display-text", () => {if (tmp.a.freeGens.gt(0)) return `Free Alternators: ${format(tmp.a.freeGens)}`}],
        "blank",
        ["display-text", () => {return `You have ${format(player.a.alternatingCurrent)} alternating current (AC), which are increasing the generator base by +${format(tmp.a.genPowEffect)}`}],
        "blank",
        "milestones",
        "blank",
        "upgrades"
    ],
    layerShown(){return true}
})
addLayer("d", {

    name: "dynamos",
    symbol: "D",
    row: 1,
    position: 1,
    color: "#ffce97",

    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        directCurrent: new Decimal(0),
        pseudoUnlocks: [],
        autoPrestigeToggle: false,
        unlockOrder: 0
    }},

    requires() {return player.d.unlockOrder == 1 ? new Decimal(1e60) : new Decimal(1e12)},
    resource: "dynamos",
    baseResource: "GP",
    baseAmount() {return player.g.genPower},
    type: "static",
    exponent() {return 2 + (player.d.unlockOrder * 0.25)},

    branches: ['g'],
    increaseUnlockOrder: ['a'],

    onPrestige() {
        if (!tmp[this.layer].resetsNothing) player.d.directCurrent = new Decimal(0)
    },
    resetsNothing() {return hasMilestone('d', 1)},
    canBuyMax() {return hasMilestone('d', 3)},
    autoPrestige() {return hasMilestone('d', 4) && player.d.autoPrestigeToggle},

    effect() { 
        let effect = Decimal.pow(tmp[this.layer].genBase, player[this.layer].points.add(tmp[this.layer].freeGens)).mul(tmp[this.layer].genPowerMults).sub(1).max(0)
        return effect
    },
    effectDescription() {
        return `which are generating ${format(tmp[this.layer].effect)} direct current/s<br>(Formula: (${format(tmp[this.layer].genBase)}^(n+${format(tmp[this.layer].freeGens)})x${format(tmp[this.layer].genPowerMults)})-1)`
    },
    genPowEffect() {
        let effect = player.d.directCurrent.add(1).log(10).div(2)
        if (hasUpgrade('d', 31)) effect = effect.mul(upgradeEffect('d', 31))
        return effect
    },

    genPowerMults() {
        let mult = new Decimal(1)
        if (hasUpgrade('d', 24)) mult = mult.mul(upgradeEffect('d', 24))
        if (hasUpgrade('g', 41)) mult = mult.mul(upgradeEffect('g', 41))
        if (hasChallenge('v', 22)) mult = mult.mul(player.d.directCurrent.add(1).log(10).pow(tmp.v.genPowEffect.mul(tmp.v.challenges[22].rewardEffect)).add(1))
        if (hasUpgrade('a', 32)) mult = mult.mul(upgradeEffect('a', 32)[1])
        return mult
    },
    genBase() {
        let base = new Decimal(2)
        if (hasUpgrade('d', 12)) base = base.add(upgradeEffect('d', 12))
        if (hasUpgrade('d', 13)) base = base.add(upgradeEffect('d', 13))
        base = base.add(tmp.c.batteries.dynBattery.effect)
        if (hasUpgrade('c', 12)) base = base.add(upgradeEffect('c', 12))
        if (hasUpgrade('g', 32)) base = base.add(upgradeEffect('g', 32))
        
        if (inChallenge('v', 22)) base = new Decimal(2)
        
        return base
    },
    freeGens() {
        let free = new Decimal(0)
        if (hasUpgrade('d', 23)) free = free.add(upgradeEffect('d', 23))
        free = free.add(tmp.c.batteries.dynBattery.effect)
        if (hasUpgrade('v', 21)) free = free.add(upgradeEffect('v', 21))
        if (hasUpgrade('a', 34)) free = free.add(upgradeEffect('a', 34))

        if (inChallenge('v', 22)) free = new Decimal(0)

        return free
    },

    upgrades: {
        11: {
            title: "Direct Multiplier",
            description() {return "Earn a multiplier to points based on DC. Effect: x" + format(this.effect())},
            cost: new Decimal(250),
            effect() {
                let effect = player.d.directCurrent.add(1).pow(0.5)
                if (inChallenge('v', 22)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return true},
            currencyLayer: "d",
            currencyDisplayName: "DC",
            currencyInternalName: "directCurrent",
        },
        12: {
            title: "Better Dynamos",
            description() {return "Increase the dynamo base based on DC. Effect: +" + format(this.effect())},
            cost: new Decimal(5000),
            effect() {
                let effect = player.d.directCurrent.pow(0.25).add(1).log(10)
                if (inChallenge('v', 22)) effect = new Decimal(0)
                return effect
            },
            unlocked() {return hasUpgrade('d', 11)},
            currencyLayer: "d",
            currencyDisplayName: "DC",
            currencyInternalName: "directCurrent",
        },
        13: {
            title: "Base After Base",
            description() {return "Increase the dynamo base based on the generator base. Effect: +" + format(this.effect())},
            cost: new Decimal(10000000),
            effect() {
                let effect = tmp.g.genBase.pow(0.4)
                if (inChallenge('v', 22)) effect = new Decimal(0)
                return effect
            },
            unlocked() {return hasUpgrade('d', 12)},
            currencyLayer: "d",
            currencyDisplayName: "DC",
            currencyInternalName: "directCurrent",
        },
        14: {
            title: "Direct Power",
            description() {return "Earn a multiplier to DC generation based on GP. Effect: x" + format(this.effect())},
            cost: new Decimal(1e11),
            effect() {
                let effect = player.g.genPower.add(1).log(10).pow(2).add(1)
                if (inChallenge('v', 22)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return hasUpgrade('d', 13)},
            currencyLayer: "d",
            currencyDisplayName: "DC",
            currencyInternalName: "directCurrent",
        },
        21: {
            title: "Stronger Dynamos",
            description() {return "Earn a multiplier to GP based on dynamos. Effect: x" + format(this.effect())},
            cost: new Decimal(5),
            effect() {
                let effect = player.d.points.add(1).pow(1.5)
                if (inChallenge('v', 22)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return hasUpgrade('d', 11)},
        },
        22: {
            title: "Free Base",
            description() {return "Increase the generator base based on free generators. Effect: +" + format(this.effect())},
            cost: new Decimal(8),
            effect() {
                let effect = tmp.g.freeGens.add(1).log(5)
                if (inChallenge('v', 22)) effect = new Decimal(0)
                return effect
            },
            unlocked() {return hasUpgrade('d', 21)},
        },
        23: {
            title: "More Dynamos",
            description() {return "Earn free dynamos based on DC. Effect: +" + format(this.effect())},
            cost: new Decimal(12),
            effect() {
                let effect = player.d.directCurrent.add(1).log(100).pow(0.2)
                if (inChallenge('v', 22)) effect = new Decimal(0)
                return effect
            },
            unlocked() {return hasUpgrade('d', 22)},
        },
        24: {
            title: "Multi Direction",
            description() {return "Earn a multiplier to points based on the dynamo effect. Effect: x" + format(this.effect())},
            cost: new Decimal(14),
            effect() {
                let effect = tmp.d.effect.add(1).pow(0.125)
                if (inChallenge('v', 22)) effect = new Decimal(1)
                return effect
            },
            unlocked() {return hasUpgrade('d', 23)},
        },

        // Pseudo upgrades
        31: {
            title: "Stronger Current II",
            description() {return "Double the dynamo effect. Effect: x" + format(this.effect())},
            effect() {
                let effect = new Decimal(2)
                return effect
            },

            currencyCost() {return new Decimal('1e666')}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "d",
            currencyInternalName: "directCurrent",
            currencyDisplayName: "DC",

            unlocked() {return hasMilestone('c', 5)},
            pseudoReq() {return player.d.points.gte(player.c.unlockOrder == 1 ? 999 : 144) && tmp.c.batteries.total == 0},
            pseudoReqDisplay() {return (player.c.unlockOrder == 1 ? "999" : "144") + " dynamos without charging any batteries"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.d.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.d.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        32: {
            title: "Overcharge Overload",
            description() {return "Earn free chargers based on non-free chargers. Effect: +" + format(this.effect())},
            effect() {
                let effect = player.c.points.div(10)
                return effect
            },

            currencyCost() {return new Decimal(1180)}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "d",
            currencyInternalName: "points",
            currencyDisplayName: "dynamos",

            unlocked() {return hasMilestone('c', 5)},
            pseudoReq() {return player.d.directCurrent.gte('1e11000') && player.d.points.eq(0) && inChallenge('v', 22)},
            pseudoReqDisplay() {return "1e11000 DC without any dynamos and inside of <b>Dynamo Maintenance</b>"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.d.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.d.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        33: {
            title: "Synchronous Amplification",
            description() {return "Earn a multiplier to V and Q gains based on each other. Effect: x" + format(this.effect()[0]) + " V, x" + format(this.effect()[1]) + " Q"},
            effect() {
                let effect = [player.c.charge.add(1).log(10).add(1), player.v.voltage.add(1).log(10).add(1)]
                return effect
            },

            currencyCost() {return new Decimal('1e36500')}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "d",
            currencyInternalName: "directCurrent",
            currencyDisplayName: "DC",

            unlocked() {return hasMilestone('c', 5)},
            pseudoReq() {return tmp.c.batteries.genBattery.amount.gte(100)},
            pseudoReqDisplay() {return "100 fully charged generator batteries"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.d.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.d.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
        34: {
            title: "Direct Alternation",
            description() {return "Earn free alternators based on dynamos. Effect: +" + format(this.effect())},
            effect() {
                let effect = player.d.points.div(10)
                return effect
            },

            currencyCost() {return new Decimal(2100)}, // Use currencyCost instead of cost to allow unlocking the upgrade before you're able to afford the upgrade
            currencyLayer: "d",
            currencyInternalName: "points",
            currencyDisplayName: "dynamos",

            unlocked() {return hasMilestone('c', 5)},
            pseudoReq() {return player.d.directCurrent.gte('1e50000')},
            pseudoReqDisplay() {return "1e50000 DC"},

            // Ignore below
            fullDisplay() { 
                return `
                    <h3>${!player.d.pseudoUnlocks.includes(this.id) ? "Explore A New Upgrade" : this.title}</h3>
                    <p>${!player.d.pseudoUnlocks.includes(this.id) ? "Req: " + this.pseudoReqDisplay() : this.description() + "<br><br>Cost: " + formatWhole(this.currencyCost()) + " " + this.currencyDisplayName}
                `
            },
            canAfford() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    return this.pseudoReq()
                } else {
                    return player[this.currencyLayer][this.currencyInternalName].gte(this.currencyCost())
                }
            },
            onPurchase() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id)) {
                    player[this.layer].pseudoUnlocks.push(this.id)
                    player[this.layer].upgrades.pop()
                } else {
                    player[this.currencyLayer][this.currencyInternalName] = player[this.currencyLayer][this.currencyInternalName].sub(this.currencyCost())
                }
            },
            style() {
                if (!player[this.layer].pseudoUnlocks.includes(this.id) && !this.pseudoReq()) {return {
                   "border": "2px dotted white",
                   "background-color": "#000000",
                   "cursor": "not-allowed",
                   "color": "#ffffff"
                }} else if (!player[this.layer].pseudoUnlocks.includes(this.id) && this.pseudoReq()) {return {
                    "border": "2px dotted white",
                    "background-color": "#f5b942",
                    "color": "#ffffff"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && hasUpgrade(this.layer, this.id)) {return {
                    "background-color": "#77bf5f",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && !this.canAfford()) {return {
                    "background-color": "#bf8f8f",
                    "cursor": "not-allowed",
                    "color": "#000000"
                }} else if (player[this.layer].pseudoUnlocks.includes(this.id) && this.canAfford() && !hasUpgrade(this.layer, this.id)) {return {
                    "background-color": tmp[this.layer].color,
                    "color": "#000000"
                }}
            }
        },
    },

    milestones: {
        0: {
            requirementDescription: "1 dynamo",
            effectDescription: "Keep one random generator upgrade on reset per alternator",
            done() {return player.d.points.gte(1)},
        },
        1: {
            requirementDescription: "15 dynamos",
            effectDescription: "Dynamos reset nothing",
            done() {return player.d.points.gte(15)},
            unlocked() {return hasMilestone('d', 0)}
        },
        2: {
            requirementDescription: "21 dynamos",
            effectDescription: "Alternators behave as if you unlocked them first",
            done() {return player.d.points.gte(21)},
            unlocked() {return hasMilestone('d', 1)},
            onComplete() {player.a.unlockOrder = 0}
        },
        3: {
            requirementDescription: "30 dynamos",
            effectDescription: "You can buy max dynamos",
            done() {return player.d.points.gte(30)},
            unlocked() {return hasMilestone('d', 2)},
        },
        4: {
            requirementDescription: "75 dynamos",
            effectDescription: "Automatically reset for dynamos",
            done() {return player.d.points.gte(75)},
            toggles: [['d', 'autoPrestigeToggle']],
            unlocked() {return hasMilestone('d', 3)}
        },
    },
    
    hotkeys: [
        {key: "d", description: "D: Reset for dynamos", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    update(diff) {
        player.d.directCurrent = player.d.directCurrent.add(tmp.d.effect.mul(diff)).max(0)
    },
    doReset(resettingLayer) {
        let keep = ['milestones', 'best', 'autoPrestigeToggle']
        let keptUpgrades = []

        if (resettingLayer == 'v') return

        if (resettingLayer == 'c') {
            toKeep = [11, 12, 13, 14, 21, 22, 23, 24]
            amountToKeep = player.c.best.gte(8) ? 8 : player.c.best.mag

            for (let i = 0; i < amountToKeep; i++) {
                let randomID = Math.floor(Math.random()*(toKeep.length))
                keptUpgrades.push(toKeep[randomID])
                toKeep.splice(randomID, 1) 
            }
        }

        if (hasUpgrade('d', 31)) keptUpgrades.push(31)
        if (hasUpgrade('d', 32)) keptUpgrades.push(32)
        if (hasUpgrade('d', 33)) keptUpgrades.push(33)
        if (hasUpgrade('d', 34)) keptUpgrades.push(34)
        
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)

        player[this.layer].upgrades.push(...keptUpgrades)
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", () => {return `Dynamo Base: ${format(tmp.d.genBase)}`}],
        ["display-text", () => {if (tmp.d.freeGens.gt(0)) return `Free Dynamos: ${format(tmp.d.freeGens)}`}],
        "blank",
        ["display-text", () => {return `You have ${format(player.d.directCurrent)} direct current (DC), which are granting +${format(tmp.d.genPowEffect)} free generators`}],
        "blank",
        "milestones",
        "blank",
        "upgrades"
    ],
    layerShown(){return true}
})