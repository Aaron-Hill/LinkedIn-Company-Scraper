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

function rmLineBreaks(text) {
	text.trim();
}

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

function processResult(err, response, html) {
    	var inArr;
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

		var $ = cheerio.load(html);
        
        var company, compId, numFollowers, hq, industry, size, website, type; 

        inArr = [];   
        //COMPANY
        $('div .image-wrapper img').filter(function(){
            company = $(this);
            company = company.attr('alt');
            if (typeof company != 'string') {
            	company = "Not Available";
            }
            console.log("Scraping " + company + ": URL #" + counter + " of " + urls.length);
            inArr.push(company);            
       })


        //COMPANY ID
        $('.follow-content .public-follow').filter(function() {
        	var cut;
			compId = $(this).attr('href');
			compId = compId.substring(88, 98);
			cut = compId.indexOf("%")
			compId = compId.substring(0, cut);
		})
			if(typeof compId != 'string') {
				compId = "Not Available";
			}
			console.log(compId + " is the company ID!");
			inArr.push(compId);

		//NUMBER OF FOLLOWERS
		$('.follow-content .followers-count:nth-child(1)').filter(function() {
			numFollowers = $(this).text();
		})
			if (typeof numFollowers != 'string') {
				numFollowers = 'Not Available';
			}
			console.log("This company has " + numFollowers + "!");
			inArr.push(numFollowers);

		//HEADQUARTERS ADDRESS
		$('.adr').filter(function() {
			hq = $(this).text();
			hq = hq.replace(/(\r\n|\n|\r)/gm," ");
		});
			if(typeof hq != 'string') {
				hq = 'Not Available';
			}
			console.log("They're headquartered at " + hq);
			inArr.push(hq);

        //INDUSTRY
         $('.industry p').filter(function(){
             industry = $(this);
             industry = industry.text();   
        })
         	if (typeof industry != 'string') {
            	industry = "Not Available"
            } 
            console.log(industry + " is industry!")      
            inArr.push(industry);
         
         //SIZE
         $('.company-size p').filter(function(){
             size = $(this);
             size = size.text(); 
             size = size.replace(/(\r\n|\n|\r)/gm,"");
        })
         	if (typeof size != 'string') {
            	size = "Not Available"
            }
            console.log(size + " is size!") ;            
            inArr.push(size);

         //WEBSITE   
         $('.website p a').filter(function(){
         	 website = $(this);
         	 website = website.text();
        })
         	if (typeof website != 'string') {
            	website = "Not Available"
            } 
             console.log(website + " is website!")          
             inArr.push(website);

         //TYPE
         $('.type p').filter(function(){
             type = $(this);
             type = type.text();
             type = type.replace(/(\r\n|\n|\r)/gm,"");
        })
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
