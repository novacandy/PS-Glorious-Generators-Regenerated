addLayer("m", {

    name: "meta generator",
    symbol: "M",
    row: 3,
    position: 0,
    color: "#d997ff",

    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        metaGenPower: new Decimal(0),
        pseudoUnlocks: [],
        autoPrestigeToggle: false,
    }},

    requires() {return new Decimal('e2000000')},
    resource: "meta generators",
    baseResource: "points",
    baseAmount() {return player.points},
    type: "static",
    exponent() {return 100},

    branches: ['c', 'v'],

    onPrestige() {
    },

    effect() { 
        let effect = Decimal.pow(tmp[this.layer].genBase, player[this.layer].points.add(tmp[this.layer].freeGens)).mul(tmp[this.layer].genPowerMults).sub(1).max(0)
        return effect
    },
    effectDescription() {
        return `which are generating ${format(tmp[this.layer].effect)} meta generator power/s<br>(Formula: (${format(tmp[this.layer].genBase)}^(n+${format(tmp[this.layer].freeGens)})x${format(tmp[this.layer].genPowerMults)})-1)`
    },
    genPowEffect() {
        let effect = new Decimal(1)
        return effect
    },

    genPowerMults() {
        let mult = new Decimal(1)
        return mult
    },
    genBase() {
        let base = new Decimal(2)
        return base
    },
    freeGens() {
        let free = new Decimal(0)
        return free
    },

    update(diff) {
        player.m.metaGenPower = player.m.metaGenPower.add(tmp.m.effect.mul(diff))
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["display-text", () => {return `Generator Base: ${format(tmp.m.genBase)}`}],
        ["display-text", () => {if (tmp.m.freeGens.gt(0)) return `Free Generators: ${format(tmp.m.freeGens)}`}],
        "blank",
        ["display-text", () => {return `You have ${format(player.m.metaGenPower)} meta generator power (MP)`}],
    ],
    layerShown(){return player.c.unlocked && player.v.unlocked}
})