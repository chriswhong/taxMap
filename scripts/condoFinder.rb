require 'rubygems'
require 'csv'




output = File.new("output2.csv","a")
output.print("condobbl")
output.print(",")
output.print("billbbl")
output.print("\n")


CSV.foreach("ManhattanCondoPad.csv",{:headers=>:first_row}) do |row,i|

	

	if row[2]==row[14]
		puts "Match"
	##if 2 matches 14, do nothing, else create new range of BBLs
	else 
		loLot = row[2]
		hiLot = row[6]
		puts "No Match, creating new bbls from range " + loLot + " through " + hiLot
		billBbl = row[15]
		bb = row[15][0..-5].to_s
		range = hiLot.to_i-loLot.to_i+1

		lot = loLot.to_i;

		range.times do
			puts  bb + lot.to_s
			output.print(bb + lot.to_s)
			output.print(",")
			output.print(billBbl)
			output.print("\n")
			lot = lot + 1
		end
		

	end

end



