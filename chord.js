function Dchord() {
    var width = document.querySelector('.chord').offsetWidth,
        height = document.querySelector(".chord").offsetHeight;

    var radius = Math.min(width, height) / 2;
    var cluster = d3.cluster()
        .size([360, radius]);

    var color = d3.scaleOrdinal(d3.schemeAccent);
    var svg = d3.select('.chord')
        .append("svg")
        .attr("class", "chordSvg")
        .attr("width", width)
        .attr("height", radius * 2)

    d3.json('chord.json').then(data => {

        var root = d3.hierarchy(data)
        cluster(root);

        for (let i = 0; i < root.children.length; i++) {
            root.children[i].y = 100;
        }

        root.descendants().forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        })

        // console.log(root);
        svg.selectAll("path")
            .data(root.links())
            .enter()
            .append("path")
            .attr("class", "chordLinks")
            .attr("transform", "translate(" + width / 2 + "," + radius + ")")
            .attr("d", function (d) {
                if (d.source.parent) {
                    return "M" + calc(d.source.x, d.source.y, d.source.depth) +
                        "Q" + calc(d.source.x, d.source.y, d.source.depth) + "," + calc(d.source.x, d.source.y, d.source.depth)
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
                    return "M" + calc(d.source.x, d.source.y, d.source.depth) +
                        "Q" + calc(d.target.x, d.source.y, d.source.depth) + "," + calc(d.target.x, d.target.y, d.target.depth)
                }
            })
            .attr("opacity", 1)

        svg.selectAll("circle")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + radius + ")")
            .attr("class", function (d) {
                return d.depth == 1 ? "chordCir" : "chordCir chordDetail";
            })
            .on("click", nodeClick)
            .on("mouseover", nodeOver)
            .append("circle")
            .attr("opacity", 1)
            .attr("cx", function (d) {
                return calc(d.x, d.y, d.depth)[0]
            })
            .attr("cy", function (d) {
                return calc(d.x, d.y, d.depth)[1]
            })
            .transition()
            .delay(function (d) {
                if (d.parent) {
                    if (d.depth == 1) {
                        return 0
                    } else if (d.depth == 2) {
                        return 1500
                    } else {
                        return 3000
                    }
                }
            })
            .duration(1000)
            .attr("opacity", 1)
            .attr("r", function (d) {
                if (d.parent) {
                    if (d.depth == 1) {
                        return 50
                    } else if (d.depth == 2) {
                        return 15
                    } else {
                        return 7
                    }
                }
            })
            .attr("fill", function (d) {
                if (d.depth >= 1) {
                    // console.log(d.ancestors().slice(-2, -1)[0].data.name);
                    return color(d.ancestors().slice(-2, -1)[0].data.name);
                }
            })

        function nodeOver(d) {
            if (d.depth == 1) {
                return;
            }
        }

        function nodeClick(d) {
            if (d.depth != 1) {
                return;
            }

            if (d.children) {
                d._children = d.children;
                d.children = null;
            }
            else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }

        function update(source) {
            cluster(root)
            var nodeData = root.descendants();
            var linkData = root.links();
            for (let i = 0; i < 3; i++) {
                nodeData[i].x = nodeData[i].x0;
                nodeData[i].y = nodeData[i].y0;
            }

            var node = svg.selectAll('g.chordCir')
                .data(nodeData, function (d, i) {
                    return d.id || (d.id = ++i)
                })

            var nodeEnter = node.enter()
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + radius + ")")
                .attr("class", function (d) {
                    return d.depth == 1 ? "chordCir" : "chordCir chordDetail";
                })

            nodeEnter.append("circle")
                .attr("cx", function (d) {
                    return calc(source.x0, source.y0, source.depth)[0]
                })
                .attr("cy", function (d) {
                    return calc(source.x, source.y, source.depth)[1]
                })
                .attr("fill", function (d) {
                    if (d.depth >= 1) {
                        return color(d.ancestors().slice(-2, -1)[0].data.name);
                    }
                })
                .attr("r", 0)

            nodeEnter.merge(node)
                .transition()
                .duration(500)
                .selectAll('circle')
                .attr("cx", function (d) {
                    if (d.parent) {
                        return calc(d.x, d.y, d.depth)[0]
                    }
                })
                .attr("cy", function (d) {
                    if (d.parent) {
                        return calc(d.x, d.y, d.depth)[1]
                    }
                })
                .attr("r", function (d) {
                    if (d.parent) {
                        if (d.depth == 1) {
                            return 50
                        } else if (d.depth == 2) {
                            return 15
                        } else {
                            return 7
                        }
                    }
                })
                .attr("fill", function (d) {
                    if (d.depth >= 1) {
                        // console.log(d.ancestors().slice(-2, -1)[0].data.name);
                        return color(d.ancestors().slice(-2, -1)[0].data.name);
                    }
                })

            node.exit()
                .transition()
                .duration(500)
                .remove()
                .selectAll('circle')
                .attr("r", 0)
                .attr("cx", function (d) {
                    if (d.parent) {
                        return calc(source.x, source.y, source.depth)[0]
                    }
                })
                .attr("cy", function (d) {
                    if (d.parent) {
                        return calc(source.x, source.y, source.depth)[1]
                    }
                })

            var path = svg.selectAll('path.chordLinks').data(linkData, function (d) {
                return d.target.id
            })

            var pathEnter = path
                .enter()
                .insert("path", "g")
                .attr("class", "chordLinks")
                .attr("transform", "translate(" + width / 2 + "," + radius + ")")
                .attr("d", function (d) {
                    if (d.source.parent) {
                        return "M" + calc(source.x0, source.y0, source.depth) +
                            "Q" + calc(source.x0, source.y0, source.depth) + "," + calc(source.x0, source.y0, source.depth)
                    }
                })

            pathEnter.merge(path)
                .transition()
                .duration(500)
                .attr("d", function (d) {
                    if (d.source.parent) {
                        return "M" + calc(d.source.x, d.source.y, d.source.depth) +
                            "Q" + calc(d.target.x, d.source.y, d.source.depth) + "," + calc(d.target.x, d.target.y, d.target.depth)
                    }
                })

            path.exit()
                .transition()
                .duration(500)
                .attr("d", function (d) {
                    if (d.source.parent) {
                        return "M" + calc(source.x, source.y, source.depth) +
                            "Q" + calc(source.x, source.y, source.depth) + "," + calc(source.x, source.y, source.depth)
                    }
                })
                .remove()

            nodeData.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }
    })
}

function calc(x, y, depth) {
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

