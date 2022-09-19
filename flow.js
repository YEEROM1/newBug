var psvg;
var describe = document.querySelector('.describe')

function lines(Pdata, index) {
    var Ddata = Pdata.steps;
    var width = document.querySelector('.process').offsetWidth * 7 / 8,
        height = document.querySelector('.process').offsetHeight - 50;
    var margin = width / 7;
    var svg = d3.select(".process")
        .append("svg")
        .attr("class", "psvg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin + ",0)")

    var arc1 = d3.arc()
        .innerRadius(height / 8)
        .outerRadius(height / 8)
        .startAngle(0)
        .endAngle(Math.PI);

    var arc2 = d3.arc()
        .innerRadius(height / 8)
        .outerRadius(height / 8)
        .startAngle(Math.PI)
        .endAngle(Math.PI * 2);

    svg.append("path")
        .attr("class", "scircle")
        .attr("d", arc1())
        .attr("transform", "translate(" + (width - margin) + "," + height / 8 * 3 + ")")
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 1)

    svg.append("path")
        .attr("class", "scircle")
        .attr("d", arc2())
        .attr("transform", "translate(" + (margin) + "," + height / 8 * 5 + ")")
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 1)

    for (var k = 0; k < Ddata.length; k++) {
        //画第k条线
        var data = Ddata[k];
        //因为第二条是从右到左，所以画第二条时翻转一下数组
        if (k % 2) {
            data.steps.reverse();
        }
        //返回坐标数据，是一个json数组
        var tdata = d3.range(data.steps.length).map(function (i) {
            return { x: data.steps[i], y: 0 };
        })

        //设置横坐标的起始位置，第一条更靠近左边，所以起始位置更小
        var start;
        if (k == 0) {
            start = margin - height / 8;
        } else {
            start = margin;
        }

        //初始化一个range数组以及每段的长度，用于画下面的离散比例尺
        var range = [start],
            bandwidth = (width - margin * 2) / (data.steps.length - 1);

        //因为第一条的长度更长，同时要保证末尾和第二条对齐，因此第一条每段宽度需要重新计算
        if (k == 0) {
            let temp = bandwidth;
            bandwidth = (height / 8 + temp * (data.steps.length - 1)) / (data.steps.length - 1);
        } else if (k == 2) {
            //第三条比较短，也需重新设置每段宽度
            bandwidth = (width - margin * 2) / 10
        }

        for (var i = 1; i < data.steps.length; i++) {
            range.push(start + i * bandwidth);
        }

        //设置x比例尺
        var x = d3.scaleOrdinal()
            .range(range)
            .domain(data.steps);

        var line = d3.line()
            .x(function (d) {
                // 根据比例尺计算x
                return x(d.x);
            })
            .y(height / (Ddata.length + 1) * (k + 1));

        //给svg绑定数据，svg中用到的d就是绑定的数据
        var tsvg = svg.append("g")
            .data([tdata])

        //添加文字
        tsvg.append("g")
            .attr("transform", "translate(" + start + "," + 0 + ")")
            .selectAll(".step")
            // 这里是给上面append的g绑定数据
            .data(tdata)
            .enter()
            .append("text")
            .attr("class", function (d) {
                return like(d.x, data.main) ? "step main" : "step"
            })
            .text(function (d) {
                return d.x
            })
            //设置动画开始前文字位置
            .attr("x", function (d, i) {
                //这里虽然没用到d，但必须把d传进来，不然i也没法用
                if (this.className.baseVal == 'step') {
                    //末尾的16和18是对应class字体的大小，加10是因为前面的line的return也加了10(因为我这显示会遮挡部分)
                    return i * bandwidth - this.innerHTML.length * 16 / 2
                } else {
                    return i * bandwidth - this.innerHTML.length * 18 / 2
                }
            })
            .attr("y", function (d) {
                if (this.className.baseVal == 'step') {
                    return height / (Ddata.length + 1) * (k + 1) + 32
                } else {
                    return height / (Ddata.length + 1) * (k + 1) + 46
                }
            })
            .attr("opacity", 0)
            .transition()
            .duration(500)
            //设置动画结束时文字位置，与上同理
            .attr("x", function (d, i) {
                if (this.className.baseVal == 'step') {
                    return i * bandwidth - this.innerHTML.length * 16 / 2
                } else {
                    return i * bandwidth - this.innerHTML.length * 18 / 2
                }
            })
            .attr("y", function (d) {
                if (this.className.baseVal == 'step') {
                    return height / (Ddata.length + 1) * (k + 1) + 24
                } else {
                    return height / (Ddata.length + 1) * (k + 1) + 34
                }
            })
            .attr("opacity", 1)

        //添加横线
        tsvg.append("path")
            .attr("class", "line")
            .attr("d", line)
            .attr("opacity", 0)
            .transition()
            .duration(300)
            .attr("opacity", 1)

        //添加小刻度
        tsvg.selectAll(".mark")
            .data(tdata)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return like(d.x, data.main) ? "longM" : "shortM"
            })
            .attr("d", function (d) {
                return "M" + (x(d.x)) + "," + (height / (Ddata.length + 1) * (k + 1)) + "L" + (x(d.x)) + "," + (height / (Ddata.length + 1) * (k + 1));
            })
            .transition()
            .duration(500)
            .attr("d", function (d) {
                if (like(d.x, data.otext.tips.step)) {
                    return "M" + (x(d.x)) + "," + (height / (Ddata.length + 1) * (k + 1) + 10) + "L" + (x(d.x)) + "," + (height / (Ddata.length + 1) * (k + 1) - 30);
                } else if (like(d.x, data.main)) {
                    return "M" + (x(d.x)) + "," + (height / (Ddata.length + 1) * (k + 1) - 20) + "L" + (x(d.x)) + "," + (height / (Ddata.length + 1) * (k + 1) + 20);
                } else {
                    return "M" + (x(d.x)) + "," + (height / (Ddata.length + 1) * (k + 1) - 10) + "L" + (x(d.x)) + "," + (height / (Ddata.length + 1) * (k + 1) + 10);
                }
            })

        //添加圆
        tsvg.selectAll(".dot")
            .data(tdata)
            .enter()
            .append("circle")
            .attr("class", function (d) {
                var temp = like(d.x, data.main) ? "dot main" : "dot";
                if (like(d.x, Pdata.click.node)) {
                    temp += " " + "active"
                }
                return temp
            })
            //添加圆心坐标
            .attr("cx", line.x())
            .attr("cy", line.y())
            .attr("opacity", 0)
            .transition()
            .duration(700)
            .delay(300)
            .attr("opacity", 1)
            .attr("r", function (d) {
                return like(d.x, data.main) ? 12 : 7
            });

        tsvg.selectAll(".tips")
            .data(data.otext.tips.step)
            .enter()
            .append("circle")
            .attr("class", "dot tips")
            .attr("cx", function (d) {
                return x(d);
            })
            .attr("cy", height / (Ddata.length + 1) * (k + 1) - 30)
            .transition()
            .duration(700)
            .delay(300)
            .attr("r", 5)

        tsvg.selectAll(".tipstext")
            .data(data.otext.tips.step)
            .enter()
            .append("text")
            .attr("class", "step tipstext")
            .text(function (d, i) {
                return data.otext.tips.supply[i]
            })
            .attr("x", function (d) {
                return x(d) - this.innerHTML.length * 16 / 2
            })
            .attr("y", height / (Ddata.length + 1) * (k + 1) - 52)
            .attr("opacity", 0)
            .transition()
            .duration(500)
            .attr("x", function (d) {
                return x(d) - this.innerHTML.length * 16 / 2
            })
            .attr("y", height / (Ddata.length + 1) * (k + 1) - 44)
            .attr("opacity", 1)

        if (data.otext.link[0].start) {
            var lprocess = data.otext.link[0]
            var lbandwidth = (x(lprocess.end) - x(lprocess.start)) / (lprocess.process.length + 1);
            var lrange = []
            for (let i = 0; i < lprocess.process.length; i++) {
                lrange.push(x(lprocess.start) + (i + 1) * lbandwidth)
            }

            var lx = d3.scaleOrdinal()
                .range(lrange)
                .domain(lprocess.process)
            
            tsvg.selectAll(".processtext")
                .data(lprocess.process)
                .enter()
                .append("text")
                .attr("class", "step processtext")
                .text(function (d) {
                    return d;
                })
                .attr("x", function (d) {
                    return lx(d) - this.innerHTML.length * 16 / 2
                })
                .attr("y", height / (Ddata.length + 1) * (k + 1) + 92)
                .attr("opacity", 0)
                .transition()
                .duration(500)
                .attr("x", function (d) {
                    return lx(d) - this.innerHTML.length * 16 / 2
                })
                .attr("y", height / (Ddata.length + 1) * (k + 1) + 84)
                .attr("opacity", 1)

            tsvg.selectAll(".links")
                .data([lprocess])
                .enter()
                .append("path")
                .attr("class", "line link")
                .attr("d", function (d) {
                    return "M" + (x(d.start) + (x(d.end) - x(d.start)) / 2) + "," + (height / (Ddata.length + 1) * (k + 1) + 60) + "L" + (x(d.start) + (x(d.end) - x(d.start)) / 2) + "," + (height / (Ddata.length + 1) * (k + 1) + 60)
                })
                .transition()
                .duration(500)
                .attr("d", function (d) {
                    return "M" + x(d.start) + "," + (height / (Ddata.length + 1) * (k + 1) + 60) + "L" + x(d.end) + "," + (height / (Ddata.length + 1) * (k + 1) + 60) + "M" + x(d.start) + "," + (height / (Ddata.length + 1) * (k + 1) + 60) + "L" + x(d.start) + "," + (height / (Ddata.length + 1) * (k + 1) + 60) + "," + "M" + x(d.end) + "," + (height / (Ddata.length + 1) * (k + 1) + 60) + "L" + x(d.end) + "," + (height / (Ddata.length + 1) * (k + 1) + 60)
                })
                .transition()
                .duration(500)
                .attr("d", function (d) {
                    return "M" + x(d.start) + "," + (height / (Ddata.length + 1) * (k + 1) + 60) + "L" + x(d.end) + "," + (height / (Ddata.length + 1) * (k + 1) + 60) + "M" + x(d.start) + "," + (height / (Ddata.length + 1) * (k + 1) + 60) + "L" + x(d.start) + "," + (height / (Ddata.length + 1) * (k + 1) + 40) + "," + "M" + x(d.end) + "," + (height / (Ddata.length + 1) * (k + 1) + 60) + "L" + x(d.end) + "," + (height / (Ddata.length + 1) * (k + 1) + 40)
                })

            tsvg.selectAll(".pcirle")
                .data(lprocess.process)
                .enter()
                .append("circle")
                // "dot process"
                .attr("class", function (d) {
                    var temp = "dot process";
                    if (like(d, Pdata.click.node)) {
                        temp += " " + "active"
                    }
                    return temp
                })
                .attr("cx", function (d) {
                    return lx(d)
                })
                .attr("cy", height / (Ddata.length + 1) * (k + 1) + 60)
                .transition()
                .duration(700)
                .delay(300)
                .attr("r", 7)
        }
    }
    var cactive = document.querySelectorAll('.active')
    cactive.forEach(function (item, index) {
        item.addEventListener('click', function () {
            cactive.forEach(function(item){
                item.classList.remove('selected')
            })
            describe.innerHTML = Pdata.click.describe[index];
            item.classList.add('selected')
            console.log(1);
        })
    })
}

function like(tar, arr) {
    var t = arr.some(function (item) {
        return item == tar;
    })
    return t;
}

var m = 0;
function render(index) {
    document.querySelector('.describe').innerHTML = "";
    d3.json('flow.json').then(d => {
        lines(d.class[index], index)
        if (!index) {
            psvg = document.getElementsByTagName('svg')
            var sort = document.querySelectorAll('.sort1')
            sort.forEach(function (item) {
                item.addEventListener('click', function () {
                    if (this.id != m) {
                        psvg[0].remove()
                        render(this.id);
                        m = this.id
                    }
                })
            })
        }
    })
}

//轴（轮播图）
var mSwiper = new Swiper('.swiper', {
    // initialSlide: 11,
    direction: "vertical",
    watchSlidesProgress: true,
    slidesPerView: 4,
    slideToClickedSlide: true,
    centeredSlides: true,
    loop: true,
    loopedSlides: 12,
    autoplay: false,
    loopAdditionalSlides: 3,
    effect: "coverflow",
    coverflowEffect: {
        rotate: -5,
        stretch: -20,
        depth: 200,
        modifier: 1,
        slideShadows: false
    },
    on: {
        slideChangeTransitionStart: function () {
            var svg = document.getElementsByTagName('svg');
            var sort = document.querySelector('.sort')
            if (sort) {
                sort.remove();
            }
            if (svg.length) {
                svg[0].remove();
            }
            document.querySelector('.describe').innerHTML = "";
        },
        slideChangeTransitionEnd: function () {
            var process = document.querySelector('.process')
            var div = '<div class="sort"><div class="sort1" id="0">原窖分层<br/>堆糟法</div><div class="sort1" id="1">跑窖分层<br/>蒸馏法</div><div class="sort1" id="2">老五甑</div></div>'
            if (this.realIndex > 0) {
                render(this.realIndex + 2)
            } else {
                process.insertAdjacentHTML("beforeend", div)
                render(this.realIndex)
            }
        }
    }
})

console.log(1);
var swiperA = new Swiper('.swiperA', {
    direction: "vertical",
    mousewheel: true,
    pagination: {
        el: '.swiper-pagination',
    }
})

document.write("<script src='chord.js'></script>")
