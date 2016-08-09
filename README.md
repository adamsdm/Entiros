# Entiros Company View
<a href=#Install+localy> Instal Localy </a>

##Install localy
1. Navigate to local repo
2. Start php-server ( https://gist.github.com/willurd/5720255 )
3. Navigate to localhost:#PORT_NUMBER


###Company View
When adding data to company view, the data should be in well-formatted .JSON. It is important that all entries are seperated by a ',' except the lasat entry.

1. Update the URL to the data-file in demo.js (line 11).
2. When the data is read for the first time all node positions is set to {x: 0, y:0}, run `positionAlgorithm()`.
3. There is also no connections between the nodes, run `addEdges()` (demo.js:420-421)
4. Save the data by pressing the save button, copy the generated .JSON code and update the datafile with the new code.

####data.json 
```JSON
{
  "elements": {
    "nodes": [
      {
        "data": {
          "id": "1",
          "Strength": 5,
          "CompanyType": "Clothing",
          "Company Domain Name": "google.com",
          "City": "Stockholm",
          "NodeType": "Customer",
          "CompanyRelationIntegratedAt": [
            51,
            52,
            53,
            54,
            55
          ],
          "Country": "Sweden",
          "WebsiteURL": "google.com",
          "AnnRevenue": 306510829,
          "closeDate": "2014-11-08",
          "orgPos": {
            "x": 1412.4589412014768,
            "y": 709.4778904363234
          }
        },
        "position": {
          "x": 1412.4589412014768,
          "y": 709.4778904363234
        },
        "group": "nodes",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      { //Next data entry
      }
    ] // nodes end 
  } // elements end
}
```

###Application View
To add data to the Application View is more simple.
Just add the data to the `data.json` file in well formatted JSON format.
The script will then automatically position the nodes and add an option in the select-company dropdown menu

####data.json 
```JSON
[
  {
    "id": "Gant",
    "type":"Customer",
    "Applications": ["En applikation","En annan applikation med ett långt namn","Appen","En till","och en sista"],
    "edges":[
      {"source":"En applikation", "target":"En annan applikation med ett långt namn"},
      {"source":"En applikation", "target":"Appen"},
      {"source":"En annan applikation med ett långt namn", "target":"En till"},
      {"source":"En annan applikation med ett långt namn", "target":"och en sista"}
    ]
  },
  {
    //Next entry
  }
]
```
