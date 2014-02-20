require 'pdf/reader'

output = File.new("output.csv","w")
output.print("bbl,ownerName,propertyAddress,taxClass,estimatedValue,assesedValue,taxRate,taxBefore,annualTax\n")


Dir.glob("*.pdf") do |thisPdf| #loop through pdfs in this directory
	
	bbl = thisPdf
	puts bbl.split('.')[0]

	puts "working on #{thisPdf}..."
	
	output.print("#{thisPdf}," )

	reader = PDF::Reader.new(thisPdf)


	reader.pages.each do |page|
		rawText = page.text

		if rawText.include? 'Owner name'
			t = rawText.split('Owner name:')[1][0...40].strip!  
			puts "Owner Name: " + t
			output.print('"' + t + '",')

			t = rawText.split('Property address:')[1][0...20].strip!  
			puts "Property Address: " + t
			output.print(t + ',')

		end

		if rawText.include? 'How We'
			t = rawText.split('Tax class')[1][0...40].strip!  
			puts "Tax Class: " + t
			output.print('"' + t + '",')

			if rawText.include? 'Estimated market value'
				t = rawText.split('Estimated market value')[1][0...40].strip!  
				t = t.gsub(/\D/, '')
				puts "Estimated market value: " + t.to_s()
				output.print(t.to_s() + ',')
			
				t = rawText.split('Tax before exemptions and abatements')[1][0...80].strip!  
				assessedValue = t.split('X')[0].gsub(/\D/, '')
				puts "Billable Assessed Value: " + assessedValue
				output.print(assessedValue + ',')

				taxRate = t.split('X')[1].split('=')[0].strip!
				puts "Tax Rate: " + taxRate
				output.print(taxRate + ',')

				taxBefore = t.split("=")[1].gsub(/\D/, '')
				puts "Tax before exemptions and abatements: " + taxBefore
				output.print(taxBefore + ',')

			else
				output.print(',,,,')
			end

			t = rawText.split('Annual property tax')[1][0...98].gsub(/\D/, '') 
			puts "Annual Property Tax: " + t
			output.print(t)

		end
	end


	output.print("\n")
	puts "" #blank line in terminal after each pdf

end


