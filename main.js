// global variables
let jsonData = d3.json("celebrity_jets.json");
let inputDataset, column, color;
let stateData = {};
let userCO2 = 0;

// celebrity data for sacrifice calculator
const celebrityData = {
  "Taylor Swift": 1397,
  "Elon Musk": 7440,
  "Kim Kardashian": 4800
};

// sacrifice calculations (CO2 saved per year)
const sacrificeRates = {
  driving: 4.6,      // tons CO2 per year of driving
  vegan: 0.8,        // tons CO2 saved per year going vegan
  flying: 1.6,       // tons CO2 per round-trip flight, assume 1/year
  clothes: 0.33      // tons CO2 per year of fast fashion
};


Promise.all([jsonData, d3.json("states.json")])
  .then(([celebrity_jets, states]) => {

    inputDataset = Object.entries(celebrity_jets).map(([name, values]) => ({
      Name: name,
      ...values
    }));


    states.forEach(d => {
      stateData[d.state] = d.emissions;
    });


    d3.select("#state-select")
      .selectAll("option")
      .data(states)
      .enter()
      .append("option")
      .attr("value", d => d.state)
      .text(d => d.state);


    initializeQuiz();
    
  
    setupSacrificeCalculator();
  });

// Quiz
const quizSteps = [
  {
    id: "meat",
    type: "buttons",
    question: "How often do you eat red meat?",
    options: [
      { label: "Daily", value: 1.2 },
      { label: "Few times a week", value: 0.6 },
      { label: "Rarely/never", value: 0.15 }
    ]
  },
  {
    id: "transport",
    type: "buttons",
    question: "What is your main mode of transportation?",
    options: [
      { label: "Car (drive alone)", value: 5.5 },
      { label: "Carpool", value: 2.0 },
      { label: "Public Transport", value: 0.5 },
      { label: "Bike/Walk", value: 0.0 }
    ]
  },
  {
    id: "caffeine",
    type: "buttons",
    question: "How much caffeine do you drink?",
    options: [
      { label: "Daily Starbucks", value: 0.15 },
      { label: "Brew at home", value: 0.05 },
      { label: "Energy drinks", value: 0.12 },
      { label: "Don't drink caffeine", value: 0.0 }
    ]
  },
  {
    id: "travel",
    type: "buttons",
    question: "How often do you fly per year?",
    options: [
      { label: "0 flights", value: 0 },
      { label: "1-2 flights", value: 1.5 },
      { label: "3-5 flights", value: 4.0 },
      { label: "6+ flights", value: 8.0 }
    ]
  },
  {
    id: "streaming",
    type: "buttons",
    question: "How much do you stream content?",
    options: [
      { label: "Several hours daily", value: 0.2 },
      { label: "1-2 hours daily", value: 0.1 },
      { label: "A few times a week", value: 0.05 },
      { label: "Rarely", value: 0.01 }
    ]
  },
  {
    id: "shopping",
    type: "buttons",
    question: "How often do you buy new clothes/items?",
    options: [
      { label: "Weekly", value: 0.8 },
      { label: "Monthly", value: 0.4 },
      { label: "Few times a year", value: 0.15 },
      { label: "Rarely", value: 0.05 }
    ]
  },
  {
    id: "state",
    type: "state",
    question: "What state do you live in?"
  },
  {
    id: "results",
    type: "results",
    question: "Your results are in!"
  }
];

const quizState = {
  currentIndex: 0,
  answers: {}
};

const quizBox = document.getElementById("quiz-box");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizStateDiv = document.getElementById("quiz-state");
const quizNextBtn = document.getElementById("quiz-next-btn");
const quizResults = document.getElementById("quiz-results");
const stateSelect = document.getElementById("state-select");
const quizRestartBtn = document.getElementById("quiz-restart-btn");

function initializeQuiz() {
  renderQuizStep();
  
  quizNextBtn.addEventListener("click", handleNextClick);
  quizRestartBtn.addEventListener("click", restartQuiz);
}

function renderQuizStep() {
  const step = quizSteps[quizState.currentIndex];


  quizOptions.innerHTML = "";
  quizStateDiv.style.display = "none";
  quizResults.style.display = "none";
  quizRestartBtn.style.display = "none";
  quizNextBtn.style.display = "inline-block";
  

  quizNextBtn.classList.remove("ready");


  if (step.type !== "results") {
    quizQuestion.textContent = step.question;
  }


  if (step.type === "buttons") {
    step.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "btn1";
      btn.textContent = opt.label;
      btn.dataset.value = opt.value;


      if (quizState.answers[step.id] === opt.value) {
        btn.classList.add("selected");
        quizNextBtn.classList.add("ready");
      }

      btn.addEventListener("click", () => {
        quizState.answers[step.id] = opt.value;
        quizOptions.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
 
        quizNextBtn.classList.add("ready");
      });

      quizOptions.appendChild(btn);
    });
  }

  else if (step.type === "state") {
    quizStateDiv.style.display = "block";
    if (quizState.answers.state) {
      stateSelect.value = quizState.answers.state;
      quizNextBtn.classList.add("ready");
    }
    

    stateSelect.addEventListener("change", () => {
      quizNextBtn.classList.add("ready");
    });
  }

  else if (step.type === "results") {
    showResults();
  }
}

function handleNextClick() {
  const step = quizSteps[quizState.currentIndex];


  if (step.type === "buttons" && quizState.answers[step.id] == null) {
    alert("Please select an option before continuing.");
    return;
  }


  if (step.type === "state") {
    if (!stateSelect.value) {
      alert("Please select your state before continuing.");
      return;
    }
    quizState.answers.state = stateSelect.value;
  }


  quizState.currentIndex++;
  

  if (quizState.currentIndex === quizSteps.length - 1) {
    renderQuizStep();
  } else {
    renderQuizStep();
  }
}

function showResults() {
  quizQuestion.textContent = "Your results are in!";

  const meat = Number(quizState.answers.meat || 0);
  const transport = Number(quizState.answers.transport || 0);
  const caffeine = Number(quizState.answers.caffeine || 0);
  const travel = Number(quizState.answers.travel || 0);
  const streaming = Number(quizState.answers.streaming || 0);
  const shopping = Number(quizState.answers.shopping || 0);

  const userState = quizState.answers.state;
  const stateEmission = stateData[userState] || 0;

  const total = meat + transport + caffeine + travel + streaming + shopping;
  userCO2 = total;


  quizState.answers.total = total;
  quizState.answers.stateEmission = stateEmission;

  quizNextBtn.style.display = "none";
  quizResults.style.display = "block";
  quizResults.innerHTML = `
    <div style="margin-bottom: 20px;">
      <strong>Your Personal Emissions:</strong><br>
      ${total.toFixed(2)} metric tons CO₂ per year
    </div>
    <div style="font-size: 1rem; color: #666;">
      Click below to see how you compare!
    </div>
  `;


  const compareBtn = document.createElement("button");
  compareBtn.className = "btn1";
  compareBtn.id = "compare-btn";
  compareBtn.textContent = "See Comparison";
  compareBtn.style.display = "inline-block";
  compareBtn.style.marginTop = "20px";
  compareBtn.style.background = "var(--accent-2)";
  compareBtn.style.color = "white";
  compareBtn.style.fontSize = "1.2rem";
  compareBtn.style.padding = "15px 40px";
  
  compareBtn.onclick = () => {
    showComparison();
  };
  

  quizResults.appendChild(compareBtn);
  

  quizRestartBtn.style.display = "inline-block";
  quizRestartBtn.textContent = "Restart Quiz";
}

function showComparison() {

  document.getElementById("context-panel").style.display = "flex";
  

  document.getElementById("context-panel").scrollIntoView({ behavior: "smooth" });
  

  setTimeout(() => {
    document.getElementById("celebrity-chart-panel").style.display = "flex";
    

    drawCelebrityChart();
  }, 500);
  
  setTimeout(() => {
    document.getElementById("swift-panel").style.display = "flex";
  }, 1500);
  
  setTimeout(() => {
    document.getElementById("sacrifice-panel").style.display = "flex";
  }, 2000);
}

function restartQuiz() {
  quizState.currentIndex = 0;
  quizState.answers = {};
  userCO2 = 0;

  quizResults.style.display = "none";
  quizRestartBtn.style.display = "none";
  quizOptions.innerHTML = "";
  quizStateDiv.style.display = "none";
  

  const compareBtn = document.getElementById("compare-btn");
  if (compareBtn) {
    compareBtn.remove();
  }


  document.getElementById("context-panel").style.display = "none";
  document.getElementById("celebrity-chart-panel").style.display = "none";
  document.getElementById("swift-panel").style.display = "none";
  document.getElementById("sacrifice-panel").style.display = "none";
  
  renderQuizStep();
  

  document.getElementById("quiz-panel").scrollIntoView({ behavior: "smooth" });
}


function drawCelebrityChart() {

  const chartData = [...inputDataset];
  chartData.push({
    Name: "YOU",
    "Total CO2 Pollution (metric tons)": userCO2
  });


  chartData.sort((b, a) => b["Total CO2 Pollution (metric tons)"] - a["Total CO2 Pollution (metric tons)"]);


  d3.select("#chart").selectAll("*").remove();

  
  const width = Math.min(1400, window.innerWidth - 40);
  const height = 700;
  const margin = { left: 150, right: 40, top: 80, bottom: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


  const xScale = d3.scaleLinear()
    .domain([0, d3.max(chartData, d => d["Total CO2 Pollution (metric tons)"])])
    .range([0, chartWidth])
    .nice();

  const yScale = d3.scaleBand()
    .domain(chartData.map(d => d.Name))
    .range([0, chartHeight])
    .padding(0.2);


  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip1")
    .style("visibility", "hidden");


  const userBar = chartData.find(d => d.Name === "YOU");
  const celebrityData = chartData.filter(d => d.Name !== "YOU");
  

  if (userBar) {
    g.append("rect")
      .datum(userBar)
      .attr("y", yScale(userBar.Name))
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("fill", "#0f7cff")
      .style("cursor", "pointer")
      .attr("width", 0)
      .transition()
      .duration(1000)
      .attr("width", xScale(userBar["Total CO2 Pollution (metric tons)"]))
      .on("end", function() {
        setTimeout(() => drawCelebrityBars(), 500);
      });
    

    g.append("text")
      .attr("y", yScale(userBar.Name) + yScale.bandwidth() / 2)
      .attr("x", xScale(userBar["Total CO2 Pollution (metric tons)"]) + 10)
      .attr("dy", "0.35em")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#0f7cff")
      .attr("opacity", 0)
      .text(`${userCO2.toFixed(1)} tons`)
      .transition()
      .delay(800)
      .duration(500)
      .attr("opacity", 1);
  }


  function drawCelebrityBars() {
    g.selectAll(".celebrity-bar")
      .data(celebrityData)
      .enter()
      .append("rect")
      .attr("class", "celebrity-bar")
      .attr("y", d => yScale(d.Name))
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("fill", "#ff3b30")
      .style("cursor", "pointer")
      .on("mouseover", function(e, d) {
        d3.select(this).attr("opacity", 0.7);
        let tooltipContent = `<strong>${d.Name}</strong><br><strong>Total CO₂:</strong> ${d["Total CO2 Pollution (metric tons)"]} metric tons`;
        
        if (d["Aircraft Model"]) {
          tooltipContent += `<br><strong>Aircraft:</strong> ${d["Aircraft Model"]}`;
        }
        
        tooltip.html(tooltipContent).style("visibility", "visible");
      })
      .on("mousemove", function(e) {
        tooltip.style("top", (e.pageY - 50) + "px")
          .style("left", (e.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
        tooltip.style("visibility", "hidden");
      })
      .attr("width", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr("width", d => xScale(d["Total CO2 Pollution (metric tons)"]));
  }


  g.append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-size", "12px")
    .style("font-weight", d => d === "YOU" ? "bold" : "normal")
    .style("fill", d => d === "YOU" ? "#0f7cff" : "#000");


  g.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("font-size", "11px");


  svg.append("text")
    .attr("x", margin.left + chartWidth / 2)
    .attr("y", height - 15)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Total CO₂ Emissions (metric tons)");


  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Your Emissions vs Celebrity Private Jet Emissions");
    

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 55)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#666")
    .text("(Your bar appears first in blue, then celebrity emissions reveal)");
}


function setupSacrificeCalculator() {
  const celebrityButtons = document.querySelectorAll(".celebrity-btn");
  const calculator = document.getElementById("sacrifice-calculator");
  
  celebrityButtons.forEach(btn => {
    btn.addEventListener("click", function() {

      celebrityButtons.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      

      calculator.style.display = "block";
      

      const celebrity = this.dataset.celebrity;
      const celebrityCO2 = celebrityData[celebrity];
      const gap = celebrityCO2 - userCO2;
      

      document.getElementById("selected-celebrity-name").textContent = celebrity;
      document.getElementById("emissions-gap").textContent = 
        `${celebrity}'s jet emissions: ${celebrityCO2} tons CO₂ | Your emissions: ${userCO2.toFixed(1)} tons | Gap: ${gap.toFixed(1)} tons`;
      
  
      resetSliders();


      setupSliders(gap);
    });
  });
}

function resetSliders() {
  document.getElementById("slider-driving").value = 0;
  document.getElementById("slider-vegan").value = 0;
  document.getElementById("slider-flying").value = 0;
  document.getElementById("slider-clothes").value = 0;
  updateSacrificeDisplay();
}

function setupSliders(targetGap) {
  const sliders = ["driving", "vegan", "flying", "clothes"];
  
  sliders.forEach(type => {
    const slider = document.getElementById(`slider-${type}`);
    slider.addEventListener("input", () => updateSacrificeDisplay(targetGap));
  });
}

function updateSacrificeDisplay(targetGap = 0) {

  const drivingYears = parseInt(document.getElementById("slider-driving").value);
  const veganYears = parseInt(document.getElementById("slider-vegan").value);
  const flyingYears = parseInt(document.getElementById("slider-flying").value);
  const clothesYears = parseInt(document.getElementById("slider-clothes").value);
  
  const drivingCO2 = drivingYears * sacrificeRates.driving;
  const veganCO2 = veganYears * sacrificeRates.vegan;
  const flyingCO2 = flyingYears * sacrificeRates.flying;
  const clothesCO2 = clothesYears * sacrificeRates.clothes;
  
  const totalSaved = drivingCO2 + veganCO2 + flyingCO2 + clothesCO2;
  const remaining = Math.max(0, targetGap - totalSaved);
  

  document.getElementById("value-driving").textContent = `${drivingYears} years`;
  document.getElementById("co2-driving").textContent = `${drivingCO2.toFixed(1)} tons CO₂`;
  
  document.getElementById("value-vegan").textContent = `${veganYears} years`;
  document.getElementById("co2-vegan").textContent = `${veganCO2.toFixed(1)} tons CO₂`;
  
  document.getElementById("value-flying").textContent = `${flyingYears} years`;
  document.getElementById("co2-flying").textContent = `${flyingCO2.toFixed(1)} tons CO₂`;
  
  document.getElementById("value-clothes").textContent = `${clothesYears} years`;
  document.getElementById("co2-clothes").textContent = `${clothesCO2.toFixed(1)} tons CO₂`;
  
  document.getElementById("total-saved").textContent = totalSaved.toFixed(1);
  document.getElementById("remaining-gap").textContent = remaining.toFixed(1);
  

  const gapMessage = document.getElementById("gap-message");
  if (remaining === 0) {
    gapMessage.innerHTML = `<span style="color: #4caf50; font-weight: bold;">🎉 You've matched their emissions!</span>`;
  } else {
    gapMessage.innerHTML = `You need to save <span id="remaining-gap">${remaining.toFixed(1)}</span> more tons`;
  }
}


window.addEventListener('resize', () => {
  if (document.getElementById("celebrity-chart-panel").style.display !== "none") {
    drawCelebrityChart();
  }
});
