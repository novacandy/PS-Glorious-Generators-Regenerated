var layoutInfo = {
    startTab: "none",
    startNavTab: "tree-tab",
	showTree: true,

    treeLayout: ""

    
}


// Ghost layers, for the cool tree shape :D
addNode("row0offset", {
    layerShown: "ghost",
})
addLayer("row2offset", {
    layerShown() {
        if (!tmp.c.layerShown) {
            return false
        } else return "ghost"
    },
    row: 1,
    position: 0
})
addLayer("row3offset", {
    layerShown() {
        return "ghost"
    },
    row: 2,
    position: 2
})
addLayer("row3offset2", {
    layerShown() {
        if (tmp.v.layerShown) {
            return false
        } else return "ghost"
    },
    row: 2,
    position: 3
})



addLayer("tree-tab", {
    tabFormat: [["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]],
    previousTab: "",
    leftTab: true,
})