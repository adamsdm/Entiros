$(function(){ // on dom ready

var noExpe = 0;
var noProc = 0;
var noSyst = 0;
var noApps = 0;

var layoutDuration = 500;

var cy;

var theLayout = {
    name: 'preset',
    padding: 50,
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
    var rightNode = node.connectedEdges('edge[type="rightIntEdge"]').connectedNodes('node[type="conPointNodeRightGood"]');
        rightNode = rightNode.add( rightNode.connectedEdges() );


    console.log(conNodes);


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

      rightNode.animate({
        style: {'background-color':'red', 'opacity':'1,0', }
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
    cy.edges('edge[type="rightIntEdge"]').animate({
      style: { 'opacity' : '0.2' }
    }, {
      duration: layoutDuration
    });

    cy.nodes('node[type="app"]').animate({
      style: {'width':'40px','height':'40px' }
    }, {
      duration: layoutDuration
    });

    cy.nodes('node[type="conPointNodeRightGood"]').animate({
      style: { 'background-color':'black' }
    }, {
      duration: layoutDuration
    });
    

    hideNodeInfo();
  });

  cy.on('mouseover', 'node[type="app"]', function(e){
    var node = this;
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

var addApp = function(_appId){

  noApps++;
  var position={ x: noApps*60, y: 200 };
  if(position.x > cy.$('#aEnd').position().x-60){
    cy.$('#aEnd').position().x += 60;
    cy.$('#bEnd').position().x += 60;
    cy.$('#cEnd').position().x += 60;
  }

  cy.add({
    group: "nodes",
    data: { id: _appId, type: 'app' },
    position: position
  });
  
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
  addApp('App'+noApps);
})

$('#addProcess').on('click', function(){
  addProcess();
})
$('#debug').on('click', function(){
  // readData(graphP.responseJSON[0]);
  // cy.layout(theLayout);
})

$('#clear').on('click', function(){
  reset();
})










function showNodeInfo( node ){
  $('#info').html( infoTemplate( node.data() ) ).show();
}

function hideNodeInfo(){
  $('#info').hide();
}

function reset(){

  cy.remove( cy.elements("node[type != 'eShape'][type != 'eShapeCorner']") );
  cy.$('#aEnd').position().x = 200;
  cy.$('#bEnd').position().x = 175;
  cy.$('#cEnd').position().x = 200;

  cy.$("#bEnd").style({
    'height': 30
  })

  //middle bar width
  cy.$("#EmidBar").style({ 
      'width': 30
  })

  //move top bar to initial position
  cy.$('#a').position().y = 0;
  cy.$('#aEnd').position().y = 0;

  //move middle bar to initial position
  cy.$('#b').position().y=60;
  cy.$('#bEnd').position().y=60;

  noApps = 0;
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
  reset();

  //Add application nodes
  for(var i=0; i<data.Applications.length; i++){
    addApp(String(data.Applications[i]));
  }

  //Add application connections
  //for each edge
  for(var i=0; i<data.edges.length; i++){

    var dataSource = data.edges[i].source;
    var dataTarget = data.edges[i].target;

    var sourceConPosX = cy.$("[id='"+String(dataSource)+"']").position().x;
    var targetConPosX = cy.$("[id='"+String(dataTarget)+"']").position().x;

    //Connection points
    incMidBarWidth();
    cy.add([

      //Middle bar nodes, edges
      { group: "nodes", data: { type: 'conPointNodeGood', id:'sConP'+i}, position: {x: sourceConPosX, y: 60-i*15 }, selectable: false, locked: true },
      { group: "nodes", data: { type: 'conPointNodeGood', id:'tConP'+i}, position: {x: targetConPosX, y: 60-i*15 }, selectable: false, locked: true },
      { group: "edges", data: { source: dataSource, target: 'sConP'+i, type: 'goodIntEdge' } },
      { group: "edges", data: { source: 'sConP'+i, target: 'tConP'+i, type: 'goodIntEdge' } },
      { group: "edges", data: { source: 'tConP'+i, target: dataTarget, type: 'goodIntEdge' } },
      
      

      //Edges below, bad edges
      { group: "edges", data: { source: dataSource, target: dataTarget, type: 'spaghEdge' } },

      { group: "nodes", data: { type: 'conPointNodeBad', id:'sBadConP'+i}, position: {x: sourceConPosX, y: 400+i*15 }, selectable: false, locked: true, classes: 'filtered' },
      { group: "nodes", data: { type: 'conPointNodeBad', id:'tBadConP'+i}, position: {x: targetConPosX, y: 400+i*15 }, selectable: false, locked: true, classes: 'filtered' },
      { group: "edges", data: { source: dataSource, target: 'sBadConP'+i, type: 'straightSpaghEdge' } },
      { group: "edges", data: { source: 'sBadConP'+i, target: 'tBadConP'+i, type: 'straightSpaghEdge' } },
      { group: "edges", data: { source: 'tBadConP'+i, target: dataTarget, type: 'straightSpaghEdge' } },  
    
    ]);

    //Right side integration list
    cy.add([
      //Good
      { group: "nodes", data: { type: 'conPointNodeRightGood', id:'intConPGood'+i, label: data.edges[i].source+' -> '+data.edges[i].target }, 
        position: { x: cy.$('#aEnd').position().x + 10, y: cy.$("#sConP"+String(i) ).position().y } }, //Connection point

      { group: "edges", data: { source: data.edges[i].source, target: 'intConPGood'+i, type: 'rightIntEdge' }, classes: 'filtered' },            //int edge source->conP
      { group: "edges", data: { source: 'intConPGood'+i, target: data.edges[i].target, type: 'rightIntEdge' }, classes: 'filtered' },             //int edge source->conP  

      //Bad
      { group: "nodes", data: { type: 'conPointNodeRightBad', id:'intConPBad'+i, label: data.edges[i].source+' -> '+data.edges[i].target }, classes: 'filtered', 
        position: { x: cy.$('#aEnd').position().x + 10, y: cy.$("#sBadConP"+String(i) ).position().y } }, //Connection point

      { group: "edges", data: { source: data.edges[i].source, target: 'intConPBad'+i, type: 'rightIntEdge' }, classes: 'filtered'  },            //int edge source->conP
      { group: "edges", data: { source: 'intConPBad'+i, target: data.edges[i].target, type: 'rightIntEdge' }, classes: 'filtered'  },             //int edge source->conP     
    ]);  
}


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
function incMidBarWidth(){
  var currH = parseInt( cy.$("#bEnd").style().height );
  var stepSize=15;
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

  cy.layout(theLayout);
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
  cy.elements().unselect();

  n.select();
  console.log(n.selected());
  showNodeInfo( n );
});

$('#filters').on('click', 'input', function(){
    
  var badIntEdges = $('#badIntEdges').is(':checked');
  var goodIntEdges = $('#goodIntEdges').is(':checked');
  var intInfo = $('#intInfo').is(':checked');
  var toggleBadGrid = $('#toggleBadGrid').is(':checked');
  var toggleRightIntEdge = $('#toggleRightIntEdge').is(':checked');

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




      } else if( type === 'spaghEdge' ){
        
        if( !badIntEdges || toggleBadGrid ){ filter(); }
        
      } else if( type === 'conPointNodeBad' || type === 'conPointNodeRightBad' ){
        
        if( !toggleBadGrid || !badIntEdges ){ filter(); }
        
      } else if( type === 'rightIntEdge' ){
        
        if( !toggleRightIntEdge ){ filter(); }
        
      }  
    });
    // cy.nodes().forEach(function( n ){
    //   var type = n.data('NodeType');
    //   var CompanyType = n.data('CompanyType');

    //   n.removeClass('filtered');
      
    //   var filter = function(){
    //     n.addClass('filtered');
    //   };

    //   if( type === 'Customer' ){
        
    //     if( !cust ){ filter(); }
        
    //   } else if( type === 'Evangelist' ){
        
    //     if( !evan ){ filter(); }
        
    //   } else if( type === 'Subscriber' ){
        
    //     if( !subs ){ filter(); }
        
    //   } else if( type === 'Lead' ){
        
    //     if( !lead ){ filter(); }
        
    //   } else if( type === 'Marketing Qualified Lead' ){
        
    //     if( !markQualLead ){ filter(); }
        
    //   } else if( type === 'Sales Qualified Lead' ){
        
    //     if( !saleQualLead ){ filter(); }
        
    //   } else if( type === 'Prospect' ){
        
    //     if( !prosp ){ filter(); }
    //   }






    //   if( CompanyType === 'Clothing' ){
        
    //     if( !cloth ){ filter(); }
        
    //   } else if( CompanyType === 'Cars' ){
        
    //     if( !cars ){ filter(); }
        
    //   } else if( CompanyType === 'Food' ){
        
    //     if( !food ){ filter(); }
        
    //   } else if( CompanyType === 'Electronics' ){
        
    //     if( !elect ){ filter(); }
        
    //   } else if( CompanyType === 'Candy' ){
        
    //     if( !candy ){ filter(); }
        
    //   }   
    // });
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


}); // on dom ready













