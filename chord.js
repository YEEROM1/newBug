function Dchord() {
    var width = document.querySelector('.chord').offsetWidth,
        height = document.querySelector(".chord").offsetHeight;

    var radius = Math.min(width, height) / 2;

    d3.json('chord.json').then(d => {
        var cluster = d3.cluster()
            .size([360, radius]);

        var root = d3.hierarchy(d)
        cluster(root);
        for (var i = 0; i < root.children.length; i++) {
            // console.log(root.children[i].y);
            root.children[i].y = 100;
        }
        var svg = d3.select('.chord')
            .append("svg")
            .attr("class","chordSvg")
            .attr("width", width)
            .attr("height", radius * 2)

        svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + radius + ")")
            .attr("class", "links")
            .selectAll("path")
            .data(root.links())
            .enter()
            .append("path")
            .attr("d", function (d) {
                if (d.source.parent) {
                    return "M" + calcPath(d.source.x, d.source.y, d.source.depth) +
                        "Q" + calcPath(d.source.x, d.source.y, d.source.depth) + "," + calcPath(d.source.x, d.source.y, d.source.depth)
                }
            })
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .delay(function (d) {
                if (d.target.depth == 2) {
                    return 700
                } else {
                    return 2200
                }
            })
            .attr("d", function (d) {
                if (d.source.parent) {
                    return "M" + calcPath(d.source.x, d.source.y, d.source.depth) +
                        "Q" + calcPath(d.target.x, d.source.y, d.source.depth) + "," + calcPath(d.target.x, d.target.y, d.target.depth)
                }
            })
            .attr("opacity", 1)

        svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + radius + ")")
            .attr("class", "chordCir")
            .selectAll("circle")
            .data(root.links())
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return calcPath(d.target.x, d.target.y, d.target.depth)[0]
            })
            .attr("cy", function (d) {
                return calcPath(d.target.x, d.target.y, d.target.depth)[1]
            })
            .transition()
            .delay(function (d) {
                if (d.source.parent) {
                    if (d.target.depth == 2) {
                        return 1500
                    } else {
                        return 3000
                    }
                } else {
                    return 0
                }
            })
            .duration(1000)
            .attr("r", function (d) {
                if (d.source.parent) {
                    if (d.target.depth == 2) {
                        return 15
                    } else {
                        return 7
                    }
                } else {
                    return 50
                }
            })
    })
}

function calcPath(x, y, depth) {
    var angle = 0.75 * (x + 150) / 180 * Math.PI,
        radius = y;
    if (depth) {
        if (depth == 3) {
            radius *= 0.9
            return [radius * Math.cos(angle), radius * Math.sin(angle)];
        } else if (depth == 2) {
            radius *= 0.8
            return [radius * Math.cos(angle) + y / 3, radius * Math.sin(angle) + y / 3];
        } else if (depth == 1) {
            angle = 0.75 * (x + 150) / 180 * Math.PI;
            radius *= 0.4
            return [radius * Math.cos(angle) + y * 1.25, radius * Math.sin(angle) + y * 2];
        }
    } else {
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }
}

