require 'rubygems'
require 'csv'
require 'net/http'
require 'open-uri'


CSV.foreach("107condobbls.csv", :headers => true) do |csvRow|

	bbl = csvRow[0]
	puts "Working on BBL " + bbl

	File.open(bbl + '.pdf', "wb") do |file|
  		file.write open('http://nycprop.nyc.gov/nycproperty/StatementSearch?bbl=' + bbl + '&stmtDate=20131122&stmtType=SOA').read
	end

	#http://nycprop.nyc.gov/nycproperty/StatementSearch?bbl=1018720001&stmtDate=20131122&stmtType=SOA

	
end



