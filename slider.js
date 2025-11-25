
const slider = document.getElementById("myRange");
var colorScale = d3.scaleLinear().domain([0,100]).range(["red","green"]);

var leftSide = d3.select("#left").append("svg").attr("width",100).attr("height",100);
var rightSide = d3.select("#right").append("svg").attr("width",100).attr("height",100);

leftSide.append("circle").attr("id","leftRect").attr("r",50/5).attr("cx",50).attr("cy",50);
rightSide.append("circle").attr("id","rightRect").attr("r",50/5).attr("cx",50).attr("cy",50);

slider.oninput = function() {
     d3.select("#leftRect").attr("r",this.value/5).attr("fill",colorScale(this.value));
     d3.select("#rightRect").attr("r",(100-this.value)/5).attr("fill",colorScale(100-this.value));
};


var total = 0;
var q1Value = 0;
var q2Value = 0;

d3.selectAll(".q1")
    .each(function(){
        d3.select(this).on("click", function(){
            q1Value = parseInt(d3.select(this).attr("value"));
            d3.selectAll(".q1").style("color", "black");
            d3.select(this).style("color", "red");
            console.log(q1Value, q2Value);
            total = q1Value + q2Value;
            d3.select("#answer").html(total);
        });
    });

d3.selectAll(".q2")
    .each(function(){
        d3.select(this).on("click", function(){
            q2Value = parseInt(d3.select(this).attr("value"));
            d3.selectAll(".q2").style("color", "black");
            d3.select(this).style("color", "red");
            console.log(q1Value, q2Value);
            total = q1Value + q2Value;
            d3.select("#answer").html(total);
        });
    });

// New functionality: Display total value on slider input
slider.oninput = function() {
     var sliderValue = this.value;
     d3.select("#sliderValue").html(sliderValue);
     d3.select("#leftRect").attr("r",sliderValue/5).attr("fill",colorScale(sliderValue));
     d3.select("#rightRect").attr("r",(100-sliderValue)/5).attr("fill",colorScale(100-sliderValue));
};