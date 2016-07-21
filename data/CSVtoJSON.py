import csv
import json

csvfile = open('CSVData.csv', 'r')
jsonfile = open('pyFormatedData.json', 'w')

fieldnames = ("id","Strength","CompanyType","Company Domain Name","City","NodeType","CompanyRelationIntegratedAt","CompanyRelationAppTeamAt","Country","WebsiteURL","AnnRevenue","closeDate")
reader = csv.DictReader( csvfile, fieldnames)

jsonfile.write('{\n "elements":  {\n  "nodes": [')
next(reader) #Skip first line containing fieldnames
row1 = next(reader)


#Print the first element 
jsonfile.write('\n   {')
jsonfile.write('\n    "data": {')
jsonfile.write('\n     "id": "'+row1["id"]+'",')
jsonfile.write('\n     "Strength": '+row1["Strength"]+',')
jsonfile.write('\n     "CompanyType": "'+row1["CompanyType"]+'",')
jsonfile.write('\n     "Company Domain Name": "'+row1["Company Domain Name"]+'",')
jsonfile.write('\n     "City": "'+row1["City"]+'",')
jsonfile.write('\n     "NodeType": "'+row1["NodeType"]+'",')	
if row1["CompanyRelationIntegratedAt"]:
	jsonfile.write('\n     "CompanyRelationIntegratedAt": '+row1["CompanyRelationIntegratedAt"]+',')
if row1["CompanyRelationAppTeamAt"]:
	jsonfile.write('\n     "CompanyRelationAppTeamAt": '+row1["CompanyRelationAppTeamAt"]+',')	
jsonfile.write('\n     "Country": "'+row1["Country"]+'",')
jsonfile.write('\n     "WebsiteURL": "'+row1["WebsiteURL"]+'",')
jsonfile.write('\n     "AnnRevenue": '+row1["AnnRevenue"]+',')	
jsonfile.write('\n     "closeDate": "'+row1["closeDate"]+'"')	
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

#print rest of the elements
for row in reader:

	jsonfile.write(',\n   {')

	jsonfile.write('\n    "data": {')
	jsonfile.write('\n     "id": "'+row["id"]+'",')
	jsonfile.write('\n     "Strength": '+row["Strength"]+',')
	jsonfile.write('\n     "CompanyType": "'+row["CompanyType"]+'",')
	jsonfile.write('\n     "Company Domain Name": "'+row["Company Domain Name"]+'",')
	jsonfile.write('\n     "City": "'+row["City"]+'",')
	jsonfile.write('\n     "NodeType": "'+row["NodeType"]+'",')	
	if row["CompanyRelationIntegratedAt"]:
		jsonfile.write('\n     "CompanyRelationIntegratedAt": '+row["CompanyRelationIntegratedAt"]+',')
	if row["CompanyRelationAppTeamAt"]:
		jsonfile.write('\n     "CompanyRelationAppTeamAt": '+row["CompanyRelationAppTeamAt"]+',')
	jsonfile.write('\n     "Country": "'+row["Country"]+'",')
	jsonfile.write('\n     "WebsiteURL": "'+row["WebsiteURL"]+'",')
	jsonfile.write('\n     "AnnRevenue": '+row["AnnRevenue"]+',')	
	jsonfile.write('\n     "closeDate": "'+row["closeDate"]+'"')		
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