$(function(){ // on dom ready

var noExpe = 0;
var noProc = 0;
var noSyst = 0;
var noAppNodes = 1;

var layoutDuration = 100;
var layoutPadding  = 50;
var layoutBarIncW = 15;

var cy;

var theLayout = {
    name: 'preset',
    padding: layoutPadding,
    fit: true
  }

var graphP = $.ajax({
  //url: './data/dataCalcsPolCoordRESULT.json', 
  url: './AppView/data/data.json', 
  type: 'GET',
  dataType: 'json'
});

var styleP = $.ajax({
  url: './AppView/data/style.cycss', 
  type: 'GET',
  dataType: 'text'
});


//Add company select options
Promise.all([ graphP ]).then(function(){
  for(var i=0; i<graphP.responseJSON.length; i++){
    addCompOptions(graphP.responseJSON[i].id);
  }
});




Promise.all([ graphP, styleP ]).then(initCy);

function initCy( then ){
  var expJson = then[0];
  var styleJson = then[1];
  // var hash = window.location.hash.substring(1);
  var hash = getQueryVariable("Company");

  cy = cytoscape({
    container: document.getElementById('cy'),
    
    boxSelectionEnabled: false,
    
    style: styleJson,
    
    elements: {
      nodes: [
        // eShape
        { data: { id: 'a', type: 'eShape' }, position: { x: 0, y:   0 }, grabbable: false, locked: true, selectable: false },
        { data: { id: 'aCornerBG', type: 'eShapeCorner' }, position: { x: 22, y:   22 }, grabbable: false, locked: true, selectable: false },
        { data: { id: 'aCorner',   type: 'eShapeCorner' }, position: { x: 30, y:   30 }, grabbable: false, locked: true, selectable: false },

        { data: { id: 'b', type: 'eShape' }, position: { x: 0, y: 60 }, grabbable: false, locked: true, selectable: false },
        { data: { id: 'bCornerBG', type: 'eShapeCorner' }, position: { x: 22, y:   98 }, grabbable: false, locked: true, selectable: false },
        { data: { id: 'bCorner',   type: 'eShapeCorner' }, position: { x: 30, y:   90 }, grabbable: false, locked: true, selectable: false },

        { data: { id: 'c', type: 'eShape' }, position: { x: 0, y: 120 }, grabbable: false, locked: true, selectable: false },
        { data: { id: 'aEnd', type: 'eShape' }, position: { x: 200, y:   0 }, style :{ shape:'square' }, grabbable: false, locked: true, selectable: false },
        { data: { id: 'bEnd', type: 'eShape' }, position: { x: 175, y: 60 }, style :{ shape:'square' }, grabbable: false, locked: true, selectable: false },
        { data: { id: 'cEnd', type: 'eShape' }, position: { x: 200, y: 120 }, style :{ shape:'square' }, grabbable: false, locked: true, selectable: false },

      ],
      edges: [
        { data: { type: 'eShape', source: 'a', target: 'aEnd', id: 'EtopBar' } },
        { data: { type: 'eShape', source: 'b', target: 'bEnd', id: 'EmidBar'  } },
        { data: { type: 'eShape', source: 'c', target: 'cEnd', id: 'EbotBar'  } },
        { data: { type: 'eShape', source: 'a', target: 'c' },  id: 'EBackBone'},


      ]
    },
    
    layout: theLayout
  });
  

  /**
   * Searches for comp with name compName in data file
   * @param  {string} compName    [the company name/id]
   * @return {[jsonObj, bool]}    [Returns the data object if found, else returns false]
   */
  function getCompData(compName){
    for(var i=0; i<expJson.length; i++){
      if(expJson[i].id==hash)
        return expJson[i];
    }
    return false;
  }

  if (hash){
      hash=hash.replace('+',' ');
      var comp = getCompData(hash);

    if (comp)
      readData2(comp);
    else
      alert("Company with name "+hash+" not found in dataset.");
  }

  //Event listeners
  cy.on('select', 'node', function(e){
    var node = this;
    var conEdges = node.connectedEdges('edge[type="goodIntEdge"]').connectedNodes().connectedEdges('edge[type="goodIntEdge"]').connectedNodes().connectedEdges('edge[type="goodIntEdge"]');
    var conNodes = conEdges.connectedNodes('node[type="app"][id!="'+node.id()+'"]');
    var rightNodeGood = node.connectedEdges('edge[type="rightIntEdge"]').connectedNodes('node[type="conPointNodeRightGood"]');
        rightNodeGood = rightNodeGood.add( rightNodeGood.connectedEdges() );


    cy.elements().removeClass('hidden');




    if( node.data().type == 'app'){

      conEdges.style({
        'z-index':'9999'
      });
      conEdges.animate({
        style: { 'line-color' : 'blue' }
      }, {
        duration: layoutDuration
      });

      node.animate({
        style: {'width':'50px','height':'50px',  }
      }, {
        duration: layoutDuration
      });
      conNodes.animate({
        style: {'width':'50px','height':'50px',  }
      }, {
        duration: layoutDuration
      });

      rightNodeGood.animate({
        style: {'background-color':'#a9c742'}
      }, {
        duration: layoutDuration
      });

      showNodeInfo(node);
    }
  });

  cy.on('unselect', 'node', function(e){

    cy.edges('edge[type="goodIntEdge"]').style({
      'z-index':'0'
    });
    cy.edges('edge[type="goodIntEdge"]').animate({
      style: { 'line-color' : '#a9c742' }
    }, {
      duration: layoutDuration
    });

    cy.nodes('node[type="app"]').animate({
      style: {'width':'40px','height':'40px' }
    }, {
      duration: layoutDuration
    });

    cy.nodes('node[type="conPointNodeRightGood"]').animate({
      style: { 'background-color':'#e8e8e8' }
    }, {
      duration: layoutDuration
    });

    hideNodeInfo();
  });

  cy.on('mouseover', 'node[type="app"]', function(e){
    var node = this;

    console.log(node);
    if(cy.$(':selected').length<1)
      showNodeInfo(node);
  });

  cy.on('mouseout', 'node[type="app"]', function(e){
    if(cy.$(':selected').length<1)
      hideNodeInfo();
  });

  cy.on('tap', 'edge', function(e){
    var edge = this;

    console.log(edge.data());
  });

  cy.on('tap', 'node', function(e){
    var node = this;

    console.log(node.data());
    console.log(node.position().y);
  });
}


var infoTemplate = Handlebars.compile([
  '<p class="ac-name"> Name: {{id}}</p>',
  '{{#if connectedNodes}}<p class="ac-more"><i class="fa fa-cog"></i> Integrated with: {{connectedNodes}}</p>{{/if}}',    

].join(''));




var addCompOptions = function(optName) {
    var theList = document.getElementById("compSelectList");
    var option = document.createElement("option");
    option.text = optName;
    option.value = optName;
    theList.add(option);
}

var addExperience = function(){
  console.log("Add Experience");

  noExpe++;
  var position={ x: noExpe*60, y: 0 };
  if(position.x > cy.$('#aEnd').position().x){
    cy.$('#aEnd').position().x += 60;
    cy.$('#bEnd').position().x += 60;
    cy.$('#cEnd').position().x += 60;
  }

  cy.add({
    group: "nodes",
    data: { id: "Exp"+noExpe },
    position: position
  });

  cy.layout( theLayout );
}

var addProcess = function(){
  console.log("Add Process");

  noProc++;
  var position={ x: noProc*60, y: 60 };
  if(position.x > cy.$('#aEnd').position().x){
    cy.$('#aEnd').position().x += 60;
    cy.$('#bEnd').position().x += 60;
    cy.$('#cEnd').position().x += 60;
  }

  cy.add({
    group: "nodes",
    data: { id: "Proc"+noProc },
    position: position
  });

  cy.layout( theLayout );
}

var addSystem = function(){
  console.log("Add System");


  noSyst++;
  var position={ x: noSyst*60, y: 120 };
  if(position.x > cy.$('#aEnd').position().x){
    cy.$('#aEnd').position().x += 60;
    cy.$('#bEnd').position().x += 60;
    cy.$('#cEnd').position().x += 60;
  }

  cy.add({
    group: "nodes",
    data: { id: "Syst"+noSyst },
    position: position
  });

  cy.layout( theLayout );
}

var addApp = function(appData){
  var appType = appData.appType;
  var _appId = appData.id;
  var services = appData.services;
  var contracts = appData.contracts;
  var spacing = 60;
  var internalNodeSpace = 15;

  var posX = noAppNodes*spacing;
  var posY = 225;
  if(appData.appType == 'middleware') 
    posY=200;

  var position={ x: posX, y: posY };

  if(position.x > cy.$('#aEnd').position().x-spacing){
    cy.$('#aEnd').position().x += spacing;
    cy.$('#bEnd').position().x += spacing;
    cy.$('#cEnd').position().x += spacing;
  }

  //Add the first node
  noAppNodes++;
  cy.add({
    group: "nodes",
    data: { id: _appId, appType: appType, type:'app', services: services, contracts: contracts },
    position: position
  });

  //Add point for the contract node
  if(contracts.length>0){
    noAppNodes+=0.3;
    var intPosX = posX +internalNodeSpace;
    cy.add([
        {group: "nodes", data: { id: _appId+'-'+'contractNode', appType: appType, type:'appBodyNode' }, position: {x: intPosX, y: posY} },
        {group: "edges", data: { source: _appId, target: _appId+'-'+'contractNode', type: 'appBodyEdge', appType: appType  } }
      ]
    );

    if(intPosX > cy.$('#aEnd').position().x-spacing){
      cy.$('#aEnd').position().x += spacing;
      cy.$('#bEnd').position().x += spacing;
      cy.$('#cEnd').position().x += spacing;
    }   
  }

  //Add points for service nodes
  for(var i=0; i<services.length; i++){
    noAppNodes+=0.3;
    var intPosX = posX +(i+2)*internalNodeSpace;
    cy.add([
        {group: "nodes", data: { id: _appId+'-'+'serviceNode'+i, appType: appType, type:'appBodyNode' }, position: {x: intPosX, y: posY} },
        {group: "edges", data: { source: _appId, target: _appId+'-'+'serviceNode'+i, type: 'appBodyEdge', appType: appType  } }
      ]
    );

    if(intPosX > cy.$('#aEnd').position().x-spacing){
      cy.$('#aEnd').position().x += spacing;
      cy.$('#bEnd').position().x += spacing;
      cy.$('#cEnd').position().x += spacing;
    }
  }
  
  cy.layout( theLayout );
}


//Event listeners
$('#addExperience').on('click', function(){
  addExperience();
})

$('#addSystem').on('click', function(){
  addSystem();
})

$('#addApp').on('click', function(){
  addApp('App'+noAppNodes);
})

$('#addProcess').on('click', function(){
  addProcess();
})
$('#debug').on('click', function(){
  incBotBarWidth(10);  
})

$('#clear').on('click', function(){
  clear();
})










function showNodeInfo( node ){
  $('#info').html( infoTemplate( node.data() ) ).show();
}

function hideNodeInfo(){
  $('#info').hide();
}

function clear(){

  cy.remove( cy.elements("node[type != 'eShape'][type != 'eShapeCorner']") );
  cy.$('#aEnd').position().x = 200;
  cy.$('#bEnd').position().x = 175;
  cy.$('#cEnd').position().x = 200;


  cy.$("#aEnd").style({
    'height': 30
  })
  cy.$("#bEnd").style({
    'height': 30
  })
  cy.$("#cEnd").style({
    'height': 30
  })
  cy.$("#a").style({
    'height': 30
  })
  cy.$("#c").style({
    'height': 30
  })    

  cy.$("#EmidBar").style({ 
      'width': 30
  })
  cy.$("#EtopBar").style({ 
      'width': 30
  })
  cy.$("#EbotBar").style({ 
      'width': 30
  })    

  //move top bar to initial position
  cy.$('#a').position().y = 0;
  cy.$('#aEnd').position().y = 0;
  cy.$('#aCorner').position().y = 30;
  cy.$('#aCornerBG').position().y = 22;

  //move middle bar to initial position
  cy.$('#b').position().y=60;
  cy.$('#bEnd').position().y=60;

  //move bottom bar to initial position
  cy.$('#c').position().y=120;
  cy.$('#cEnd').position().y=120;
  cy.$('#bCorner').position().y = 90;
  cy.$('#bCornerBG').position().y = 98;  

  noAppNodes = 0;
  noSyst = 0;
  noProc = 0;
  noExpe = 0;

  cy.layout(theLayout);  
}

//https://css-tricks.com/snippets/javascript/get-url-variables/
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}


function readData2( data ){
  var applications = data.Applications;

  //Add application nodes
  for(var i=0; i<applications.length; i++){
    addApp(applications[i]);
  }

  //Add application connections
  //for each edge
  for(var i=0; i<data.edges.length; i++){

    var dataSource = data.edges[i].source;
    var dataTarget = data.edges[i].target;


    var sourceConPosX = cy.$("[id='"+String(dataSource)+"']").position().x;
    var targetConPosX = cy.$("[id='"+String(dataTarget)+"']").position().x;

    //Connection points
    cy.add([

      //Middle bar nodes, edges
      { group: "nodes", data: { type: 'conPointNodeGood', id:'sConP'+i}, position: {x: sourceConPosX, y: 60-i*layoutBarIncW }, selectable: false, locked: true },
      { group: "nodes", data: { type: 'conPointNodeGood', id:'tConP'+i}, position: {x: targetConPosX, y: 60-i*layoutBarIncW }, selectable: false, locked: true },
      { group: "edges", data: { source: dataSource, target: 'sConP'+i, type: 'goodIntEdge' } },
      { group: "edges", data: { source: 'sConP'+i, target: 'tConP'+i, type: 'goodIntEdge' } },
      { group: "edges", data: { source: 'tConP'+i, target: dataTarget, type: 'goodIntEdge' } },
      
      

      //Edges below, bad edges
      { group: "edges", data: { source: dataSource, target: dataTarget, type: 'spaghEdge' }, style: { 'control-point-distances': 0.5*Math.abs(sourceConPosX - targetConPosX ) } },

      { group: "nodes", data: { type: 'conPointNodeBad', id:'sBadConP'+i}, position: {x: sourceConPosX, y: 300+i*layoutBarIncW }, selectable: false, locked: true, classes: 'filtered' },
      { group: "nodes", data: { type: 'conPointNodeBad', id:'tBadConP'+i}, position: {x: targetConPosX, y: 300+i*layoutBarIncW }, selectable: false, locked: true, classes: 'filtered' },
      { group: "edges", data: { source: dataSource, target: 'sBadConP'+i, type: 'straightSpaghEdge' } },
      { group: "edges", data: { source: 'sBadConP'+i, target: 'tBadConP'+i, type: 'straightSpaghEdge' } },
      { group: "edges", data: { source: 'tBadConP'+i, target: dataTarget, type: 'straightSpaghEdge' } },  
    
    ]);

    //Right side integration list
    cy.add([
      //Good
      { group: "nodes", data: { type: 'conPointNodeRightGood', id:'intConPGood'+i, label: data.edges[i].source+' -> '+data.edges[i].target }, 
        position: { x: cy.$('#aEnd').position().x + 10, y: cy.$("#sConP"+String(i) ).position().y }, selectable: false }, //Connection point

      { group: "edges", data: { source: data.edges[i].source, target: 'intConPGood'+i, type: 'rightIntEdge' }, classes: 'filtered'  },            //int edge source->conP
      { group: "edges", data: { source: 'intConPGood'+i, target: data.edges[i].target, type: 'rightIntEdge' }, classes: 'filtered'  },             //int edge source->conP  

      //Bad
      { group: "nodes", data: { type: 'conPointNodeRightBad', id:'intConPBad'+i, label: data.edges[i].source+' -> '+data.edges[i].target }, classes: 'filtered', 
        position: { x: cy.$('#aEnd').position().x + 10, y: cy.$("#sBadConP"+String(i) ).position().y } }, //Connection point

      { group: "edges", data: { source: data.edges[i].source, target: 'intConPBad'+i, type: 'rightIntEdge' } },            //int edge source->conP
      { group: "edges", data: { source: 'intConPBad'+i, target: data.edges[i].target, type: 'rightIntEdge' } },             //int edge source->conP     
    ]);  
    incMidBarWidth(15);
  }

  
  var initTopBarPos = cy.$('#a').position().y;
  var initMidBarPos = cy.$('#b').position().y;
  var initBotBarPos = cy.$('#c').position().y;

  var topBarWidth = parseInt( cy.$("#aEnd").style().height );
  var midBarWidth = parseInt( cy.$("#bEnd").style().height );
  var botBarWidth = parseInt( cy.$("#cEnd").style().height );

  //For each application
  for(var i=0; i< applications.length; i++){
    var contracts = applications[i].contracts;
    var services  = applications[i].services;

    
    if(contracts.length>0){
      var contractNode = cy.$("[id='"+applications[i].id+"-contractNode']");
      var backPosX = contractNode.position().x;
      var backPosY = cy.$('#a').position().y-80;

    
      //Add backbones lines
      cy.add([
        { group: "nodes", data: { type: 'backboneTop', id: applications[i].id+'topContBackbone' }, position: {x: backPosX, y: backPosY } },
        { group: "edges", data: { source: contractNode.id(), target: applications[i].id+'topContBackbone', type: 'backbone' }  },            //int edge source->conP  
      ]);
    }

    // for each service
    for(var j=0; j<services.length; j++){

      var serviceNode = cy.$("[id='"+applications[i].id+"-serviceNode"+j+"']");
      var backPosX = serviceNode.position().x;
      var backPosY = cy.$('#a').position().y-80; 

      //Add the backbone
      cy.add([
        { group: "nodes", data: { type: 'backboneTop', id: applications[i].id+'topServBackbone'+j }, position: {x: backPosX, y: backPosY } },
        { group: "edges", data: { source: serviceNode.id(), target: applications[i].id+'topServBackbone'+j, type: 'backbone' }  },            //int edge source->conP  
      ]);


      //add service nodes
      if(services[j].type == "Experience" )  { posY = initTopBarPos - 13*(noExpe+1) + topBarWidth/2 ; noExpe++; }
      else if(services[j].type == "Process" ){ posY = initMidBarPos - 13*(noProc+1) + midBarWidth/2 ; noProc++; }
      else if( services[j].type == "System" ){ posY = initBotBarPos - 13*(noSyst+1) + botBarWidth/2 ; noSyst++; }
      else { posY = 1000; } //If no type, position node off to find it easily

      posX = serviceNode.position().x;      
      cy.add([
        { group: "nodes", data: { type: 'service', serviceType: services[j].type, id: services[j].id }, position: {x: posX, y: posY } }
      ]);
    }
  }


  //When all services has been added, increase bars width
  var newBotWidth = 13*(noSyst+1);
  var newMidWidth = 13*(noProc+1);
  var newTopWidth = 13*(noExpe+1);
  
  //Only increase if the new width > than current width
  if( newBotWidth > botBarWidth  ){ incBotBarWidth(newBotWidth - botBarWidth); } 
  if( newMidWidth > midBarWidth  ){ incMidBarWidth(newMidWidth - midBarWidth); }
  if( newTopWidth > topBarWidth  ){ incTopBarWidth(newTopWidth - topBarWidth); }
  

  //finaly, loop through applications again, and insert contracts
  for(var i=0; i<applications.length; i++){
    var contracts = applications[i].contracts;

    for(var j=0; j<contracts.length; j++){
      var target = cy.$( "[id='"+contracts[j].target+"']" );
      var contractNode = cy.$("[id='"+applications[i].id+"-contractNode']");

      posX = contractNode.position().x;
      posY = target.position().y;

      cy.add([
        { group: "nodes", data: { type: 'contract', id: contracts[j].id }, position: {x: posX, y: posY } },
        { group: "edges", data: { source: contracts[j].id, target: target.id(), type: 'contractServiceEdge' } }
      ]);

    }
  }

  //filtered per default
  // cy.elements("[type='backbone']").addClass('filtered');
  // cy.elements("[type='backboneTop']").addClass('filtered');
  // cy.elements("[type='appBodyNode']").addClass('filtered');
  // cy.elements("[type='service']").addClass('filtered');
  // cy.elements("[type='contract']").addClass('filtered');
  cy.elements("[type='spaghEdge']").addClass('filtered');
  cy.elements("[type='conPointNodeGood']").addClass('filtered');
  cy.elements("[type='conPointNodeRightGood']").addClass('filtered');


  //Add data to each app containing connected targets
  var applications = cy.$('node[type="app"]');
  for(var i=0; i<applications.length; i++){
    var connectedEdges = applications[i].connectedEdges("edge[type='spaghEdge']");

    applications[i].data().connectedNodes ='';

    //loop through each connected edge
    for(var j=0; j<connectedEdges.length; j++){
      //Check if current edge target is current node, if not; add target
      if(connectedEdges[j].target().data().id!=applications[i].data().id)
        applications[i].data().connectedNodes+=connectedEdges[j].target().data().id+', ';
      if(connectedEdges[j].source().data().id!=applications[i].data().id)
        applications[i].data().connectedNodes+=connectedEdges[j].source().data().id+', ';
    }
  }
}



//Increases the middle bar width and moves top bar up
function incMidBarWidth( stepSize ){
  var currH = parseInt( cy.$("#bEnd").style().height );
  var newH = currH+stepSize;

  cy.$("#bEnd").style({
      'height': currH+stepSize
    })

  //middle bar width
  cy.$("#EmidBar").style({ 
      'width': currH+stepSize
  })

  //move middle bar
  cy.$('#b').position().y-=stepSize/2;
  cy.$('#bEnd').position().y-=stepSize/2;

  //move top bar
  cy.$('#a').position().y -= stepSize;
  cy.$('#aEnd').position().y -= stepSize;
  cy.$('#aCorner').position().y -= stepSize;
  cy.$('#aCornerBG').position().y -= stepSize;

  //Move backboneTop nodes
  var topBackboneNodes = cy.$('node[type="backboneTop"]');
  
  topBackboneNodes.forEach(function(n){
    n.position().y -= stepSize;
  })

  var experiences = cy.$('node[type="service"][serviceType="Experience"]');
  experiences.forEach(function(n){
    n.position().y -= stepSize;
  })

  cy.layout(theLayout);
}

function incTopBarWidth( stepSize ){
  var currH = parseInt( cy.$("#aEnd").style().height );
  var newH = currH+stepSize;

  cy.$("#aEnd").style({
      'height': currH+stepSize
  })
  cy.$("#a").style({
      'height': currH+stepSize
  })
  //middle bar width
  cy.$("#EtopBar").style({ 
      'width': currH+stepSize
  })

  //move top bar
  cy.$('#a').position().y -= stepSize/2;
  cy.$('#aEnd').position().y -= stepSize/2;

  //Move backboneTop nodes
  var topBackboneNodes = cy.$('node[type="backboneTop"]');
  
  topBackboneNodes.forEach(function(n){
    n.position().y -= stepSize;
  })

  cy.layout(theLayout);
}

function incBotBarWidth( stepSize ){
  var currH = parseInt( cy.$("#cEnd").style().height );
  var newH = currH+stepSize;

  cy.$("#c").style({
      'height': currH+stepSize
  })
  cy.$("#cEnd").style({
      'height': currH+stepSize
  })
  cy.$("#EbotBar").style({ 
      'width': currH+stepSize
  })

    //move bot bar
  cy.$('#c').position().y -= stepSize/2;
  cy.$('#cEnd').position().y -= stepSize/2;
  cy.$('#bCorner').position().y -= stepSize;
  cy.$('#bCornerBG').position().y -= stepSize;

  //move middle bar
  cy.$('#b').position().y-=stepSize;
  cy.$('#bEnd').position().y-=stepSize;

  //move top bar
  cy.$('#a').position().y -= stepSize;
  cy.$('#aEnd').position().y -= stepSize;
  cy.$('#aCorner').position().y -= stepSize;
  cy.$('#aCornerBG').position().y -= stepSize;

  //Move conpoints in middlebar
  var middleConPoints = cy.$('node[type="conPointNodeGood"]');
      middleConPoints = middleConPoints.add(cy.$('node[type="conPointNodeRightGood"]') );
  middleConPoints.forEach(function(n){
    n.position().y -= stepSize;
  })


  //Move backboneTop nodes
  var topBackboneNodes = cy.$('node[type="backboneTop"]');
  topBackboneNodes.forEach(function(n){
    n.position().y -= stepSize;
  })


  //Move processes
  var processes = cy.$('node[type="service"][serviceType="Process"]');
  processes.forEach(function(n){
    n.position().y -= stepSize;
  })


  //Move experiences
  var experiences = cy.$('node[type="service"][serviceType="Experience"]');
  experiences.forEach(function(n){
    n.position().y -= stepSize;
  })
  cy.layout(theLayout);
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
    
    var fields = ['id', 'type'];
    
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
    
     //var res = cy.nodes("[type!='conPointNodeGood'][type!='conPointNodeBad'][type!='eShape'][type!='eShapeCorner'][type!='conPointNodeRightGood'][type!='conPointNodeRightBad']").stdFilter( anyFieldMatches ).sort( sortByName ).map( getData );
     var res = cy.nodes("[type='app']").stdFilter( anyFieldMatches ).sort( sortByName ).map( getData );
    
      cy.batch(function(){
        cy.elements().removeClass('hidden');
        if(query.length>0)
          cy.elements().not( cy.elements("[type='app']").stdFilter( anyFieldMatches ) ).not(cy.$("node[type='eShape'],node[type='eShapeCorner'], edge[type='eShape']")).addClass('hidden');
      });
    


    cb( res );
  },
  templates: {
    suggestion: infoTemplate
  }
}).on('typeahead:selected', function(e, entry, dataset){
  var n = cy.getElementById(entry.id);
  cy.elements().unselect();

  n.select();
  console.log(n.selected());
  showNodeInfo( n );
});

$('#filters').on('click', 'input', function(){
  doFiltering();
});
$('#filtersToggle').on('click', 'input', function(){
  doFiltering();
});

$("#btnSearch").click( function() { 
  var result = cy.nodes("[type='app']").not( cy.nodes('.hidden') );
  focView(result);
});

$('#detailedInf').change(function(){
  if ($(this).prop('checked') == true) {
    $('#badIntEdges').prop('checked', false);
    $('#goodIntEdges').prop('checked', false);
    doFiltering();
  }

  else {
    $('#badIntEdges').prop('checked', true);
    $('#goodIntEdges').prop('checked', true);
    doFiltering();    
  }
});


function focView(data){
  var newDataSet = data.clone();
  clear();
  console.log( newDataSet[0].data() );
  
}

function doFiltering(){
    
  var badIntEdges = $('#badIntEdges').is(':checked');
  var goodIntEdges = $('#goodIntEdges').is(':checked');
  var intInfo = $('#intInfo').is(':checked');
  var toggleBadGrid = $('#toggleBadGrid').is(':checked');
  var toggleRightIntEdge = $('#toggleRightIntEdge').is(':checked');
  var detailedInf = $('#detailedInf').is(':checked');

  cy.batch(function(){
    cy.elements().forEach(function( n ){
      var type = n.data('type');

      n.removeClass('filtered');
      
      var filter = function(){
        n.addClass('filtered');
      };

      if( type === 'conPointNodeGood' || type=== 'conPointNodeRightGood'){
        
        if( !goodIntEdges ){ filter(); }
        
      }  else if( type === 'conPointNodeRightGood' ){
        
        if( !intInfo ){ filter(); }



      } else if( type === 'backbone' || type === 'backboneTop' || type === 'appBodyNode' || type === 'service' || type === 'contract' ){
        
        if( !detailedInf ){ filter(); }
      
      } else if( type === 'spaghEdge' ){
        
        if( !badIntEdges || toggleBadGrid ){ filter(); }
        
      } else if( type === 'conPointNodeBad' || type === 'conPointNodeRightBad' ){
        
        if( !toggleBadGrid || !badIntEdges ){ filter(); }
        
      } else if( type === 'rightIntEdge' ){
        
        if( !toggleRightIntEdge ){ filter(); }
        
      }   
    });
  
  }); 
}

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
  reset();
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

$('#filterToggle').qtip({
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

  content: $('#filtersToggle')
});


}); // on dom ready

