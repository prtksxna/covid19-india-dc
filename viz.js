document.addEventListener("DOMContentLoaded", function() {
  d3.json('https://api.rootnet.in/covid19-in/unofficial/covid19india.org').then(function (data) {
    var data = data.data.rawPatientData;

    // Clean up dates
    var dateFormatParser = d3.timeParse('%d/%m/%Y');
    data.forEach(d => {
      d.reportedOn = dateFormatParser(d.reportedOn);
    });

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

    console.log(ageGroup.all());

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

    var genderPie = new dc.PieChart('#status-pie');
    genderPie
      .width(200)
      .height(200)
      .radius(80)
      .dimension(statusDimension)
      .group(statusGroup);

    var reportedBar = new dc.BarChart('#reported-bar')
    reportedBar
      .width(800)
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
      .xUnits(function(){return dateGroup.all().length*2;});;

    var ageRow = new dc.RowChart('#age-row');
    ageRow
      .width(300)
      .height(300)
      .dimension(ageDimension)
      .group(ageGroup)
      .elasticX(true)
      /*.y(d3.scaleOrdinal().domain[
        'Unknown',
        'Under 10'
      ])*/
      .ordering(function(d) {
        return d.key;
        if( d.key === "Unknown") return 1;
        if( d.key === "Under 10") return 2;
        if( d.key === "Between 10 to 20") return 3;
        if( d.key === "Between 20 to 30") return 4;

      });

    dc.renderAll();

  })
});
