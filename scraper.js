var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var toCSV = require("array-to-csv");


var urls = [


'https://www.linkedin.com/company/j-samuels-signature-homes-inc-',
'https://www.linkedin.com/company/jsc-petrokazakhstan-kumkol-resources',
'https://www.linkedin.com/company/jtb-americas-ltd',
'https://www.linkedin.com/company/jtekt-corporation',
'https://www.linkedin.com/company/j-t-walker-industries-inc',
'https://www.linkedin.com/company/judson-isd',
'https://www.linkedin.com/company/jumbo-sports',
'https://www.linkedin.com/company/juniper-networks',
'https://www.linkedin.com/company/juniper-networks',
'https://www.linkedin.com/company/just-energy_2',
'https://www.linkedin.com/company/jv-industrial-companies-ltd.',
'https://www.linkedin.com/company/j-w-energy-company',
'https://www.linkedin.com/company/jwt'

];

var arr = [];
var counter = 1;


var currentURL;
function getURLs(urls, delay, processCallback, doneCallback) {
    var index = 0;
    var data = [];
    currentURL = urls[index];
    var inCounter = 0;
    function next() {
        if (index < urls.length) {
        	
            requestNext(urls[index++], function(err, response, html) {
                // need to decide what you want do for error handling here
                // continue? stop further processing?
                if(err) {
                	console.log(err);
                } else {
                	var dataIn = processCallback(err, response, html);
                	if (dataIn[0] === "Not Available" && inCounter < 10) {
                		urls[index--];
                		inCounter++;
                		console.log("Didn't work trying attempt #" + inCounter + "/10");
                		console.log(" ");
                	} else {
                		if(inCounter === 10) {
                			console.log("This URL failed 10 times - I'll push placeholder data");
                		}
                		data.push(dataIn);
		            	console.log("Pushed this data");
		            	console.log(" ");
		                counter++;
		                inCounter = 0;

                	}

         
                
                }
                
            }, delay, next);


        } else {
            doneCallback(null, data);
        }
    }
    next();
}

function requestNext(url, callback, delay, nextCallback) {
    var start = Date.now();
    request(url, function(error, response, html) {
        callback(error, response, html);
        var elapsed = Date.now() - start;
        var wait = Math.max(delay - elapsed, 0);
        // schedule next call to request()
        setTimeout(nextCallback, wait);
    });
}

function errorRequest(url) {

	request(url, function(err, response, html) {
		return processResult(err, response, html);
	}); 
}


function safeParse(json) {
    var parsed;
    try {
        parsed = JSON.parse(json);
    } catch (e) {
        parsed = undefined;
    }
return parsed;
}


function processResult(err, response, html) {
        
    	var inArr;
        
        var foo = JSON.stringify(html);

        var yo = foo;
        yo = yo.replace(/<!--/g, "");
        yo = yo.replace(/-->/g, "");
        yo = yo.replace(/\\/g, "");
        //console.log(yo);
        
		if (err) {
			console.log("Error!");

             do {
                	console.log("The right error! Retrying!");
                	errCounter++;
                	requestNext(urls);
                	}
                	while (errCounter < 4)
             return errArr;
		} else {

            
		var $ = cheerio.load(yo);
        
        var company, compId, numFollowers, hq, industry, size, website, type, obj; 


        $('#stream-promo-top-bar-embed-id-content').filter(function() {
            obj = $(this).text();
            obj = safeParse(obj);
        });
        
         if (typeof obj === "undefined") {
                console.log("parseError at url " + counter + "! Pushing scaffolding.")
                return ["parseError!","parseError!","parseError!","parseError!","parseError!","parseError!","parseError!","parseError!"];
            }
        


        inArr = [];   
        //COMPANY
        
        company = obj.companyName;
        if (typeof company != 'string') {
        	company = "Not Available";
        }
        console.log("Scraping " + company + ": URL #" + counter + " of " + urls.length);
        inArr.push(company);            

        //COMPANY ID
        
		compId = obj.companyId;
		if(typeof compId != 'number') {
			compId = "Not Available";
		}
		console.log(compId + " is the company ID!");
		inArr.push(compId);

		//NUMBER OF FOLLOWERS
		  
		numFollowers = obj.followerCount;
		if (typeof numFollowers != 'number') {
			numFollowers = 'Not Available';
		}
		console.log("This company has " + numFollowers + "!");
		inArr.push(numFollowers);


		//HEADQUARTERS ADDRESS
		if (typeof obj.headquarters === "undefined") {
            hq = undefined;
        } else {
		    hq = obj.headquarters.street1 + " " + obj.headquarters.street2 + " " + obj.headquarters.city + ", " + obj.headquarters.state + " " + obj.headquarters.country;
		}
        if(typeof hq != 'string') {
			hq = 'Not Available';
		}
		console.log("They're headquartered at " + hq);
		inArr.push(hq);

        //INDUSTRY
        industry = obj.industry;
     	if (typeof industry != 'string') {
        	industry = "Not Available"
        } 
        console.log(industry + " is industry!")      
        inArr.push(industry);
         
         //SIZE
         size = obj.size;
         	if (typeof size != 'string') {
            	size = "Not Available"
            }
            console.log(size + " is size!") ;            
            inArr.push(size);

         //WEBSITE   
         website = obj.website;
     	if (typeof website != 'string') {
        	website = "Not Available"
        } 
         console.log(website + " is website!")          
         inArr.push(website);

         //TYPE
        type = obj.companyType;
        if (typeof type != 'string') {
        	type = "Not Available"
        } 
        console.log(type + " is type!")                 
        inArr.push(type); 

        


         console.log(" ")
         return inArr;

    }
        
}

getURLs(urls, 5000, processResult, function(err, dataArray) {
   if (!err) {
        var csvContent = toCSV(dataArray);
		fs.writeFile('output.csv', csvContent, function(err){
			    console.log('File successfully written! - Check your project directory for the output');
	  	});
   }
});
