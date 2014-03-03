$(document).ready(function() {

  var UNDEFINEDCLR = '#000',
  ZEROCLR = '#F00',
  numFormat = d3.format(','),
  map = L.map('map',{inertia:false}).setView([40.737096, -73.964767], 13),
  flyoutTimer;


  var geoSearch = new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.Google()
  }).addTo(map);

  $('#addressSearch').keypress(function(e){
    geoSearch._onKeyUp(e);

  });

  L.tileLayer('http://{s}.tile.cloudmade.com/CFDDEF4CF0DE4C03830980EBAC21E316/48569/256/{z}/{x}/{y}.png', {
    maxZoom: 20,
    minZoom: 6,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
  }).addTo(map);
  map.on('dragend', function(e) {

    updatePolygons(false);
  });
  map.on('zoomend', function(e) {
    updatePolygons(true);
  });
  map.on('viewreset', function(e) {
   updatePolygons(true);
 })




  var colorLots = d3.scale.quantile();
  var colorDistricts = d3.scale.quantile();
  colorLots.domain([0, 1000000]).range(colorbrewer.Greens[9]);
  colorDistricts.domain([0, 100000000]).range(colorbrewer.Greens[9]);

  updatePolygons(false);

  //make the flyout follow the mouse
  $('#map').mousemove(function(e) {
    jQuery('#flyout').css({
      'left': e.pageX - 215,
      'top': e.pageY - jQuery(document).scrollTop() - 120
    });
  });


  function updatePolygons(isZoom) {
       
         var bboxString = map.getBounds().toBBoxString();
         var center = map.getCenter();
         var lat = center.lat;
         var lon = center.lng;
    


    if (map._zoom > 16) { //draw tax lots at zoom levels 17+.
      drawMap(bboxString, center, lat, lon, 'taxlots');
    } else if(map._zoom > 9) { //draw community districts at zoom levels 10 - 16.
      drawMap(bboxString, center, lat, lon, 'communityDistricts');
    } else { //anything more zoomed out draw nothing.
      $('svg').css('display', 'none');
    }
  
}

  function getColor(d, type) {
    var value;
    var colorFunction;

    switch (type) {
      case 'communityDistricts':
      if(d.properties && d.properties.taxTotal) {
        value = d.properties.taxTotal;
      }
      colorFunction = colorDistricts;
      break;
      case 'taxlots':
      if(d.properties && d.properties.years) {
        value = d.properties.years[0].annualTax;
      }
      colorFunction = colorLots;
      break;
      default :
      break;
    }

    if (value) {
      if (value === 0) {
        return ZEROCLR;
      }
      return colorFunction(value);
    }
    return UNDEFINEDCLR;
  }

  function drawMap(bboxString, center, lat, lon, type) {
    d3.json('http://localhost:3000/' + type + '?bbox=' + bboxString, function(data) {

      //d3.json('http://nyctaxmap.herokuapp.com/' + type + '?bbox=' + bboxString, function(data) {
        $('#spinner').fadeOut(100);
        map.setView([lat, lon]);
        map.viewreset;

        $('svg').remove();
        var svg = d3.select(map.getPanes().overlayPane)
        .append('svg')
        .attr('width', window.screen.width)
        .attr('height', window.screen.height);
        var g = svg.append('g').attr('class', 'leaflet-zoom-hide');
        var transform = d3.geo.transform({ point: projectPoint });
        path = d3.geo.path().projection(transform);
        bounds = path.bounds(data);
        var topLeft = bounds[0],
        bottomRight = bounds[1];

        svg.attr('width', bottomRight[0] - topLeft[0])
        .attr('height', bottomRight[1] - topLeft[1])
        .style('left', topLeft[0] + 'px')
        .style('top', topLeft[1] + 'px');

        g.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');

        var feature = g.selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('fill', function(d) {
          return getColor(d, type);
        })

        .attr('d', path);

        feature.on('mouseover', function(d) {
          updateFlyout(d.properties, type);
        });


        feature.on('click', function(d) {
          setPathOnclick(d.properties, type);
        });

        feature.on('mouseout', function(d) {
          flyoutTimer = setTimeout(function() {
            $('#flyout').fadeOut(50);
          }, 50);
        });

      });
}

  function setPathOnclick(properties, type) {
    switch (type) {
      case 'taxlots':
      addTab(properties);
      break;
      case 'communityDistricts':
      break;
      default:
      break;
    }

    return false;
  }

  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  // sidebar needs to have up to 3 tabs. When a property is clicked, it should put all the variables in a tab.
  // When the 2nd is clicked, it should put it in the tab below. 3rd is same. When the 4th is clicked, it should
  // remove the first tab and insert a new tab below. Tabs should have an exit circle to click and get out of the tab.
  // If tab 1 is exited, move tabs 2 and 3 up. If tab 2 is clicked, move tab 3 up...
  // first step - clone the taxTabTemplate when a property is clicked, and fill in the appropriate fields.
  function addTab(p) {
    var borough = String(p.billingbbl).charAt(0);
    var block = String(p.billingbbl).substring(1, 6);
    var lot = String(p.billingbbl).substring(6, 10);
    var tab = $('#taxTabTemplate').clone().slideDown(150);
    var $sideBar = $('#sidebar');
    tab.find('.borough.taxData').html(borough);
    tab.find('.block.taxData').html(block);
    tab.find('.lot.taxData').html(lot);
    tab.find('.address .taxData').html(p.propertyAddress);
    tab.find('.ownerName .taxData').html(p.ownerName);
    tab.find('.taxClass .taxData').html(p.taxClass);

    if(p.condoNumber === 0) {
      tab.find('.estimatedValue .taxData').html(toDollars(p.years[0].estimatedValue));
      tab.find('.assessedValue .taxData').html(toDollars(p.years[0].assessedValue));
      tab.find('.taxRate .taxData').html(p.years[0].taxRate);
      tab.find('.taxBefore .taxData').html(toDollars(p.years[0].taxBefore));
      tab.find('.exemptions .taxData').html(toDollars(p.years[0].taxBefore - p.years[0].annualTax));
      tab.find('.annualTax .taxData').html(toDollars(p.years[0].annualTax));
      tab.find('.unitsTotal .taxData').html(p.unitsTotal);
      tab.find('.taxPerUnit .taxData').html(toDollars(p.years[0].annualTax / p.unitsTotal));
      tab.find('.taxBillLink a').click(function(e) {
        e.preventDefault();
        var billUrl = 'http://nycprop.nyc.gov/nycproperty/StatementSearch?bbl=' + p.billingbbl + '&stmtDate=20131122&stmtType=SOA';
        window.open(billUrl);
      });


      $('#sidebar').stop().animate({
        scrollTop: $('#sidebar')[0].scrollHeight
      }, 800);
    }
    // sidebar needs to have up to 3 tabs. When a property is clicked, it should put all the variables in a tab. When the 2nd is clicked, it should put it in the tab below. 3rd is same. When the 4th is clicked, it should remove the first tab and insert a new tab below. Tabs should have an exit circle to click and get out of the tab. If tab 1 is exited, move tabs 2 and 3 up. If tab 2 is clicked, move tab 3 up...
    // first step - clone the taxTabTemplate when a property is clicked, and fill in the appropriate fields.

    function updateFlyout(d) {
      $('#flyoutAddress').html(d.propertyAddress);
      if (d.years[0].annualTax) {
        $('#flyoutTax').html(toDollars(d.years[0].annualTax));
      } else {
        $('#flyoutTax').html("n/a");
      }
      clearTimeout(flyoutTimer);
      $('#flyout').fadeIn(50);

    }

    //Don't add the property twice.
    var tabs = $sideBar.find('.tab');
    for (var i = 0, len = tabs.length; i < len; i++) {
      if($(tabs[i]).attr('id') === borough + block + lot) { return; }
    }

    $(tab[0]).removeAttr('id').addClass('active');
    $(tab[0]).attr('id', borough + block + lot);
    $sideBar.append(tab);
    tab.show();
    tab.click(function(e) {
      tab.slideUp(500, function () {
        tab.remove();
      });
    });
  }

  function updateFlyout(d, type) {
    switch(type) {
      case 'taxlots':
      taxLotFlyOut(d);
      break;
      case 'communityDistricts':
      districtFlyOut(d);
      break;
      default:
      break;
    }
    if(flyoutTimer) { clearTimeout(flyoutTimer); }
    $('#flyout').fadeIn(50);
  }

  function taxLotFlyOut(d) {
    $('#flyoutAddress').html(d.propertyAddress);
    if (d.years && d.years[0].annualTax) {
      $('#flyoutTax').html(toDollars(d.years[0].annualTax));
    } else {
      $('#flyoutTax').html('n/a');
    }
    $('.flyoutClick').css('display','block');
  }

  function districtFlyOut(d) {
    $('#flyoutAddress').html('Community District: ' + d.communityDistrict);
    $('#flyoutTax').html('$' + numFormat(d.taxTotal));
    $('.flyoutClick').css('display','none');
  }

  function clearSidebar() {
    $('.taxData').html('');
  }

  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  function toDollars(n) {
    if (!n) { return '' };
    if (typeof n === 'String') { n = parseInt(n) };
    var dollars = n.toFixed(0).toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1,').split('').reverse().join('').replace(/^[\,]/, '');
    return '$' + dollars;
  }


});
