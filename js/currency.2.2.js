//global variables
var lines = [];
var exchangeRate = 1.0;
var amount = 0.0;
var convertedTotal = 0.0;

//turn caching off for ajax data and use a polyfill for includes
$.ajaxSetup({ cache: false });

if (!String.prototype.includes) {
    String.prototype.includes = function() {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

function stringContainsCharacters(str) { 
	var containsChar = false
	for (var i=0; i < str.length; i++) {
		if( str.charCodeAt(i) > 32 ){
			return true;
		}
	}
	return false;
}

$(document).ready(function() {
	$(".ui-icon-circle-triangle-e").empty();
	$(".ui-icon-circle-triangle-w").empty();

    var csvContents = document.createElement('div');
    csvContents.id = 'csvContents';
    document.body.appendChild(csvContents);

	loadCSVList();
    //loadCSVList().done(processCSVList).done(loadCSV).done(populateDropDowns);
    $( "#monthPicker" ).datepicker();    
});


function PrintElem()
{
	var csvContents = $('#csvContents').clone();
	Popup($('<div/>').append(csvContents).html());
}

function Popup(data) 
{
	var dropdown = document.getElementById("csvDropdown");

    	var mywindow = window.open('', "IFPRI Exchange Rates", 'height=900, width=756');
    	mywindow.document.write('<html><head><title>IFPRI Exchange Rates:</title>');
    	mywindow.document.write('<link rel="stylesheet" href="http://currencyconverter.ifpri.org/css/print.css" type="text/css" />');
    	mywindow.document.write('</head><body >');
	
	var header = mywindow.document.createElement("h1");
	header.id = 'title';
	header.innerText = "IFPRI Exchange Rates";
	var dateDiv = mywindow.document.createElement("div");
	dateDiv.innerText = dropdown.options[dropdown.selectedIndex].text.replace("currency_", "").replace(".csv", "");
	header.appendChild(dateDiv);
	mywindow.document.body.appendChild(header);

    	mywindow.document.write(data);
	var script = mywindow.document.createElement('script');
	script.type = 'text/javascript';
	script.text = "var rows = document.getElementsByClassName('headerelement');for(i = 0; i < rows.length; i++){rows[i].style.width = '112px'};";
	script.text += "\nvar rows = document.getElementsByClassName('rowElement');for(i = 0; i < rows.length; i++){rows[i].style.width = '112px'};";
	script.text += "\nvar container = document.getElementById('csvContents'); container.style.width = '700px';";
	mywindow.document.body.appendChild(script);
    	mywindow.document.write('</body></html>');
	setTimeout(function(){mywindow.print();}, 500);
}


function loadCSVList(){
	//load file list from static code below
	(async () => {
        let htmlString = '<response>';
		htmlString += '<csv>currency_12.1.2020.csv</csv>';
        htmlString += '<csv>currency_11.1.2021.csv</csv>';
		htmlString += '<csv>currency_10.1.2021.csv</csv>';
		htmlString += '<csv>currency_9.1.2021.csv</csv>';
		htmlString += '<csv>currency_8.1.2021.csv</csv>';
		htmlString += '<csv>currency_7.1.2021.csv</csv>';
		htmlString += '<csv>currency_6.1.2021.csv</csv>';
		htmlString += '<csv>currency_5.1.2021.csv</csv>';
		htmlString += '<csv>currency_4.1.2021.csv</csv>';
		htmlString += '<csv>currency_3.1.2021.csv</csv>';
		htmlString += '<csv>currency_2.1.2021.csv</csv>';
		htmlString += '<csv>currency_1.1.2021.csv</csv>';
		htmlString += '</response>';	
		var xmlDoc = (new DOMParser()).parseFromString(htmlString, "text/xml");	
		var csvList = await processCSVList(xmlDoc);
		var load_csv = await loadCSV();
		//var popresutl = await populateDropDowns();
    })()
	
}

function processCSVList( data ) {	
	var x = document.getElementById("csvDropdown");

	var sorteddata = filterFileByDateOrder(data, 24);
	for(var i = 0; i < sorteddata.length; i++) {
		var fileName = sorteddata[i];
		if(stringContainsCharacters(fileName) ){
	       	var option = document.createElement("option");
	       	option.id = fileName;
	        option.text = fileName;
	        option.value = fileName;
	        x.add(option);
		}
    };
	document.getElementById("csvDropdown").selectedIndex = 0;
}

function filterFileByDateOrder (data, datacount) {
	var temp_data = data.childNodes[0].childNodes;	
	// gather date data for sorting from pattern of 'currency_8.1.2018.csv'
	var dateFileArray = [];//key:date (ex 201808), value:file name
	var datekey = '';
	var filename = '';
	var temp_array = [];
	for (var i=0; i< temp_data.length; i++){
	    filename = temp_data[i].textContent;
		 
        if(filename.length > 1){
			temp_array = [];
			temp_array = filename.split("_");
			var temp_str = ""+temp_array[1];
			temp_array = temp_str.split(".");
			var monthstring = '';
			if(temp_array.length > 0){
				monthstring = temp_array[0]+"";
				datekey = temp_array[2]+((monthstring.length == 1)? "0"+temp_array[0] : temp_array[0]);
				dateFileArray.push(datekey+"&"+filename);
            }
        }
	} 
	// sort dataFileArray desc
	dateFileArray.sort();
	dateFileArray.reverse();
	// return array with given count
	var sortedArray = [];
	for (var key in dateFileArray) {
		if (key < datacount) sortedArray.push(dateFileArray[key].split("&")[1]);
		else break;
	}
	//check output
	/*for (var key in sortedArray) {
		console.log("key " + key + " has value " + sortedArray[key]);
	}*/
	return sortedArray;
}

function checkPassword(){
	if( $('#fileInput').val().includes('.csv') ){
		var clientPassword = $('#passwordInput').val();
	    $.ajax({
	        type: "GET",
	        url: "password.json",
	        dataType: "text",
	        cache: false,
	        success: function(data) {
	           var serverPsswd = JSON.parse(data);
	           if(serverPsswd.key === clientPassword){
	        		document.forms["csvForm"].submit(); 
	        		setTimeout(loadCSV, 500);
	           }else{
	        	   alert("Incorrect Password!");
	           }
	        }
	    });
	}else{
		alert("File must be a .csv file");
	}
}

function loadCSV(){
	document.getElementById('csvContents').innerHTML = '';
	(async () => {
        const response = await fetch('https://raw.githubusercontent.com/IFPRI/CurrencyConverter/master/csv/' + document.getElementById("csvDropdown").value);
		const data = await response.text();
		var mdata = '';
		if(!data.startsWith("From")){
			mdata = "From,To,Foreign Currency Name,Rate,Date,time,\n" + data;
		}
		const pdata = await processData( mdata );
		const pseudo = await updateExchangeRate(null);
		const popresutl = await populateDropDowns();
		if(window.location.href == "http://currencyconverter.ifpri.org/")
			setWidth();
		
    })()
}

function fileSelected() {
    var file = document.getElementById('file-select').files[0];
    if (file) {
        document.getElementById('file-select').innerHTML = file.name;
    }
}

window.onresize = function(){
	setWidth();
}

function setWidth() {
    var w = $('#csvContents').width() / 6.1;
    $('.rowElement').width(Math.floor(w) + 'px');
    $('.headerElement').width(Math.floor(w) + 'px');
}

function processData(allText) {
	lines.length = 0;
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
	headers.clean();
    if(headers[0] != "From"){
    	var manualHeaders = ["From,To,Foreign Currency Name,Rate,Date,Time"];
        var combo = combineArrays(manualHeaders, allTextLines);
        allTextLines = combo;
    }

    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
		headers.length = 6;
		data.length = 6;
            var obj = new Object();
            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = data[j];
            }
            lines.push(obj);
    }
    displayData();
}

function combineArrays(arr1, arr2){
	for (var i = 0; i < arr2.length; i++){
				arr1.push(arr2[i]);
	}
	return arr1;
}

function populateDropDowns() {
    var fromValues = new Array();
    var toValues = new Array();
    var x = document.getElementById("selectFromCurrency");
    $(x).empty();
    var y = document.getElementById("selectToCurrency");
    $(y).empty()
    for (var i = 0; i < lines.length; i++) {
        if (fromValues.indexOf(lines[i].From) == -1) {
            fromValues.push(lines[i].From);
        }

        if (toValues.indexOf(lines[i].To) == -1) {
            toValues.push(lines[i].To);
        }
    }
    fromValues = fromValues.sort();
    toValues = toValues.sort();
    for (var i = 0; i < fromValues.length; i++) {
        var option = document.createElement("option");
        option.text = fromValues[i].replace(/^"(.*)"$/, '$1');
//if(fromValues[i]=='BDT')console.log('from['+fromValues[i]+']||'+option.text);
        option.value = fromValues[i];
        x.add(option);
    }
    for (var i = 0; i < toValues.length; i++) {
    	if(toValues[i] != undefined && toValues[i] != null){
	        var option = document.createElement("option");
	        option.text = toValues[i].replace(/^"(.*)"$/, '$1');
//if(toValues[i]=='BDT')console.log('to['+toValues[i]+']||'+option.text);
	        option.value = toValues[i];
	        y.add(option);
    	}
    }
    
    var option = document.createElement("option");
    option.text = "";
    option.value = "";
    x.add(option);
    
    var option = document.createElement("option");
    option.text = "";
    option.value = "";
    y.add(option);

    $(x).val("");
    $(y).val("");
}

function getDescription(acronym) {
    if (acronym == 'USD') {
        return 'United States Dollars'
    }

    for (var i = 0; i < lines.length; i++) {
        if (acronym == lines[i].From.replace(/^"(.*)"$/, '$1')) {
            return lines[i]['Foreign Currency Name'];
        }
    }
}

function updateExchangeRate(isFromField) {
    if (isFromField == true) {
        $('#selectToCurrency').val('USD');
    } else if (isFromField == false) {
        $('#selectFromCurrency').val('USD');
    } else {

    }

    fromVal = $('#selectFromCurrency').val();
    toVal = $('#selectToCurrency').val();
    $('#fromDesc').text(getDescription(fromVal));
    $('#toDesc').text(getDescription(toVal));
    if (fromVal != toVal) {
        var found = false;
        for (var i = 0; i < lines.length; i++) {
            if (fromVal == lines[i].From && toVal == lines[i].To) {
                found = true;
                exchangeRate = lines[i].Rate;
            }
        }

        if (found == true) {
            amount = parseFloat($('#amount').val());
            $('#exchangeRate').text(exchangeRate);
            convertedTotal = amount * exchangeRate;
            $('#convertedTotal').text(convertedTotal.toFixed(2));
        } else {
            //alert('exchange rate not found!\n An exchange rate between these currencies has not been entered!');
            $('#exchangeRate').text('');
            $('#convertedTotal').text('');
        }
    } else {
        amount = $('#amount').val();
        $('#exchangeRate').text(1.0);
        $('#convertedTotal').text(amount);
    }
}


function displayData() {
    var headerDiv = document.createElement('div');
    $('#csvContents').append(headerDiv);

    var keys = Object.keys(lines[0]);
    var headerDiv = document.createElement('div');
    headerDiv.className = 'row';
    for (var k = 0; k < keys.length; k++) {
        headerDiv.innerHTML += "<span class='headerElement'>" + keys[k] + "</span>";
    }
    $('#csvContents').append(headerDiv);

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var resultDiv = document.createElement('div');
        resultDiv.className = 'row';

        var vals = new Array();
        for(var key in line) {
		if(line[key] != undefined){
            		vals.push( line[key] );
		}
        }

        for (var k = 0; k < keys.length; k++) {
		if(vals[k] != undefined && vals[k] != ""){
            		resultDiv.innerHTML += "<span class='rowElement'>" + vals[k] + "</span>";
		}
        }
        $('#csvContents').append(resultDiv);
    }
}

function selectCSV() {
	loadCSV();
	//updateExchangeRate(null);
    //populateDropDowns();
}
