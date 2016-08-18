
$(function(){

  var layoutPadding = 100;
  var layoutDuration = 700;
  var inCompFocusView = false;

  // get exported json from cytoscape desktop via ajax
  var graphP = $.ajax({
    //url: './data/dataCalcsPolCoordRESULT.json', 
    url: './CompView/data/pyFormatedData.json', 
    type: 'GET',
    dataType: 'json'
  });

  // also get style via ajax
  var styleP = $.ajax({
    url: './CompView/data/style.cycss', 
    type: 'GET',
    dataType: 'text'
  });
  
  var infoTemplate = Handlebars.compile([
    '<p class="ac-name">{{id}}</p>',
    '{{#if NodeType}}<p class="ac-node-type"><i class="fa fa-info-circle"></i> {{NodeType}}</p>{{/if}}',
    '{{#if Country}}<p class="ac-country"><i class="fa fa-map-marker"></i> {{Country}}</p>{{/if}}',
    '{{#if WebsiteURL}}<p class="ac-more"><i class="fa fa-external-link"></i><a target="_blank" href="http://www.{{WebsiteURL}}">{{id}}</a></p>{{/if}}',
    '{{#if AnnRevenue}}<p class="ac-more"><i class="fa fa-usd"></i> {{AnnRevenue}}</p>{{/if}}',
    '{{#if CompanyType}}<p class="ac-more"><i class="fa fa-briefcase"></i> {{CompanyType}}</p>{{/if}}',
    '{{#if Owner}}<p class="ac-more"><i class="fa fa-users"></i> {{Owner}}</p>{{/if}}',
    '<p class="ac-more"><i class="fa fa-at"></i><a target="_blank" href="/AppView.html?Company={{id}}"> Go to Application View</a></p>',

  ].join(''));

  // when both graph export json and style loaded, init cy
  Promise.all([ graphP, styleP ]).then(initCy);
  
  function clear(){
    inCompFocusView = false;
    $('#lvl2Filter').hide();
    $('#lvl2').prop('checked', true);


    reset();
    //setTimeout( function(){
      cy.batch( function(){
        cy.$('.highlighted').forEach(function(n){
          n.animate({
            position: n.data('orgPos')
          },{duration: layoutDuration});
        });
        
        //cy.elements('.levelTwo').removeClass('filtered');
        cy.elements().removeClass('highlighted').removeClass('faded').removeClass('levelTwo').removeClass('done');
      });
    //}, layoutDuration);

    //setTimeout(function(){ reset(); }, layoutDuration);
  }

  function highlight( node ){
    $('#lvl2Filter').show();
    
    var intAtNodes = node.connectedEdges('edge[interaction="intAtEdge"]').connectedNodes("node[id!='"+node.id()+"'][NodeType!='Application']");
    var aTeAtNodes = node.connectedEdges('edge[interaction="apTeAtEdge"]').connectedNodes("node[id!='"+node.id()+"'][NodeType!='Application']");
    var relToNodes = node.connectedEdges('edge[interaction="RelToEdge"]').connectedNodes("node[id!='"+node.id()+"'][NodeType!='Application']");
    var appNodes = node.connectedEdges('edge[interaction="hasAppEdge"]').connectedNodes("node[id!='"+node.id()+"'][NodeType='Application']")

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
      posX = node.position().x + levelHeight + 100*i;
      posY = node.position().y + levelHeight;

      aTeAtNodes[i].animate({
          position: { x: posX, y: posY } 
        }, {
          duration: layoutDuration 
       });
    }

    //Related to nodes
    for(var i=0; i<relToNodes.length; i++){
      posX = node.position().x - levelHeight - 100*i;
      posY = node.position().y + levelHeight;

      relToNodes[i].animate({
          position: { x: posX, y: posY } 
        }, {
          duration: layoutDuration 
       });
    }

    
    setTimeout( function(){

      //Int at nodes
      for(var i=0; i<intAtNodes.length; i++){
        var secondLvlNodes = intAtNodes[i].openNeighborhood("node[id!='"+node.id()+"'][NodeType!='Application']");
        appNodes = appNodes.add( intAtNodes[i].openNeighborhood("node[id!='"+node.id()+"'][NodeType='Application']") ); // add intAtNodes[i]:s applications

        for(var j=0; j<secondLvlNodes.length; j++){
          spacing = lvl2width/secondLvlNodes.length;
          secondLvlNodes[j].addClass('levelTwo');

          secondLvlNodes[j].animate({
            position: { 
              x: intAtNodes[i].position().x,
              y: intAtNodes[i].position().y-(j+1)*levelHeight
            } 
          }, {
            duration: layoutDuration 
         });
        }
      }

      // Ap te at nodes
      for(var i=0; i<aTeAtNodes.length; i++){
        var secondLvlNodes = aTeAtNodes[i].openNeighborhood("node[id!='"+node.id()+"'][NodeType!='Application']");
        appNodes = appNodes.add( aTeAtNodes[i].openNeighborhood("node[id!='"+node.id()+"'][NodeType='Application']") );
        
        for(var j=0; j<secondLvlNodes.length; j++){
          spacing = lvl2width/secondLvlNodes.length;          
          secondLvlNodes[j].addClass('levelTwo');

          secondLvlNodes[j].animate({
            position: { 
              x: aTeAtNodes[i].position().x,
              y: aTeAtNodes[i].position().y+(j+1)*levelHeight
            } 
          }, {
            duration: layoutDuration 
         });
        }
      }

      // Related to nodes
      for(var i=0; i<relToNodes.length; i++){
        var secondLvlNodes = relToNodes[i].openNeighborhood("node[id!='"+node.id()+"'][NodeType!='Application']");
        appNodes = appNodes.add( relToNodes[i].openNeighborhood("node[id!='"+node.id()+"'][NodeType='Application']") );

        for(var j=0; j<secondLvlNodes.length; j++){
          spacing = lvl2width/secondLvlNodes.length;          
          secondLvlNodes[j].addClass('levelTwo');

          secondLvlNodes[j].animate({
            position: { 
              x: relToNodes[i].position().x,
              y: relToNodes[i].position().y+(j+1)*levelHeight
            } 
          }, {
            duration: layoutDuration 
         });
        }
      } 

      //Application nodes
      for(var i=0; i<appNodes.length; i++){
        appNodes[i].animate({
            position: { 
              x: node.position().x + 800,
              y: node.position().y - 200+(i+1)*400/appNodes.length
            } 
          }, {
            duration: layoutDuration 
         });
      } 


    }, layoutDuration );

  
    var allRelElements = node.closedNeighborhood();
    allRelElements = allRelElements.add(node.closedNeighborhood("[NodeType!='Application']").closedNeighborhood())
    //console.log(allRelElements.filter("[NodeType='Application']"));


    cy.batch(function(){ 
      cy.elements().addClass('faded');
      allRelElements.removeClass('faded').addClass('highlighted');
    });


    //Update viewport to fit elements
    setTimeout( function(){
      cy.animate({
        fit: {
          eles: allRelElements,
          padding: 30
        }
      }, {
        duration: layoutDuration
      });
    }, 2*layoutDuration+100 );

  }

  function highlight2(node){
    $('#lvl2Filter').show();

    var intAtNodes = node.connectedEdges('edge[interaction="intAtEdge"]').connectedNodes("node[id!='"+node.id()+"'][NodeType!='Application']");
    var aTeAtNodes = node.connectedEdges('edge[interaction="apTeAtEdge"]').connectedNodes("node[id!='"+node.id()+"'][NodeType!='Application']");
    var relToNodes = node.connectedEdges('edge[interaction="RelToEdge"]').connectedNodes("node[id!='"+node.id()+"'][NodeType!='Application']");
    var appNodes   = node.connectedEdges('edge[interaction="hasAppEdge"]').connectedNodes("node[id!='"+node.id()+"'][NodeType='Application']")

    const PI = Math.PI;
    var angle;
    var maxAngle;
    var minAngle;
    var posX;
    var posY;
    var lvl1Radius = 300;
    var lvl2Radius = 600;

    
    /**
     *  positions nodes between minAngle and maxAngle with radius r 
     */
    function posNodes(theNodes, minAngle, maxAngle, r){
      for(var i=0; i<theNodes.length; i++){
        if(!theNodes[i].hasClass('done')){
          if (theNodes.length==1){ angle = (minAngle+maxAngle)/2; } //if only one item position it in the center of circle disk
          else{ angle = mapToRange(i,0, theNodes.length, minAngle, maxAngle); }

          var posX = node.position().x + r * Math.cos(angle);
          var posY = node.position().y - r * Math.sin(angle);

          theNodes[i].animate({
            position: { 
              x: posX,
              y: posY
            } 
          }, {
            duration: layoutDuration 
          });
          theNodes[i].addClass('done');
        }
      }
    }

    //
    function posLvl2Nodes(theNodes, minAngle, maxAngle){
      for(var i=0; i<theNodes.length; i++){
        var secondLvlNodes = theNodes[i].openNeighborhood("node[id!='"+node.id()+"'][NodeType!='Application']");

        appNodes = appNodes.add( theNodes[i].openNeighborhood("node[id!='"+node.id()+"'][NodeType='Application']") ); // add intAtNodes[i]:s applications


        var lvl1angle = Math.acos( (theNodes[i].position().x-node.position().x)/lvl1Radius );
        if(theNodes[i].position().y-node.position().y>0)
          lvl1angle*=-1;

        if(theNodes.length>1) { lvl2DiskA = (PI/4)/theNodes.length }
        else { lvl2DiskA = (PI/4/secondLvlNodes.length); }

        minAngle = lvl1angle-lvl2DiskA;
        maxAngle = lvl1angle+lvl2DiskA;
        
        secondLvlNodes.addClass('levelTwo');
        posNodes(secondLvlNodes, minAngle, maxAngle, lvl2Radius);
      }
    }
    
    //************** LEVEL 1 *************//
    
    posNodes(intAtNodes,  3*PI/12,  9*PI/12, lvl1Radius );
    posNodes(relToNodes, 11*PI/12, 17*PI/12, lvl1Radius );
    posNodes(aTeAtNodes, 19*PI/12, 25*PI/12, lvl1Radius );




    //************** LEVEL 2 *************//
    setTimeout( function(){

      posLvl2Nodes(relToNodes, 11*PI/12, 17*PI/12);
      posLvl2Nodes(intAtNodes, 3*PI/12, 9*PI/12);
      posLvl2Nodes(aTeAtNodes, 19*PI/12, 25*PI/12);



      //App nodes
      for(var i=0; i<appNodes.length; i++){
        posX = node.position().x + 1000
        if(appNodes.length==1){ posY = node.position().y }
        else{ posY = node.position().y - mapToRange(i,0,appNodes.length, -600, 600) }

        appNodes[i].animate({
            position: { 
              x: posX,
              y: posY
            } 
          }, {
            duration: layoutDuration 
         });
      }
    }, layoutDuration+100 );    

    var allRelElements = node.closedNeighborhood();
    allRelElements = allRelElements.add(node.closedNeighborhood("[NodeType!='Application']").closedNeighborhood())
    





    


    cy.batch(function(){ 
      cy.elements().addClass('faded');
      allRelElements.removeClass('faded').addClass('highlighted');
    });


    //Update viewport to fit elements
    setTimeout( function(){
      cy.animate({
        fit: {
          eles: allRelElements,
          padding: 30
        }
      }, {
        duration: layoutDuration
      });
    }, 2*layoutDuration+200 );
  }


  function focus( node ){

    var allRelElements = node.closedNeighborhood();
    allRelElements = allRelElements.add(node.closedNeighborhood("[NodeType!='Application']").closedNeighborhood())

    cy.batch(function(){
      allRelElements.removeClass('faded').addClass('focused');
      allRelElements.addClass('focused');
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
    var RelTo;
    var thisId;

    //Loop through all the nodes
    for(var i=0; i<nodes.length; i++){
      intAt = nodes[i].data().CompanyRelationIntegratedAt;
      apTeAt = nodes[i].data().CompanyRelationAppTeamAt;
      RelTo = nodes[i].data().CompanyRelationRelatedTo;
      hasAp = nodes[i].data().hasApplication;

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
      if(hasAp){
        for(var j=0; j<hasAp.length; j++){
          cy.add({
            group:"edges",
            data:{ source: thisId, target: hasAp[j], interaction: "hasAppEdge" }
          })
        } //for j    
      }     
    } //for i
  }

  function calcReusability(){
    var appNodes = cy.nodes('node[NodeType="Application"]');
    var noApps = appNodes.length;
    var noConnections = 0;
    var reusability = 0;

    for(var i=0; i<appNodes.length; i++){
      noConnections += appNodes[i].connectedEdges().length;
    }

    reusability = Math.floor((1 -(noApps/noConnections))*100);

    return reusability;
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


    //Prospect style depending on ownership
    cy.style()
      .selector('node[Owner="M&S"]')
        .style({
          'border-width': '4px',
          'border-color': 'yellow'
        })
    .update();
    cy.style()
      .selector('node[Owner="Team Voyager"]')
        .style({
          'border-width': '4px',
          'border-color': 'red'
        })
    .update();
    cy.style()
      .selector('node[Owner="Team Enterprise"]')
        .style({
          'border-width': '4px',
          'border-color': 'blue'
        })
    .update();        



    cy.on('free', 'node', function( e ){
      // var n = e.cyTarget;
      // var p = n.position();
      
      // n.data('orgPos', {
      //   x: p.x,
      //   y: p.y
      // });



    });

    $('#reusability').text("App Reusability: "+calcReusability()+'%');
    
    cy.on('tap', function(){
      $('#search').blur();
    });

    cy.on('select', 'node', function(e){
      inCompFocusView =true;
      var node = this;


      //Application
      if(node.data().NodeType == 'Application'){
        var nodes = node.openNeighborhood();
        var allRelElements = nodes;
            allRelElements = allRelElements.add(node);
        var posX;
        var posY,

        
        posY = node.position().y + 400;

        showNodeInfo( node );
        for(var i=0; i<nodes.length; i++){
          posX = node.position().x;
          
          if(nodes.filter('node').length>1) 
            posX += mapToRange(i, 0, nodes.length, -600, 600);

          nodes[i].animate({
            position: {
              x: posX, 
              y: posY 
            }
          }, { duration:layoutDuration });
        }

        cy.elements().not( nodes ).not(node).addClass('faded');
        cy.elements().removeClass('focused');
        nodes.addClass('highlighted');
        node.addClass('highlighted');

        setTimeout(function(){
          cy.animate({
            fit: {
              eles: cy.elements('.highlighted')
            }
          }, {
            duration: layoutDuration
          });
        }, layoutDuration)


      }      



      //Customer
      if(node.data().NodeType == 'Customer' || node.data().NodeType == 'Prospect'){

        setTimeout( function(){
          cy.elements().removeClass('focused');
          highlight2( node );
        }, layoutDuration);
      }

    });

    cy.on('unselect', 'node', function(e){
      var node = this;

      clear();
      unfocus();
      hideNodeInfo();
    });
     

    cy.on('mouseover', 'node', function(e){
      var node = this;

      if(!inCompFocusView){
        if(node.data().NodeType!='vertInfoNode'){
          focus(node);
          showNodeInfo( node );
        }
      }

    });

    cy.on('mouseout', 'node', function(e){
      var node = this;
      if(!inCompFocusView){
        unfocus();
        hideNodeInfo();
      }
    });
    addVertInfoNodes();
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
    cy.elements().removeClass('hidden');
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

  function addVertInfoNodes(){
    var custNodes = cy.elements('node[NodeType="Customer"]');
    var radius;
    var angle;   
    var textAngle;   
    var typeArray = [];  
    var typeInd;
    var halign;

    //Get unique company types and store them in typeArray
    for(var i=0; i<custNodes.length; i++){
        typeArray.push(custNodes[i].data().CompanyType);
    }
    typeArray = typeArray.filter( onlyUnique );

    cy.remove('node[NodeType="vertInfoNode"]');
    //for each type
    for(var i=0; i<typeArray.length; i++){
      radius = 3500;                        
      angle = 2*i*Math.PI/typeArray.length;    
      
      textAngle = angle;
      halign = 'right';

      if(angle>Math.PI/2){
        textAngle+=Math.PI;
        halign = 'left';
      } 
      if(angle>3*Math.PI/2){
        textAngle+=Math.PI
        halign = 'right';
      }

      cy.add([
        { group: "nodes", 
          data: { id: typeArray[i], CompanyType: typeArray[i], NodeType: 'vertInfoNode' }, 
          position: { x: radius*Math.cos(angle), y: radius*Math.sin(angle) }, 
          locked: true, selectable: false,
          style:{'text-rotation': textAngle, 'text-halign': halign} }
      ]);
    }

    cy.style().update();

    function onlyUnique(value, index, self) { 
      return self.indexOf(value) === index;
    } 
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

      //Set prospect locations
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

  /**
  * Maps x where x =[min,...,max] to [a,...,b]
  */
  function mapToRange(x, min, max, a, b){
    //****** Mathematical formula ******//
    //                                  //
    // range [min,max] -> [a,b]         //
    //                                  //
    //**********************************//
    //           (b-a)(x - min)         //
    //    f(x) = --------------  + a    //
    //             max - min            //
    //**********************************//
    var fx = (b-a)*(x-min)/(max-min) + a; 
    return fx;
  }

  
  $('#debug').on('click', function(){
    // cy.remove('edge');
    // addEdges();
    // positionAlgorithm(); 
    
    //addVertInfoNodes();

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
  
  function doFiltering(){
    var tVoyager          = $('#tVoyager').is(':checked');
    var tEnterprise       = $('#tEnterprise').is(':checked');
    var tMS               = $('#tMS').is(':checked');

    var cust              = $('#cust').is(':checked');
    var evan              = $('#evan').is(':checked');
    var subs              = $('#subs').is(':checked');
    var lead              = $('#lead').is(':checked');
    var markQualLead      = $('#markQualLead').is(':checked');
    var saleQualLead      = $('#saleQualLead').is(':checked');
    var prosp             = $('#prosp').is(':checked');
    var app               = $('#app').is(':checked');
    var rel               = $('#rel').is(':checked');
    var own               = $('#own').is(':checked');
    var vertinf           = $('#vertinf').is(':checked');


    var jordbruk          = $('#jordbruk').is(':checked'); //Jordbruk, skogsbruk och fiske
    var utvinning         = $('#utvinning').is(':checked'); // Utvinning av mineral
    var tillverkning      = $('#tillverkning ').is(':checked'); // Tillverkning
    var försörjning       = $('#försörjning').is(':checked'); // Försörjning av el, gas, värme och kyla 
    var vattenförsörjning = $('#vattenförsörjning').is(':checked'); // Vattenförsörjning; avloppsrening, avfallshantering och sanering
    var bygg              = $('#bygg').is(':checked'); // Byggverksamhet 
    var handelRep         = $('#handelRep').is(':checked'); // Handel; reperation av motorfordon och motorcyklar 
    var transport         = $('#transport').is(':checked'); // Transport och magasinering 
    var hotell            = $('#hotell').is(':checked'); // Hotell- och restaurangverksamhet 
    var information       = $('#information').is(':checked'); // Informatinos- och kommunikationsverksamhet 
    var finans            = $('#finans').is(':checked'); // Finans- och försäkringsverksamhet 
    var fastighet         = $('#fastighet').is(':checked'); // Fastighetsverksamhet 
    var verksamhet        = $('#verksamhet').is(':checked'); // Verksamhet inom juridik, ekonomi, vetenskap och teknik 
    var Uthyrning         = $('#uthyrning').is(':checked'); // Uthyrning, fastighetsservice, resetjänster och andra stödtjänster 
    var förvaltning       = $('#förvaltning').is(':checked'); // Offentlig förvaltning och FÖRSVAR; OBLIGATORISK SOCIALFÖRSÄKRING
    var utbilding         = $('#utbilding').is(':checked'); // Utbildning 
    var vård              = $('#vård').is(':checked'); // Vård och omsorg; sociala tjänster 
    var kultur            = $('#kultur').is(':checked'); // Kultur, nöje och fritid
    var service           = $('#service').is(':checked'); // Annan serviceverksamhet
    var förvärv           = $('#förvärv').is(':checked'); // Förvärvsarbete i hushåll; hushållens produktion av diverse varor och tjänster för eget bruk
    var ambassad          = $('#ambassad').is(':checked'); // Verksamhet vid internationella orginisationer, utländska ambassader o.d.
    var other             = $('#other').is(':checked'); // Other
    var notSet            = $('#notSet').is(':checked');// Not set



    if(!rel ){
      cy.edges().addClass('filtered');
    } else {
      cy.edges().removeClass('filtered');
    }

    if(!own){
      cy.style()
      .selector('node')
        .style({
          'border-width': '0px'
      }).update();
    } else {
      cy.style()
      .selector('node')
        .style({
          'border-width': '4px'
      }).update();
    }

    cy.batch(function(){
      cy.nodes().forEach(function( n ){
        var type = n.data('NodeType');
        var Owner = n.data('Owner');
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

        } else if( type === 'vertInfoNode' ){
          
          if( !vertinf ){ filter(); }

        }


        if( Owner === 'Team Voyager' ){
          
          if( !tVoyager ){ filter(); }
          
        } else if( Owner === 'Team Enterprise' ){
          
          if( !tEnterprise ){ filter(); }
          
        } else if( Owner === 'M&S' ){
          
          if( !tMS ){ filter(); }
          
        }


        if( CompanyType === 'JORDBRUK, SKOGSBRUK OCH FISKE' ){
          if( !jordbruk ){ filter(); }
          
        } else if( CompanyType === 'UTVINNING AV MINERAL' ){
          if( !utvinning ){ filter(); }

        } else if( CompanyType === 'TILLVERKNING' ){
          if( !tillverkning ){ filter(); }
          
        } else if( CompanyType === 'FÖRSÖRJNING AV EL, GAS, VÄRME OCH KYLA' ){
          if( !försörjning ){ filter(); }
          
        } else if( CompanyType === 'VATTENFÖRSÖRJNING; AVLOPPSRENING, AVFALLSHANTERING OCH SANERING' ){
          if( !vattenförsörjning ){ filter(); }
          
        } else if( CompanyType === 'BYGGVERKSAMHET' ){
          if( !bygg ){ filter(); }
          
        } else if( CompanyType === 'HANDEL; REPARATION AV MOTORFORDON OCH MOTORCYKLAR' ){
          if( !handelRep ){ filter(); }
          
        } else if( CompanyType === 'TRANSPORT OCH MAGASINERING' ){
          if( !transport ){ filter(); }
          
        } else if( CompanyType === 'HOTELL- OCH RESTAURANGVERKSAMHET' ){
          if( !hotell ){ filter(); }
          
        } else if( CompanyType === 'INFORMATIONS- OCH KOMMUNIKATIONSVERKSAMHET' ){
          if( !information ){ filter(); }
          
        } else if( CompanyType === 'FINANS- OCH FÖRSÄKRINGSVERKSAMHET' ){
          if( !finans ){ filter(); }
          
        } else if( CompanyType === 'FASTIGHETSVERKSAMHET' ){
          if( !fastighet ){ filter(); }
          
        } else if( CompanyType === 'VERKSAMHET INOM JURIDIK, EKONOMI, VETENSKAP OCH TEKNIK' ){
          if( !verksamhet ){ filter(); }
          
        } else if( CompanyType === 'UTHYRNING, FASTIGHETSSERVICE, RESETJÄNSTER OCH ANDRA STÖDTJÄNSTER' ){
          if( !Uthyrning ){ filter(); }
          
        } else if( CompanyType === 'OFFENTLIG FÖRVALTNING OCH FÖRSVAR; OBLIGATORISK SOCIALFÖRSÄKRING' ){
          if( !förvaltning ){ filter(); }
          
        } else if( CompanyType === 'UTBILDNING' ){
          if( !utbilding ){ filter(); }
          
        } else if( CompanyType === 'VÅRD OCH OMSORG; SOCIALA TJÄNSTER' ){
          if( !vård ){ filter(); }
          
        } else if( CompanyType === 'KULTUR, NÖJE OCH FRITID' ){
          if( !kultur ){ filter(); }
          
        } else if( CompanyType === 'ANNAN SERVICEVERKSAMHET' ){
          if( !service ){ filter(); }
          
        } else if( CompanyType === 'FÖRVÄRVSARBETE I HUSHÅLL; HUSHÅLLENS PRODUKTION AV DIVERSE VAROR OCH TJÄNSTER FÖR EGET BRUK' ){
          if( !förvärv ){ filter(); }
          
        } else if( CompanyType === 'VERKSAMHET VID INTERNATIONELLA ORGANISATIONER, UTLÄNDSKA AMBASSADER O.D.' ){
          if( !ambassad ){ filter(); }
          
        } else if( CompanyType === 'Other' ){
          if( !other ){ filter(); }
          
        } else if( CompanyType === 'Not set' ){
          if( !notSet ){ filter(); }
          
        }
      });
    }); 
  }

  $('#filters').on('click', 'input', function(){
    doFiltering();
  });
  $('#filtersType').on('click', 'input', function(){
    doFiltering();
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

  $('#filterType').qtip({
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

    content: $('#filtersType')
  });

  $('#legend').qtip({
    position: {
      my: 'bottom left',
      at: 'top right'
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

    content: $('#legends')
  });


});
