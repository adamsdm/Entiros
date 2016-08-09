# Entiros Company View

1. Navigate to local repo
2. Start php-server ( https://gist.github.com/willurd/5720255 )
3. Navigate to localhost:#PORT_NUMBER


##Company View
When adding data to company view, the data should be in well-formatted .JSON.
1. Update the URL to the data-file in demo.js (line 11).
2. When the data is read for the first time all node positions is set to {x: 0, y:0}, run positionAlgorithm().
3. There is also no connections between the nodes, run addEdges() (demo.js:420-421)
4. Save the data by pressing the save button, copy the generated .JSON code and update the datafile with the new code.


