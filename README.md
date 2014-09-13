# NYC Property TaxMap

View the app live at [http://nyctaxmap.herokuapp.com](http://nyctaxmap.herokuapp.com)

A web map to explore NYC property tax bills.

This map allows you to visually explore NYC property tax bills at the taxlot level. Zoom in on an area, hover over a property for basic info, and click on a property for full info and a link to its latest tax bill. We started with Manhattan as a proof of concept, but the other boroughs will be live soon.

###About the data
We retreived over 40,000 individual PDF tax bills, extracted the Estimated Market Value, Assessed Value, Building Type, Tax Rate, and Annual Tax. These data were joined to MapPLUTO, an open dataset containing detailed geometries for NYC's properties, made available by the NYC Department of City Planning

Made by Chris Whong, Akil Harris, and Ameen Solemani at Code Across NYC, a civic hackathon hosted by BetaNYC, New York City's civic technology and open government vanguard.

###Caveats
The "Annual Tax" is as it appeared on the 11/23/2013 tax bill for each property. Additional discounts/exemptions/abatements may apply. The developers make no claim as to the accuracy of the data contained herein. Users shoud verify all information from a reliable source.

Condo units each receive an individual bill. Condo buildings are shaded in blue and do not have building-level tax bills. We hope to incorporate condo bills in the future

###Special Thanks to
Steve Romalewski, Jessie Braden, Max Weselcouch, Tom Swanson, Ariel Kennan, Brice Lin, Abby Bouchon, Fahad Quraishi, and James Ber. Support Open Data!
