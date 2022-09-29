function drawzhiqu(Ddata) {
    var nodes = Ddata.steps
    // var edges = Ddata.edges
    var margin = 13
    
    var width = document.querySelector('#zhiqu_process').offsetWidth / 1.7,
        height = document.querySelector('#zhiqu_process').offsetHeight;
    var swidth = document.querySelector('#zhiqu_lprocess').offsetWidth,
        sheight = document.querySelector('#zhiqu_lprocess').offsetHeight;
    var svg_width = document.querySelector('#zhiqu_process').offsetWidth
    
    var svg = d3.select("#zhiqu_process")
        .append("svg")
        .attr("width", svg_width)
        .attr("height", height)
        .attr('class', 'zhiqu_svg')
    var len = Ddata.steps.length

    //返回坐标数据，是一个json数组
    var tdata = d3.range(len).map(function (i) {
        return {
            name: Ddata.steps[i].name,
            big: Ddata.steps[i].big,
            x1: 0, y1: (height - 2 * margin) / nodes.length * (i + 1),
            x2: 0, y2: 0,      //2为上一个节点的坐标
            steps: 0,
            describe: Ddata.steps[i].describe
        };
    })
    //子节点有steps的对象数组  
    var snodes = []
    // 改变Bnodes x坐标
    var Bi = [], k = 0     //k记录有steps的小节点的索引 方便点击时搜索 从1开始  但数据数组是从0开始 记得-1
    for (var i = 0, j = -1; i < nodes.length; i++) {
        if (nodes[i].big == 1) {
            j++
            if (j % 2 == 0) { //左侧大节点
                tdata[i].x1 = margin + 5

            } else {
                tdata[i].x1 = width - 2 * margin - 10
            }
            Bi.push(i)
        } else {
            if (nodes[i].hasOwnProperty("steps")) {    //判断对象自身有无steps属性 不是原链
                tdata[i].steps = ++k
                snodes.push(nodes[i])
            }
        }
    }

    ////Bi[0, 3, 7, 11, 14 ] 大节点下标 
    var br = 25, sr = 6 //大小圆半径
    //勾股定理算大节点间距
    var X12 = Math.sqrt((tdata[Bi[1]].x1 - tdata[Bi[0]].x1) * (tdata[Bi[1]].x1 - tdata[Bi[0]].x1) + (tdata[Bi[1]].y1 - tdata[Bi[0]].y1) * (tdata[Bi[1]].y1 - tdata[Bi[0]].y1))
    // console.log(X12);
    //求起始点x坐标，分左右
    var lx = (tdata[Bi[1]].x1 - tdata[Bi[0]].x1) / X12 * br + tdata[Bi[0]].x1
    var rx = (tdata[Bi[1]].x1 - tdata[Bi[0]].x1) / X12 * (X12 - br) + tdata[Bi[0]].x1

    // var ry = (tdata[Bi[1]].y1 - tdata[Bi[0]].y1) / X12 * (X12 - br) + tdata[Bi[0]].y1

    //改变小节点 xy坐标
    var flag = 0, j = 1, n = 1         //flag:Bi当前索引 j下一个索引 n两个大节点中有好多个小节点
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].big != 1) {
            if (i < Bi[j]) {
                //判断大节点在左侧还是右侧，左右小节点位置不一样
                if (flag % 2 == 0) {
                    // tdata[i].x1 = tdata[Bi[flag]].x1 + ((tdata[Bi[1]].x1 - tdata[Bi[0]].x1) / (Bi[j] - Bi[flag])) * n
                    tdata[i].x1 = lx + ((rx - lx) / (Bi[j] - Bi[flag])) * n
                    var ly = (tdata[Bi[j]].y1 - tdata[Bi[flag]].y1) / X12 * br + tdata[Bi[flag]].y1
                    var ry = (tdata[Bi[j]].y1 - tdata[Bi[flag]].y1) / X12 * (X12 - br) + tdata[Bi[flag]].y1
                    tdata[i].y1 = ly + (ry - ly) / (Bi[j] - Bi[flag]) * n
                } else {
                    // tdata[i].x1 = tdata[Bi[flag]].x1 - ((tdata[Bi[1]].x1 - tdata[Bi[0]].x1) / (Bi[j] - Bi[flag])) * n
                    tdata[i].x1 = rx - ((rx - lx) / (Bi[j] - Bi[flag])) * n
                    var ly = (tdata[Bi[j]].y1 - tdata[Bi[flag]].y1) / X12 * br + tdata[Bi[flag]].y1
                    var ry = (tdata[Bi[j]].y1 - tdata[Bi[flag]].y1) / X12 * (X12 - br) + tdata[Bi[flag]].y1
                    tdata[i].y1 = ly + (ry - ly) / (Bi[j] - Bi[flag]) * n
                }
                n++
            } else {    //遍历到了下一个大节点
                i-- //停留一下
                flag = j
                j++
                n = 1
            }
        }
        //顺便在这里存x2,还有y2
        if (i > 0) {
            tdata[i].x2 = tdata[i - 1].x1
            tdata[i].y2 = tdata[i - 1].y1
        }
    }

    var edges = tdata.slice(1)

    //开始画图
    var zhiqu_g = svg.append('g')
        .attr("transform", "translate(10,0)")

    //两条竖线
    svg.append('path')
        .attr('d', "M" + 0 + "," + 0 + "L" + 0 + "," + height)
        // .attr("class", "line")
        .attr("stroke", "rgb(165,193,167)")
        .attr('stroke-width', "20")

    svg.append('path')
        .attr('d', "M" + width + "," + 0 + "L" + width + "," + height)
        // .attr("class", "line")
        .attr("stroke", "rgb(165,193,167)")
        .attr('stroke-width', "10")
    //连接线  
    var zhiqu_link = zhiqu_g.selectAll(".zhiqu")
        .append('g')
        .data(edges)
        .enter()
        .append('path')
        .attr('d', function (d, i) {
            // console.log(i);
            return "M" + d.x2 + "," + d.y2 + "L" + d.x1 + "," + d.y1    //单看一条线段是从下往上画的
        })
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("class", "zhiqu_line")
        .attr("opacity", 1)

    var zhiqu_node = zhiqu_g.selectAll(".zhiqu_dot")
        .append('g')   //圆点分组
        .data(tdata)
        .enter()
        .append('circle')
        .attr("cx", d => d.x1)
        .attr("cy", d => d.y1)
        .attr("r", function (d) {
            return d.big == 1 ? br : sr
        })
        .attr('class', function (d) {
            return d.big == 1 ? 'zhiqu_dot big' : 'zhiqu_dot small'
        })
        .on('mouseover', mouseover)
        .on('mouseout',function (d,i){
            d3.select('.zhiqu_dot_line').remove();
            d3.select('.zhiqu_step' + i).attr("opacity", 0)
        })
        .on('click', function (d,i) {
            d3.select('.zhiqu_ssvg').remove();
            var ssvg = d3.select("#zhiqu_lprocess")
                .append("svg")
                .attr("width", swidth)
                .attr("height", sheight)
                .attr('class', 'zhiqu_ssvg')
            if (d.steps) {
                //存子节点有steps的坐标数据 
                var sdata = d3.range(snodes[d.steps - 1].steps.length).map(function (i) {
                    return {
                        name: snodes[d.steps - 1].steps[i].name,
                        x: swidth / 4, y: height / 8 * (i + 1)
                    };
                })
                // console.log(sdata);

                //画竖线
                ssvg.selectAll('.line')
                    .data(sdata)
                    .enter()
                    .append('path')
                    .attr('d', function (d) {
                        return "M" + swidth / 4 + "," + height / 8 + "L" + swidth / 4 + "," + height / 8 * (sdata.length)
                    })
                    // .attr("class", "line")
                    .attr("stroke", "rgb(226,217,204)")
                    .attr('stroke-width','2')
                    .attr("opacity", 1)

                //画圆点
                ssvg.selectAll('.zhiqu_sdot')           //不能不加all吗
                    .data(sdata)
                    .enter()
                    .append('circle')
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", 5)
                    .attr("opacity", 1)
                    .attr('fill','rgb(211,173,162)')
                    .on('mouseover',function (d){
                        
                    })
                //添加文字
                ssvg.selectAll('.zhiqu_text')
                    .data(sdata)
                    .enter()
                    .append("text")
                    .text(d => d.name)
                    .attr('x', d => d.x + 7)
                    .attr('y', d => d.y + 4)
                    .attr('font-size', 13)
            }
            if(d.big){

            }else{
                
            }
        })
        .attr("opacity", 0)
        .transition()
        .duration(500)
        .attr("opacity", 1);
    var str = []   //用这个来存放tspan的文字 没搞懂还
    var zhiqu_text = zhiqu_g.selectAll('.zhiqu_text')
        .data(tdata)
        .enter()
        .append("text")
        .text(function (d) {
            if (d.name.length > 2 && d.big) {
                //     str.push(d.name.substr(0, 2) + ',')
                //     str.push(d.name.substr(2, 2))
                return d.name
            } else {
                return d.name
            }

        })
        .attr('x', function (d) {
            if (d.big == 1) {
                return d.x1 - this.innerHTML.length * 16 / 2
            } else {
                return svg_width - 100
            }
        })
        .attr('y', function (d) {
            if (d.big == 1) {
                return d.y1 + 7
            } else {
                return d.y1 + 5
            }
        })
        .attr("class", function (d,i) {
            if(d.big){
                return "zhiqu_step main"
            }else {
                return "zhiqu_step" + i 
            }
            // return d.big == 1 ? "zhiqu_step main" : "zhiqu_step"
        })
        .attr('opacity', function (d) {
            if (d.big != 1) {
                return 0
            }
        })
    console.log(str);
    //    var change_str = str.split(",");
    //大节点四个字换行                         暂时放弃
    // zhiqu_text.selectAll("tspan")
    //     .data(str)
    //     .enter()
    //     .append("tspan")
    //     .attr("x", zhiqu_text.attr("x"))
    //     .attr("dy", "1em")
    //     .text(function (d) {
    //         // if(d.name.length > 2 && d.big){
    //         return d.name;
    //         // }
    //     });

    //圆点交互——点击
    var zhiqu_active = document.querySelectorAll('.zhiqu_dot.small')
    zhiqu_active.forEach(function (item, index) {
        item.addEventListener('click', function () {
            zhiqu_active.forEach(function (item) {
                item.classList.remove('selected')
            })
            // describe.innerHTML = Pdata.click.describe[index];
            item.classList.add('selected')
            console.log(1);
        })
    })

    //圆点交互——悬停
    function mouseover(d,i) {
        d3.select('.tooltip').remove();
        var tooltip = d3.select("#zhiqu_process")
            .append('div')
            .attr('class', 'tooltip');
        if (d.steps) {
            this.style.cursor = 'hand'
        }
        if (d.big) {

        } else {
            if (d.hasOwnProperty("describe")) {
                tooltip.style('opacity', 2);
                tooltip.html(d.describe);
            }
            //画线
            d3.select('.zhiqu_dot_line').remove();
            svg.append('path')
                .attr('d', 'M' + (d.x1 + sr * 2.8) + "," + d.y1 + 'L' + (svg_width - 90) + ',' + d.y1)
                .attr("stroke", "rgba(169,166,158,.4)")
                .attr('stroke-width', "2")
                .attr('class','zhiqu_dot_line')
                .attr("opacity", 0)
                .transition()
                .duration(500)
                .attr("opacity", 1)
                d3.select('.zhiqu_step' + i)
                .transition()
                .duration(500)
                .attr("opacity", 1)
        }
    }
}