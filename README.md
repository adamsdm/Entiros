# Entiros Company View
* <a href=#install-localy> Install Localy </a>
* <a href=#company-view> Company View </a>
* <a href=#application-view> Application View </a>
* <a href=#update-data> Update data </a>



##Install localy
1. Navigate to local repo
2. Start php-server ( https://gist.github.com/willurd/5720255 )
3. Navigate to localhost:#PORT_NUMBER


###Company View
When adding data to company view, the data should be in well-formatted .JSON. It is important that all entries are seperated by a ',' except the last entry.

1. Update the URL to the data-file in demo.js (line 11).
2. When the data is read for the first time all node positions is set to {x: 0, y:0}, run `positionAlgorithm()`.
3. There is also no connections between the nodes, run `addEdges()` (demo.js:420-421)
4. Save the data by pressing the save button, copy the generated .JSON code and update the datafile with the new code.

####Update data
Here are the steps to update the input data for the company view:

1. Download the CSV file containing the correct fields from hubspot
2. Run HubspotCSVtoJSON.py script to convert the CSV file to a JSON file that cytoscape can interpret
3. Make sure that the input-, output-file in the python-script are correct
4. Make sure that the output data has the same pattern/variables as <a href=#data.json> the template </a>
5. Chose the [output].json file generated by the pythonscript as inputfile in demo.js (set path at top of the script)
6. Now open up the webpage, all the nodes will be centered. Click the icon in the top right corner with a dot icon. This will run the positioning algorithm, aswell as add edges between nodes. A new tab should open up containing the new JSON data, containing the same data + the node position aswell as the generated edges between the nodes.
7. Overwrite the old input .JSON file with the new generated .JSON file in the newly opened tab.
8. Done!

####data.json
<bAfter positioning algorithm</b>
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
