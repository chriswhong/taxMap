Getting Property Tax Data into MongoDB

-Use PLUTO to generate a CSV of billing BBLs
-Use CondoFinder.rb to generate a list of condoBBLs based on the billingBBls (based on NYC PAD file)
-Use getPDFs.rb to get the November 2013 tax bill as PDF for all billingBBLs
-Use getPDFs.rb to get the November 2013 tax bill as PDF for all condoBBLs
-Use pdfScrape.rb to scrape data from billingBBL PDFs
-Use pdfScrape.rb to scrape data from condoBBL PDFs

Setting up MongoDB

-Export MapPLUTO as GeoJSON with lat/lon
-Use import.js to load Plutodata into MongoDB
-Use mergeBillingBBLs.js to append our tax data to each billingBBL in Mongo

TODO: Write mergeCondoBBLs.js to append condo tax data to corresponding billingBBL in Mongo

Mongo Schema:
```json
{
	geometry:,
	plutodata:{}; //Pluto Data
	billingbbl:xxxxxxxxxx,
	ownerName:Joe Schmoe,
	propertyAddress:,
	taxClass:,
	years:[
			{
				taxYear:1314,
				estimatedMarketValue:,
				assessedValue:,
				taxRate:,
				taxBefore:,
				annualTax:,
				condoUnits:[
					{
						condobbl:,
						estimatedMarketValue:,
						assessedValue:,
						taxRate:,
						taxBefore:,
						annualTax:
					}

				]
			}
	]
}
```
