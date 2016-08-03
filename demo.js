
$(function(){

  var layoutPadding = 100;
  var layoutDuration = 700;
  var inCompFocusView = false;

  // get exported json from cytoscape desktop via ajax
  var graphP = $.ajax({
    //url: './data/dataCalcsPolCoordRESULT.json', 
    url: './data/pyFormatedData.json', 
    type: 'GET',
    dataType: 'json'
  });

  // also get style via ajax
  var styleP = $.ajax({
    url: './data/style.cycss', 
    type: 'GET',
    dataType: 'text'
  });
  
  var infoTemplate = Handlebars.compile([
    '<p class="ac-name">{{id}}</p>',
    '{{#if NodeType}}<p class="ac-node-type"><i class="fa fa-info-circle"></i> {{NodeType}}</p>{{/if}}',
    '{{#if Country}}<p class="ac-country"><i class="fa fa-map-marker"></i> {{Country}}</p>{{/if}}',
    '{{#if WebsiteURL}}<p class="ac-more"><i class="fa fa-external-link"></i><a target="_blank" href="http://www.{{WebsiteURL}}">{{id}}</a></p>{{/if}}',
    '{{#if AnnRevenue}}<p class="ac-more"><i class="fa fa-usd"></i> {{AnnRevenue}}</p>{{/if}}',
    '{{#if CompanyType}}<p class="ac-more"><i class="fa fa-usd"></i> {{CompanyType}}</p>{{/if}}',    

  ].join(''));

  // when both graph export json and style loaded, init cy
  Promise.all([ graphP, styleP ]).then(initCy);

  function highlight( node ){
    inCompFocusView = true;
    
    //BUG: s is undefined. Fix by getting root of nhood
    //Get two levels of connected nodes
    var nhood = node.closedNeighborhood().closedNeighborhood(); 
    //Get the root of the neighborhood
    root = nhood.roots();
    //Update nhood with the roots closed neighbourhood
    nhood = root.closedNeighborhood().closedNeighborhood();

    cy.batch(function(){
      cy.elements().not( nhood ).removeClass('highlighted').addClass('faded');
      nhood.removeClass('faded').addClass('highlighted');
      
      
      cy.stop().animate({
        fit: {
          eles: cy.elements(),
          padding: layoutPadding
        }
      }, {
        duration: layoutDuration
      }).delay( layoutDuration, function(){
        nhood.layout({
          name: 'breadthfirst',
          directed: true,
          padding: layoutPadding,
          animate: true,
          animationDuration: layoutDuration,
          fit: true  
        });
      });   
    });
  }

  function clear(){
    inCompFocusView = false;
    cy.batch(function(){
      cy.$('.highlighted').forEach(function(n){
        n.animate({
          position: n.data('orgPos')
        });
      });
      
      cy.elements().removeClass('highlighted').removeClass('faded');
    });

    setTimeout(function(){ reset(); }, layoutDuration);
  }

  function focus( node ){

    var nhood = node.closedNeighborhood().closedNeighborhood(); //Get two levels of connected nodes

    cy.batch(function(){
      //cy.elements().not( nhood ).removeClass('highlighted').addClass('faded');
      nhood.removeClass('faded').addClass('highlighted');
      nhood.addClass('highlighted');
    });
  }

  function unfocus(){
    cy.batch(function(){
      cy.elements().removeClass('highlighted').removeClass('faded');
    });
  }

  function showNodeInfo( node ){
    $('#info').html( infoTemplate( node.data() ) ).show();
  }
  
  function hideNodeInfo(){
    $('#info').hide();
  }

  function addEdges(){
    var nodes = cy.elements('node');
    var intAt;
    var apTeAt;
    var thisId;

    //Loop through all the nodes
    for(var i=0; i<nodes.length; i++){
      intAt = nodes[i].data().CompanyRelationIntegratedAt;
      apTeAt = nodes[i].data().CompanyRelationAppTeamAt;
      RelTo = nodes[i].data().CompanyRelationRelatedTo;

      thisId = nodes[i].data().id;

      //If curr node has intAt connections, add them
      if(intAt){
        for(var j=0; j<intAt.length; j++){
          cy.add({
            group:"edges",
            data:{ source: thisId, target: intAt[j], interaction: "cr" }
          })
        }
      }
      //If curr node has apTeAt connections, add them
      if(apTeAt){
        for(var j=0; j<apTeAt.length; j++){
          cy.add({
            group:"edges",
            data:{ source: thisId, target: apTeAt[j], interaction: "cw" }
          })
        } //for j    
      }
      if(RelTo){
        for(var j=0; j<RelTo.length; j++){
          cy.add({
            group:"edges",
            data:{ source: thisId, target: RelTo[j], interaction: "cc" }
          })
        } //for j    
      }      
    } //for i
  }


  function initCy( then ){
    var loading = document.getElementById('loading');
    var expJson = then[0];
    var styleJson = then[1];
    var elements = expJson.elements;


    elements.nodes.forEach(function(n){
      var data = n.data;
              
      n.data.orgPos = {
        x: n.position.x,
        y: n.position.y
      };
    });

    loading.classList.add('loaded');

    var cy = window.cy = cytoscape({
      container: document.getElementById('cy'),
      layout: { 
        name: 'preset',
        boundingBox: {x1: 0, y1: 0, x2: 5000, y2: 3000},
        padding: layoutPadding,

      },
      // maxZoom: 15,
      // minZoom: 0.30,
       style: styleJson,
       elements: elements,
      // motionBlur: true,
      // selectionType: 'single',
      // boxSelectionEnabled: false,
      // autolock: true
    });
    
    cy.on('free', 'node', function( e ){
      // var n = e.cyTarget;
      // var p = n.position();
      
      // n.data('orgPos', {
      //   x: p.x,
      //   y: p.y
      // });

    });
    
    cy.on('tap', function(){
      $('#search').blur();
    });

    cy.on('select', 'node', function(e){
      var node = this;
      //if( node.data().NodeType =='Customer'){
        highlight( node );
        showNodeInfo( node );
      //}
    });

    cy.on('unselect', 'node', function(e){
      var node = this;

      clear();
      hideNodeInfo();
    });

    cy.on('mouseover', 'node', function(e){
      var node = this;

      if(!inCompFocusView){
        focus(node);
        showNodeInfo( node );
      }

    });

    cy.on('mouseout', 'node', function(e){
      var node = this;
      if(!inCompFocusView){
        unfocus();
        hideNodeInfo();
      }
    });

    //addEdges();
  }
  
  $('#search').typeahead({
    minLength: 1,
    highlight: true,
  },
  {
    name: 'search-dataset',
    source: function( query, cb ){
      function matches( str, q ){
        str = (str || '').toLowerCase();
        q = (q || '').toLowerCase();
        
        return str.match( q );
      }
      
      var fields = ['id', 'NodeType', 'Country', 'CompanyType', 'Milk'];
      
      function anyFieldMatches( n ){
        for( var i = 0; i < fields.length; i++ ){
          var f = fields[i];
          
          if( matches( n.data(f), query ) ){
            return true;
          }
        }
        
        return false;
      }
      
      function getData(n){
        var data = n.data();
        
        return data;
      }
      
      function sortByName(n1, n2){
        if( n1.data('id') < n2.data('id') ){
          return -1;
        } else if( n1.data('id') > n2.data('id') ){
          return 1;
        }
        
        return 0;
      }
      
      var res = cy.nodes().stdFilter( anyFieldMatches ).sort( sortByName ).map( getData );

      // cy.batch(function(){
      //   cy.elements().stdFilter( anyFieldMatches ).removeClass('filtered');
      //   cy.elements().not( cy.elements().stdFilter( anyFieldMatches ) ).addClass('filtered');
      // });
      

      cb( res );
    },
    templates: {
      suggestion: infoTemplate
    }
  }).on('typeahead:selected', function(e, entry, dataset){
    var n = cy.getElementById(entry.id);
    
    n.select();
    showNodeInfo( n );
  });

  function reset(){
    cy.animate({
      fit: {
        eles: cy.elements(),
        padding: layoutPadding
      },
      duration: layoutDuration
    });
  }

  function positionAlgorithm(){
    var custNodes = cy.elements('node[NodeType="Customer"]');
    var appNodes = cy.elements('node[NodeType="Application"]');


    var radius;
    var angle; 
    var closeDate;  
    
    //Position the customer and prospect custNodes  
    for(var ci =0; ci < custNodes.length; ci++){
      closeDate = new Date(custNodes[ci].data().closeDate);

      radius = 100+scaleDate(closeDate);

      if(custNodes[ci].data().CompanyType == "Clothing"){
        angle = 0*Math.PI/5 + Math.random()*Math.PI/5;
      }
      else if(custNodes[ci].data().CompanyType == "Cars"){
        angle = 2*Math.PI/5 + Math.random()*Math.PI/5;
      }
      else if(custNodes[ci].data().CompanyType == "Food"){
        angle = 4*Math.PI/5 + Math.random()*Math.PI/5;
      }
      else if(custNodes[ci].data().CompanyType == "Electronics"){
        angle = 6*Math.PI/5 + Math.random()*Math.PI/5;
      }
      else if(custNodes[ci].data().CompanyType == "Candy"){
        angle = 8*Math.PI/5 + Math.random()*Math.PI/5;
      }
      
      //Set customer position
      custNodes[ci].position().x = radius*Math.cos(angle);
      custNodes[ci].position().y = radius*Math.sin(angle);
      
      //Get prospect neighbours and place them near root customer 
      var neighbors = custNodes[ci].openNeighborhood('node[NodeType="Prospect"]');
      for(var j=0; j<neighbors.length; j++ ){
        neighbors[j].position().x = custNodes[ci].position().x + ( 200*Math.cos(angle+Math.random()*Math.PI/4 - Math.random()*Math.PI/4) );
        neighbors[j].position().y = custNodes[ci].position().y + ( 200*Math.sin(angle+Math.random()*Math.PI/4 - Math.random()*Math.PI/4) );
      }
    }


    for(var ai=0; ai<appNodes.length; ai++){
      appNodes[ai].position().x = 4000;
      appNodes[ai].position().y = -2500 + ( ai*5000/appNodes.length);
    }


    function scaleDate(_closeDate){
      var maxRad = 3000;
      var startDate = new Date(2013,1,1);
      var endDate   = new Date(2016,8,0);
      
      // Get time returns time (in ms) since jan 1, 1970
      // Map closeDate between startDate - endDate from value 0-1 and scale with maxRad 
      var result = (_closeDate.getTime()-startDate.getTime() ) / (endDate.getTime()-startDate.getTime())*maxRad;
      
      return result;
    }
  }



  
  $('#debug').on('click', function(){
    positionAlgorithm(); 
    alert("Position algorithm done, click save to export as json.");
  });

  $('#save').on('click', function(){
    //Open JSON file in new tab
    var data = JSON.stringify(cy.json(),null,2);
    var url = 'data:text/json;charset=utf8,' + encodeURIComponent(data);

    window.open(url, '_blank');
    window.focus();
  });

  $('#reset').on('click', function(){
    reset();
  });
  
  $('#filters').on('click', 'input', function(){
    
    var cust = $('#cust').is(':checked');
    var evan = $('#evan').is(':checked');
    var subs = $('#subs').is(':checked');
    var lead = $('#lead').is(':checked');
    var markQualLead = $('#markQualLead').is(':checked');
    var saleQualLead = $('#saleQualLead').is(':checked');
    var prosp = $('#prosp').is(':checked');

    var cloth = $('#cloth').is(':checked');
    var cars = $('#cars').is(':checked');
    var food = $('#food').is(':checked');
    var elect = $('#elect').is(':checked');
    var candy = $('#candy').is(':checked');




    cy.batch(function(){
      
      cy.nodes().forEach(function( n ){
        var type = n.data('NodeType');
        var CompanyType = n.data('CompanyType');

        n.removeClass('filtered');
        
        var filter = function(){
          n.addClass('filtered');
        };

        if( type === 'Customer' ){
          
          if( !cust ){ filter(); }
          
        } else if( type === 'Evangelist' ){
          
          if( !evan ){ filter(); }
          
        } else if( type === 'Subscriber' ){
          
          if( !subs ){ filter(); }
          
        } else if( type === 'Lead' ){
          
          if( !lead ){ filter(); }
          
        } else if( type === 'Marketing Qualified Lead' ){
          
          if( !markQualLead ){ filter(); }
          
        } else if( type === 'Sales Qualified Lead' ){
          
          if( !saleQualLead ){ filter(); }
          
        } else if( type === 'Prospect' ){
          
          if( !prosp ){ filter(); }
        }






        if( CompanyType === 'Clothing' ){
          
          if( !cloth ){ filter(); }
          
        } else if( CompanyType === 'Cars' ){
          
          if( !cars ){ filter(); }
          
        } else if( CompanyType === 'Food' ){
          
          if( !food ){ filter(); }
          
        } else if( CompanyType === 'Electronics' ){
          
          if( !elect ){ filter(); }
          
        } else if( CompanyType === 'Candy' ){
          
          if( !candy ){ filter(); }
          
        }   
      });
      
    }); 
    
  });

  $('#appFilter').on('click', 'input', function(){

    var app = $('#app').is(':checked');


    cy.batch(function(){
      
      cy.nodes().forEach(function( n ){
        var type = n.data('NodeType');
        
        n.removeClass('filtered');
        
        var filter = function(){
          n.addClass('filtered');
        };

        if( type === 'Application' ){
          
          if( !app ){ filter(); }
          
        } 
      });
    }); 
  });
  
  $('#filter').qtip({
    position: {
      my: 'top center',
      at: 'bottom center'
    },
    
    show: {
      event: 'click'
    },
    
    hide: {
      event: 'unfocus'
    },
    
    style: {
      classes: 'qtip-bootstrap',
      tip: {
        width: 16,
        height: 8
      }
    },

    content: $('#filters')
  });


});
