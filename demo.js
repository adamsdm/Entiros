
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
  
  function clear(){
    inCompFocusView = false;
    $('#lvl2Filter').hide();
    $('#lvl2').prop('checked', true);


    reset();
    setTimeout( function(){
      cy.batch( function(){
        cy.$('.highlighted').forEach(function(n){
          n.animate({
            position: n.data('orgPos')
          },{duration: layoutDuration});
        });
        
        cy.elements('.levelTwo').removeClass('filtered');
        cy.elements().removeClass('highlighted').removeClass('faded').removeClass('levelTwo');
      });
    }, layoutDuration);

    //setTimeout(function(){ reset(); }, layoutDuration);
  }


  function highlight( node ){
    inCompFocusView = true;
    $('#lvl2Filter').show();
    
    var intAtNodes = node.connectedEdges('edge[interaction="intAtEdge"]').connectedNodes("node[id!='"+node.id()+"']");
    var aTeAtNodes = node.connectedEdges('edge[interaction="apTeAtEdge"]').connectedNodes("node[id!='"+node.id()+"']");
    var relToNodes = node.connectedEdges('edge[interaction="RelToEdge"]').connectedNodes("node[id!='"+node.id()+"']");

    var posX;
    var posY;
    var levelHeight = 200;
    var lvl1width = 1200;
    var lvl2width = 600;
    var spacing;  


    /*******************/
    /*** First level ***/
    /*******************/

    //Integrated at nodes
    spacing = lvl1width/intAtNodes.length;  
    for(var i=0; i<intAtNodes.length; i++){
      posX = node.position().x +i*spacing-((intAtNodes.length-1)/2*spacing);
      posY = node.position().y - levelHeight;

      intAtNodes[i].animate({
          position: { x: posX, y: posY } 
        }, {
          duration: layoutDuration 
       });
    }

    //App team at nodes
    for(var i=0; i<aTeAtNodes.length; i++){
      posX = node.position().x + levelHeight - 100*i;
      posY = node.position().y + levelHeight;

      aTeAtNodes[i].animate({
          position: { x: posX, y: posY } 
        }, {
          duration: layoutDuration 
       });
    }

    //Related to nodes
    for(var i=0; i<relToNodes.length; i++){
      posX = node.position().x - levelHeight + 100*i;
      posY = node.position().y + levelHeight;

      relToNodes[i].animate({
          position: { x: posX, y: posY } 
        }, {
          duration: layoutDuration 
       });
    }

    /*******************/
    /*** Second level ***/
    /*******************/
    setTimeout( function(){

      //Int at nodes
      for(var i=0; i<intAtNodes.length; i++){
        var secondLvlNodes = intAtNodes[i].openNeighborhood("node[id!='"+node.id()+"']");
        for(var j=0; j<secondLvlNodes.length; j++){
          spacing = lvl2width/secondLvlNodes.length;
          secondLvlNodes[j].addClass('levelTwo');

          secondLvlNodes[j].animate({
            position: { 
              x: intAtNodes[i].position().x +j*spacing-((secondLvlNodes.length-1)/2*spacing),
              y: node.position().y-2*levelHeight
            } 
          }, {
            duration: layoutDuration 
         });
        }
      }

      // Ap te at nodes
      for(var i=0; i<aTeAtNodes.length; i++){
        var secondLvlNodes = aTeAtNodes[i].openNeighborhood("node[id!='"+node.id()+"']");
        for(var j=0; j<secondLvlNodes.length; j++){
          spacing = lvl2width/secondLvlNodes.length;          
          secondLvlNodes[j].addClass('levelTwo');

          secondLvlNodes[j].animate({
            position: { 
              x: aTeAtNodes[i].position().x + j*spacing,
              y: node.position().y+2*levelHeight
            } 
          }, {
            duration: layoutDuration 
         });
        }
      }

      // Related to nodes
      for(var i=0; i<relToNodes.length; i++){
        var secondLvlNodes = relToNodes[i].openNeighborhood("node[id!='"+node.id()+"']");
        for(var j=0; j<secondLvlNodes.length; j++){
          spacing = lvl2width/secondLvlNodes.length;          
          secondLvlNodes[j].addClass('levelTwo');

          secondLvlNodes[j].animate({
            position: { 
              x: relToNodes[i].position().x - j*spacing,
              y: node.position().y+2*levelHeight
            } 
          }, {
            duration: layoutDuration 
         });
        }
      }      


    }, layoutDuration );

    //Update viewport to fit elements
    setTimeout( function(){
      cy.animate({
        fit: {
          eles: node.closedNeighborhood().closedNeighborhood(),
          padding: 30
        }
      }, {
        duration: layoutDuration
      });
    }, 2*layoutDuration+100 );
       

    //highlight relevant nodes, and fade irrelevant nodes
    cy.batch(function(){ 
        cy.elements().removeClass('highlighted').removeClass('focused').addClass('faded');
        node.closedNeighborhood().closedNeighborhood().removeClass('faded').addClass('highlighted');
    });


    // var conNodes = node.connectedEdges().connectedNodes("node[id!='"+node.id()+"']");
    // var posX;
    // var posY;
    // var lvl1width = 1200;
    // var lvl2width = 200;
    // var spacing = lvl1width/conNodes.length;


    // //First level
    // for(var i=0; i<conNodes.length; i++){ 
    //   posX = node.position().x +i*spacing-((conNodes.length-1)/2*spacing);        
    //   posY = node.position().y+200;

    //    conNodes[i].animate({
    //       position: { x: posX, y: posY } 
    //     }, {
    //       duration: layoutDuration 
    //    });

    // }



    // //Second level
    // setTimeout( function(){
    //   for(var i=0; i<conNodes.length; i++){ 
    //     var secondLvlNodes = conNodes[i].openNeighborhood("node[id!='"+node.id()+"']");

    //     for(var j=0; j<secondLvlNodes.length; j++){
    //       spacing = lvl2width/secondLvlNodes.length;
    //       secondLvlNodes[j].addClass('levelTwo');

    //       secondLvlNodes[j].animate({
    //         position: { 
    //           x: conNodes[i].position().x +j*spacing-((secondLvlNodes.length-1)/2*spacing),
    //           y: node.position().y+400 
    //         } 
    //       }, {
    //         duration: layoutDuration 
    //      });
    //     }
    //    }
    //   }, layoutDuration );


    // //Update viewport to fit elements
    // setTimeout( function(){
    //   cy.animate({
    //     fit: {
    //       eles: node.closedNeighborhood().closedNeighborhood(),
    //       padding: 20
    //     }
    //   }, {
    //     duration: layoutDuration
    //   });
    // }, 2*layoutDuration+100 );
       

    // //highlight relevant nodes, and fade irrelevant nodes
    // cy.batch(function(){ 
    //     cy.elements().removeClass('highlighted').addClass('faded');
    //     node.closedNeighborhood().closedNeighborhood().removeClass('faded').addClass('highlighted');
    // });

  }


  function focus( node ){

    //var nhood = node.closedNeighborhood().closedNeighborhood(); //Get two levels of connected nodes
    var nhood = node.closedNeighborhood().closedNeighborhood();

    cy.batch(function(){
      nhood.removeClass('faded').addClass('focused');
      nhood.addClass('focused');
    });
  }

  function unfocus(){
    cy.batch(function(){
      cy.elements().removeClass('focused').removeClass('faded');
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
            data:{ source: thisId, target: intAt[j], interaction: "intAtEdge" }
          })
        }
      }
      //If curr node has apTeAt connections, add them
      if(apTeAt){
        for(var j=0; j<apTeAt.length; j++){
          cy.add({
            group:"edges",
            data:{ source: thisId, target: apTeAt[j], interaction: "apTeAtEdge" }
          })
        } //for j    
      }
      if(RelTo){
        for(var j=0; j<RelTo.length; j++){
          cy.add({
            group:"edges",
            data:{ source: thisId, target: RelTo[j], interaction: "RelToEdge" }
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

      cy.nodes().removeClass('hidden');
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

    // cy.remove('edge');
    // addEdges();
  }
  
  $('#search').typeahead({
    minLength: 0,
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

      cy.batch(function(){
        cy.nodes().stdFilter( anyFieldMatches ).removeClass('hidden');
        cy.nodes().not( cy.elements().stdFilter( anyFieldMatches ) ).addClass('hidden');
      });
      
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
    var typeArray = [];  
    var typeInd;

    //Get unique company types and store them in typeArray
    for(var i=0; i<custNodes.length; i++){
        typeArray.push(custNodes[i].data().CompanyType);
    }
    typeArray = typeArray.filter( onlyUnique );

    //For each customer
    for(var i=0; i<custNodes.length; i++){
      typeInd = getTypeIndex(custNodes[i].data().CompanyType);  //Get current customer type index from typeArray
      closeDate = new Date(custNodes[i].data().closeDate);      //Get the close date 
      radius = 100+scaleDate(closeDate);                        
      angle = 2*typeInd*Math.PI/typeArray.length + Math.random()*Math.PI/typeArray.length;   //Set circle disk angle 

      //Set customer node position
      custNodes[i].position().x = radius*Math.cos(angle);
      custNodes[i].position().y = radius*Math.sin(angle); 


      var neighbors = custNodes[i].openNeighborhood('node[NodeType="Prospect"]');      
      for(var j=0; j<neighbors.length; j++ ){
        neighbors[j].position().x = custNodes[i].position().x + ( 200*Math.cos(angle+Math.random()*Math.PI/4 - Math.random()*Math.PI/4) );
        neighbors[j].position().y = custNodes[i].position().y + ( 200*Math.sin(angle+Math.random()*Math.PI/4 - Math.random()*Math.PI/4) );
      }            
    }

    // Place applikation nodes in list to the right
    for(var ai=0; ai<appNodes.length; ai++){
      appNodes[ai].position().x = 4000;
      appNodes[ai].position().y = -2500 + ( ai*5000/appNodes.length);
    }

    cy.style().update();


    function scaleDate(_closeDate){
      var maxRad = 3000;
      var startDate = new Date(2013,1,1);
      var endDate   = new Date(2016,8,0);
      
      // Get time returns time (in ms) since jan 1, 1970
      // Map closeDate between startDate - endDate from value 0-1 and scale with maxRad 
      var result = (_closeDate.getTime()-startDate.getTime() ) / (endDate.getTime()-startDate.getTime())*maxRad;
      
      return result;
    }

    function getTypeIndex(type) { 
      for(var i = 0; i<typeArray.length; i++)
        if(type == typeArray[i])
          return i;
    }     
    
    function onlyUnique(value, index, self) { 
      return self.indexOf(value) === index;
    } 
  }



  
  $('#debug').on('click', function(){
    positionAlgorithm(); 
    //alert("Position algorithm done, click save to export as json.");
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
    var app = $('#app').is(':checked');

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

        } else if( type === 'Application' ){
          
          if( !app ){ filter(); }
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

  $('#lvl2Filter').on('click', 'input', function(){

    var lvl2 = $('#lvl2').is(':checked');
    
    if(!lvl2){
      cy.elements('.levelTwo').addClass('filtered');
    } else {
      cy.elements('.levelTwo').removeClass('filtered');      
    }
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
