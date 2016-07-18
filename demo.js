
$(function(){

  var layoutPadding = 100;
  var layoutDuration = 500;

  // get exported json from cytoscape desktop via ajax
  var graphP = $.ajax({
    url: './data/dataHubspot2.json', // wine-and-cheese.json
    type: 'GET',
    dataType: 'json'
  });

  // also get style via ajax
  var styleP = $.ajax({
    url: './data/styleTemp.cycss', // wine-and-cheese-style.cycss
    type: 'GET',
    dataType: 'text'
  });
  
  var infoTemplate = Handlebars.compile([
    '<p class="ac-name">{{id}}</p>',
    '<p class="ac-node-type"><i class="fa fa-info-circle"></i> {{NodeTypeFormatted}}</p>',
    '{{#if Country}}<p class="ac-country"><i class="fa fa-map-marker"></i> {{Country}}</p>{{/if}}',
    '{{#if WebsiteURL}}<p class="ac-more"><i class="fa fa-external-link"></i><a target="_blank" href="http://www.{{WebsiteURL}}">{{id}}</a></p>{{/if}}',
    '{{#if AnnRevenue}}<p class="ac-more"><i class="fa fa-usd"></i> {{AnnRevenue}}</p>{{/if}}',

  ].join(''));

  // when both graph export json and style loaded, init cy
  Promise.all([ graphP, styleP ]).then(initCy);

  function highlight( node ){
    var nhood = node.closedNeighborhood();

    cy.batch(function(){
      cy.elements().not( nhood ).removeClass('highlighted').addClass('faded');
      nhood.removeClass('faded').addClass('highlighted');
      
      var npos = node.position();
      var w = window.innerWidth;
      var h = window.innerHeight;
      
      cy.stop().animate({
        fit: {
          eles: cy.elements(),
          padding: layoutPadding
        }
      }, {
        duration: layoutDuration
      }).delay( layoutDuration, function(){
        nhood.layout({
          name: 'concentric',
          padding: layoutPadding,
          animate: true,
          animationDuration: layoutDuration,
          boundingBox: {
            x1: npos.x - w/2,
            x2: npos.x + w/2,
            y1: npos.y - w/2,
            y2: npos.y + w/2
          },
          fit: true,
          concentric: function( n ){
            if( node.id() === n.id() ){
              return 2;
            } else {
              return 1;
            }
          },
          levelWidth: function(){
            return 1;
          }
        });
      } );
      
    });
  }

  function clear(){
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

  function showNodeInfo( node ){
    $('#info').html( infoTemplate( node.data() ) ).show();
  }
  
  function hideNodeInfo(){
    $('#info').hide();
  }

  function addEdges(){

    //loop through all nodes
    for(var ind = 0; ind<cy.json().elements.nodes.length; ind++){
      var relTo = [cy.json().elements.nodes[ind].data.CompanyRelationRelatedTo];     //Store relations in arrays
      var intAt = [cy.json().elements.nodes[ind].data.CompanyRelationIntegratedAt];
      var apTeAt = [cy.json().elements.nodes[ind].data.CompanyRelationAppTeamAt];
      
      var thisId = cy.json().elements.nodes[ind].data.id; 

      //If there is any known connections, add an edge between nodes
      if(relTo[0]){
        for(var j = 0; j<relTo.length; j++){
          cy.add({
              group: "edges",
              data: { source: thisId, target: relTo[j], interaction: "cc" }
          });
        }
      }
      if(intAt[0]){
        for(var j = 0; j<relTo.length; j++){
          cy.add({
              group: "edges",
              data: { source: thisId, target: intAt[j], interaction: "cr" }
          });
        }
      }
      if(apTeAt[0]){
        for(var j = 0; j<apTeAt.length; j++){
          cy.add({
              group: "edges",
              data: { source: thisId, target: apTeAt[j], interaction: "cw" }
          });
        }
      }   
    }
  }


  function initCy( then ){
    var loading = document.getElementById('loading');
    var expJson = then[0];
    var styleJson = then[1];
    var elements = expJson.elements;

    elements.nodes.forEach(function(n){
      var data = n.data;
      
      data.NodeTypeFormatted = data.NodeType;
            
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
        boundingBox: {x1: 0, y1: 0, x2: 1000, y2: 1000},
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
      var n = e.cyTarget;
      var p = n.position();
      
      n.data('orgPos', {
        x: p.x,
        y: p.y
      });

    });
    
    cy.on('tap', function(){
      $('#search').blur();
    });

    cy.on('select', 'node', function(e){
      var node = this;

      highlight( node );
      showNodeInfo( node );
    });

    cy.on('unselect', 'node', function(e){
      var node = this;

      clear();
      hideNodeInfo();
    });

    addEdges();
  }
  
  $('#search').typeahead({
    minLength: 2,
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
      
      var fields = ['id', 'NodeType', 'Country', 'Type', 'Milk'];
      
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
  
  $('#reset').on('click', function(){
    console.log(graphP);
    reset();
  });
  
  $('#filters').on('click', 'input', function(){
    
    var customer = $('#cust').is(':checked');
    var prospect = $('#prosp').is(':checked');
    var cider = $('#cider').is(':checked');
    
    cy.batch(function(){
      
      cy.nodes().forEach(function( n ){
        var type = n.data('NodeType');
        
        n.removeClass('filtered');
        
        var filter = function(){
          n.addClass('filtered');
        };
        
        var cType = n.data('Type');

        if( type === 'Customer' ){
          
          if( !customer ){ filter(); }
          
        } else if( type === 'Prospect' ){
          
          if( !prospect ){ filter(); }
          
        } else if( type === 'Cider' ){
          
          if( !cider ){ filter(); }
          
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
