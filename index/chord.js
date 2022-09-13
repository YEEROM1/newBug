var width = document.querySelector('.chord').offsetWidth,
    height = document.querySelector(".chord").offsetHeight;

var radius = Math.min(width, height) / 2 - 50;

d3.json('chord.json').then(d => {
    var cluster = d3.cluster()
        .size([360, radius]);

    var root = d3.hierarchy(d.node)
    cluster(root);
    for (var i = 0; i < root.children.length; i++) {
        // console.log(root.children[i].y);
        root.children[i].y = 100;
    }
    var svg = d3.select('.chord')
        .append("svg")
        .attr("width", radius * 2)
        .attr("height", radius * 2)

    svg.append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")")
        .attr("class", "links")
        .selectAll("path")
        .data(root.links())
        .enter()
        .append("path")
        .attr("d", function (d) {
            if (d.source.parent) {
                return "M" + project(d.source.x, d.source.y) + " " +
                    "C" + project(d.source.x, d.source.y) + " " +
                    project(d.source.x, d.source.y) + " " +
                    project(d.source.x, d.source.y)
            }
        })
        .transition()
        .duration(1000)
        .attr("d", function (d) {
            if (d.source.parent) {
                return "M" + project(d.source.x, d.source.y) + "" +
                    "C" + project(d.source.x, (d.source.y + d.target.y) / 2) + " " +
                    project(d.source.x, (d.source.y + d.target.y) / 2) + " " +
                    project(d.source.x, d.target.y)
            }
        })
        .transition()
        .duration(1000)
        .delay(100)
        .attr("d", function (d) {
            if (d.source.parent) {
                return "M" + project(d.source.x, d.source.y) + "" +
                    "C" + project(d.source.x, (d.source.y + d.target.y) / 2) + " " +
                    project(d.target.x, (d.source.y + d.target.y) / 2) + " " +
                    project(d.target.x, d.target.y)
            }
        })
})

function project(x, y, a = 0) {
    var angle = 0.75 * (x + 180) / 180 * Math.PI, radius = y
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
}
