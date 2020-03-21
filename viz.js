document.addEventListener("DOMContentLoaded", function() {
  d3.json('https://api.rootnet.in/covid19-in/unofficial/covid19india.org').then(function (data) {

    var date = new Date(data.data.lastRefreshed).toLocaleDateString('en-US', { month: 'long', day: 'numeric', hour:'numeric', minutes: 'numeric' });
    document.getElementById('loading').innerHTML = 'Last updated on ' + date;

    var data = data.data.rawPatientData;

    // Clean up dates
    var dateFormatParser = d3.timeParse('%d/%m/%Y');
    data.forEach(d => {
      d.reportedOn = dateFormatParser(d.reportedOn);
    });

    // Capitalize gender
    data.forEach(function (d) {
      if (d.gender === 'male') d.gender = 'Male';
      if (d.gender === 'female') d.gender = 'Female';
    })

    console.log(data[9]);

    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    var dateDimension = ndx.dimension(d => d.reportedOn);
    var dateGroup = dateDimension.group();

    var ageDimension = ndx.dimension(function (d) {
      var a = d.ageEstimate;
      if (a === '') {
        return 'Unknown';
      } else if (a < 10 ) {
        return 'Below 10';
      } else if ( a < 20 ) {
        return 'Between 10 to 20';
      } else if ( a < 30 ) {
        return 'Between 20 to 30';
      } else if ( a < 40 ) {
        return 'Between 30 to 40';
      } else if ( a < 50 ) {
        return 'Between 40 to 50';
      } else if ( a < 60 ) {
        return 'Between 50 to 60';
      } else if ( a < 70 ) {
        return 'Between 60 to 70';
      } else if ( a < 80 ) {
        return 'Between 70 to 80';
      } else if ( a < 90 ) {
        return 'Between 80 to 90';
      } else if ( a < 100 ) {
        return 'Between 90 to 100';
      }
    });
    var ageGroup = ageDimension.group();

    var stateDimension = ndx.dimension(d => d.state);
    var stateGroup = stateDimension.group();

    var genderDimension = ndx.dimension(d => d.gender );
    var genderGroup = genderDimension.group();

    var statusDimension = ndx.dimension(d => d.status );
    var statusGroup = statusDimension.group();

    var genderPie = new dc.PieChart('#gender-pie');
    genderPie
      .width(200)
      .height(200)
      .radius(80)
      .dimension(genderDimension)
      .group(genderGroup);

    var statusPie = new dc.PieChart('#status-pie');
    statusPie
      .width(200)
      .height(200)
      .radius(80)
      .dimension(statusDimension)
      .group(statusGroup);

    var reportedBar = new dc.BarChart('#reported-bar')
    reportedBar
      .width(760)
      .height(200)
      .dimension(dateDimension)
      .group(dateGroup)
      .round(d3.timeDay.round)
      .x(d3.scaleTime()
        .domain([
          new Date("January 30, 2020"),
          new Date()
        ])
      )
      .y(d3.scaleLinear().domain([0,60]))
      .xUnits(function(){return dateGroup.all().length*2.2;});;

    var ageRow = new dc.RowChart('#age-row');
    ageRow
      .width(300)
      .height(300)
      .dimension(ageDimension)
      .group(ageGroup)
      .elasticX(true)
      .ordering(function(d) {
        return d.key;
        if( d.key === "Unknown") return 1;
        if( d.key === "Under 10") return 2;
        if( d.key === "Between 10 to 20") return 3;
        if( d.key === "Between 20 to 30") return 4;

      });

    var map = new dc.GeoChoroplethChart('#map');
    map
      .width(760)
      .height(700)
      .dimension(stateDimension)
      .group(stateGroup)
      .colors(d3.scaleQuantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
      .colorDomain([0, stateGroup.top(1)[0].value])
      .overlayGeoJson(statesData.features,"state",function (d) {
        return d.properties["NAME_1"];
      })
      .projection(d3.geoMercator()
        .scale(1000)
        .translate([-1100, 700])
      )
      .title( function (d) {
        return d.key + ": " + d.value;
      })
      .valueAccessor(function (d) {
        return d.value;
      });

    var count = new dc.DataCount('#count')
    count
      .dimension(ndx)
      .groupAll(ndx.groupAll());

    dc.renderAll();

    document.getElementById('reset').addEventListener('click',function () {
      dc.filterAll();
      dc.renderAll();
    })

  })
});
