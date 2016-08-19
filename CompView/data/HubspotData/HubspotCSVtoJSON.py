import csv
import json

csvfile = open('hubspotCSV.csv', 'r')
jsonfile = open('RESULT.json', 'w')

fieldnames = ("Name","City","Lifecycle Stage","Type","Company Relation - Integrated at","Company Relation - App team at","Company Relation - Related to","HubSpot Owner","Country","Website URL","Close Date","Industry")



reader = csv.DictReader( csvfile, fieldnames)

jsonfile.write('{\n "elements":  {\n  "nodes": [')
next(reader) #Skip first line containing fieldnames
row1 = next(reader)
i=1

#Print the first element 
jsonfile.write('\n   {')
jsonfile.write('\n    "data": {')
jsonfile.write('\n     "id": "'+row1["Name"]+'",')
jsonfile.write('\n     "CompanyType": "JORDBRUK, SKOGSBRUK OCH FISKE",')												#Missing data
jsonfile.write('\n     "Company Domain Name": "'+row1["Website URL"]+'",')
jsonfile.write('\n     "City": "'+row1["City"]+'",')
jsonfile.write('\n     "NodeType": "'+row1["Type"]+'",')	
jsonfile.write('\n     "LifecycleStage": "'+row1["Lifecycle Stage"]+'",')	
if row1["Company Relation - Integrated at"]:
	jsonfile.write('\n     "CompanyRelationIntegratedAt": "['+row1["Company Relation - Integrated at"]+']",')
if row1["Company Relation - App team at"]:
	jsonfile.write('\n     "CompanyRelationAppTeamAt": "['+row1["Company Relation - App team at"]+'"],')
if row1["Company Relation - Related to"]:
	jsonfile.write('\n     "CompanyRelationRelatedTo": "['+row1["Company Relation - Related to"]+'"],')
jsonfile.write('\n     "hasApplication": [400],')																		#Missing data
jsonfile.write('\n     "Owner": "'+row1["HubSpot Owner"]+'",')
jsonfile.write('\n     "Country": "'+row1["Country"]+'",')
jsonfile.write('\n     "WebsiteURL": "'+row1["Website URL"]+'",')
jsonfile.write('\n     "AnnRevenue": 13000000000,')																		#Missing data
jsonfile.write('\n     "closeDate": "'+row1["Close Date"]+'"')	
jsonfile.write('\n    },')
jsonfile.write('\n    "position": {')
jsonfile.write('\n    },')
jsonfile.write('\n    "group": "nodes",')
jsonfile.write('\n    "removed": false,')
jsonfile.write('\n    "selected": false,')
jsonfile.write('\n    "selectable": true,')
jsonfile.write('\n    "locked": false,')
jsonfile.write('\n    "grabbable": true,')
jsonfile.write('\n    "classes": ""')
jsonfile.write('\n   }')

# #print rest of the elements
for row in reader:
	i=i+1
	jsonfile.write(',\n   {')
	jsonfile.write('\n    "data": {')
	jsonfile.write('\n     "id": "'+row["Name"]+'",')
	jsonfile.write('\n     "CompanyType": "JORDBRUK, SKOGSBRUK OCH FISKE",')												#Missing data
	jsonfile.write('\n     "Company Domain Name": "'+row["Website URL"]+'",')
	jsonfile.write('\n     "City": "'+row["City"]+'",')
	jsonfile.write('\n     "NodeType": "'+row["Type"]+'",')	
	jsonfile.write('\n     "LifecycleStage": "'+row["Lifecycle Stage"]+'",')	
	if row1["Company Relation - Integrated at"]:
		jsonfile.write('\n     "CompanyRelationIntegratedAt": "['+row["Company Relation - Integrated at"]+']",') 			#Missing data
	if row1["Company Relation - App team at"]:
		jsonfile.write('\n     "CompanyRelationAppTeamAt": "['+row["Company Relation - App team at"]+'"],')					#Missing data
	if row1["Company Relation - Related to"]:
		jsonfile.write('\n     "CompanyRelationRelatedTo": "['+row["Company Relation - Related to"]+'"],')					#Missing data
	jsonfile.write('\n     "hasApplication": [400],')																		#Missing data
	jsonfile.write('\n     "Owner": "'+row["HubSpot Owner"]+'",')
	jsonfile.write('\n     "Country": "'+row["Country"]+'",')
	jsonfile.write('\n     "WebsiteURL": "'+row["Website URL"]+'",')
	jsonfile.write('\n     "AnnRevenue": 13000000000,')																		#Missing data
	jsonfile.write('\n     "closeDate": "'+row["Close Date"]+'"')	
	jsonfile.write('\n    },')
	jsonfile.write('\n    "position": {')
	jsonfile.write('\n    },')
	jsonfile.write('\n    "group": "nodes",')
	jsonfile.write('\n    "removed": false,')
	jsonfile.write('\n    "selected": false,')
	jsonfile.write('\n    "selectable": true,')
	jsonfile.write('\n    "locked": false,')
	jsonfile.write('\n    "grabbable": true,')
	jsonfile.write('\n    "classes": ""')
	jsonfile.write('\n   }')

jsonfile.write("\n  ]")
jsonfile.write("\n }")
jsonfile.write("\n}")