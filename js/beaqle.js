/*
    BeaqleJS - HTML5 and JavaScript framework for listening tests
    Copyright (C) 2011-2014  Sebastian Kraft

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>
*/


// ###################################################################
// Audio pool object. Creates and manages a set of <audio> tags.

    // constructor
    var AudioPool = function (PoolID) {
        this.NumPlayers = 0;
        this.NumUsed = 0;
        this.LoopAudio = 0;
        this.ABPos = [0, 100];
        this.PoolID = PoolID;
    }

    // insert audio pool into DOM
    AudioPool.prototype.register = function() {
        $('<div id="'+this.PoolID+'"></div>').appendTo('body');
    }

    // callback for timeUpdate event
    AudioPool.prototype.loopCallback = function(e) {
        var progress = e.target.currentTime / e.target.duration * 100;
                
        if (progress > this.ABPos[1]) {
            if (this.LoopAudio == true)
                e.target.currentTime = this.ABPos[0] / 100 * e.target.duration;
            else
                e.target.pause();
        }
    }

    // callback for audioEnd event
    AudioPool.prototype.audioEndCallback = function(e) {
            if (this.LoopAudio==true) {
                e.target.currentTime = this.ABPos[0] / 100 * e.target.duration;
                e.target.play();
            }
    }


    // ---------------------------------------------------------
    // overwrite these callbacks events after instantiation

    // callback for time update event
    AudioPool.prototype.onTimeUpdate = function(e) {}    
    
    // callback for error event
    AudioPool.prototype.onError = function(e) {}
    
    // callback for error event
    AudioPool.prototype.onDataLoaded = function(e) {}
    // ---------------------------------------------------------


    // clear all files
    AudioPool.prototype.clear = function(){
        this.NumUsed = 0;
    }
    
    // add new file to pool
    AudioPool.prototype.addAudio = function(path, ID){
    
        if (this.NumPlayers<=this.NumUsed) {
            $('<audio id="" src="" preload="auto" class="audiotags"></audio>').appendTo('#'+this.PoolID); 
            this.NumPlayers++;
        }

        $('#'+this.PoolID+' > .audiotags').eq(this.NumUsed).attr('src', path);
        $('#'+this.PoolID+' > .audiotags').eq(this.NumUsed).attr('id', "audio"+ID);
        
        $('#'+this.PoolID+' > .audiotags').eq(this.NumUsed).off();

        // internal event handlers
        $('#'+this.PoolID+' > .audiotags').eq(this.NumUsed).on("timeupdate", $.proxy(this.loopCallback, this));
        $('#'+this.PoolID+' > .audiotags').eq(this.NumUsed).on('ended', $.proxy(this.audioEndCallback, this));
        
        // external event handlers
        $('#'+this.PoolID+' > .audiotags').eq(this.NumUsed).on("timeupdate", this.onTimeUpdate);
        $('#'+this.PoolID+' > .audiotags').eq(this.NumUsed).on("loadeddata", this.onDataLoaded);
        $('#'+this.PoolID+' > .audiotags').eq(this.NumUsed).on("error", this.onError);
        
        this.NumUsed++;		
    }
    
    // play audio with specified ID
    AudioPool.prototype.play = function(ID){
        var audiotag = $('#'+this.PoolID+' > #audio'+ID).get(0);
        
        audiotag.currentTime = this.ABPos[0] / 100 * audiotag.duration;
                
        audiotag.play();
    }
    
    // pause all audios
    AudioPool.prototype.pause = function() {
        var audioTags = document.body.getElementsByTagName("audio");    
        for (var i = 0; i<audioTags.length; i++) { 
            audioTags[i].pause();
        }
    }

    // set volume of <audio> tags
    AudioPool.prototype.setVolume = function(vol) {
        var vol = $('#VolumeSlider').slider('option', 'value') / 100;
        
        var audioTags = $('#'+this.PoolID+' > audio');    
        for (var i = 0; i<audioTags.length; i++) { 
            audioTags[i].volume = vol;
        }
    }
    
    // set loop mode
    AudioPool.prototype.setLooped = function(loop) {
            this.LoopAudio = loop;
    }
    
    // toggle loop mode
    AudioPool.prototype.toggleLooped = function() {
        this.LoopAudio = !this.LoopAudio;
    }


// ###################################################################
// some helper functions

// logarithm to base 10
function log10(val) {
    return Math.log(val) / Math.log(10);
}

// check for Internet Explorer version
function clientIsIE() {
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ //test for MSIE x.x;
        var ieversion=new Number(RegExp.$1) // capture x.x portion and store as a number
        return ieversion;
    }
    return 0;
}


// ###################################################################
// Listening test main object


    // ###################################################################
    // constructor and initialization
    var ListeningTest = function (TestData) {

        if (arguments.length == 0) return;

        // check if config file is valid
        if (typeof(TestData) == 'undefined') {
            alert('Config file could not be loaded!');
        }

        // check for IE as it does not support .wav in <audio> tags
        // if (clientIsIE()) {
        //    alert('Internet Explorer is not supported! Please use Firefox, Opera, Google Chrome or any other HTML5 capable browser.');
        //    return;
        // }
        
        this.TestConfig = TestData;

        // some state variables
        this.TestState = {
            "CurrentTest": -1, 		// the current test index
            "TestIsRunning": 0,		// is true if test is running, false when finished or not yet started
            "FileMappings": [],		// json array with random file mappings
            "Ratings": [],			// json array with ratings
            "EvalResults": [],      // json array to store the evaluated test results
            "AudiosInLoadQueue": -1,
        }


        // create and configure audio pool
        this.audioPool = new AudioPool('AudioPool');
        this.audioPool.register();
        this.audioPool.onTimeUpdate = $.proxy(this.audioTimeCallback, this);
        this.audioPool.onError = $.proxy(this.audioErrorCallback, this);
        this.audioPool.onDataLoaded = $.proxy(this.audioLoadedCallback, this);
        this.audioPool.setLooped(this.TestConfig.LoopByDefault);

        // show introduction div
        $('#TestTitle').html(this.TestConfig.TestName);
        $('#TestIntroduction').show();
        

        // setup buttons and controls
        var handlerObject = this;
        $('#VolumeSlider').slider({
            min:0,
            max:100,
            value:100,
            slide: function( event, ui ) {
                var vol = log10($('#VolumeSlider').slider('option', 'value')) / 2;
                handlerObject.audioPool.setVolume(vol);
            }
        });
                
        if (this.TestConfig.EnableABLoop==true) {
            $('#ABRange').slider({
                range: true,
                values: [ 0, 100],
                min:0,
                max:100,
                slide: function( event, ui ) {
                        handlerObject.audioPool.ABPos = ui.values;
                }
            });
        } else {
            $('#ABRange').hide();
            $('#ProgressBar').css('margin-top', $('#ProgressBar').height() + 'px');
        }
        $('#PauseButton').button();

        //$('#ChkLoopAudio').button();
        if (this.TestConfig.LoopByDefault) {
            $('#ChkLoopAudio').prop("checked", true);
        } else {
            $('#ChkLoopAudio').prop("checked", false);
        }
        $('#ChkLoopAudio').on('change', $.proxy(handlerObject.toggleLooping, handlerObject));

        $('#ProgressBar').progressbar();
        $('#BtnNextTest').button();
        $('#BtnNextTest').on('click', $.proxy(handlerObject.nextTest, handlerObject));
        $('#BtnPrevTest').button();
        $('#BtnPrevTest').on('click', $.proxy(handlerObject.prevTest, handlerObject));
        $('#BtnStartTest').button();
        $('#BtnSubmitData').button({ icons: { primary: 'ui-icon-locked' }});        
                

        // install handler to warn user when test is running and he tries to leave the page
        window.onbeforeunload = function () {
            /*if (this.TestState.TestIsRunning) {
                check = ('The listening test is not yet finished!');
                return check;
            } else {
                return;
            }*/
        }


    }


    // ###################################################################
    ListeningTest.prototype.nextTest = function() {
    	this.runTest(this.TestState.CurrentTest+1);
    }

    // ###################################################################
    ListeningTest.prototype.prevTest = function() {
    	this.runTest(this.TestState.CurrentTest-1);
    }

    // ###################################################################
    ListeningTest.prototype.startTests = function() {
    	this.runTest(0);
    }

    // ###################################################################    
    // prepares display to run test with number TestIdx
    ListeningTest.prototype.runTest = function(TestIdx) {

        this.pauseAllAudios();

        // save ratings from last test if available
        if (this.TestState.CurrentTest>=0) this.saveRatings(this.TestState.CurrentTest);
        
        if (TestIdx<0) TestIdx=0;

        // if previous test was last one, ask before loading final page and then exit test
        if (TestIdx >= this.TestConfig.Testsets.length) {
            if (confirm('This was the last test. Do you want to finish?')) {
            
                $('#TableContainer').hide();
                $('#PlayerControls').hide();
                $('#TestControls').hide();
                $('#TestEnd').show();
                
                resultsBox = document.getElementById('ResultsBox');
                
                resultsBox.innerHTML = this.formatResults();
                                        
            if (this.TestConfig.EnableOnlineSubmission) {
                    $("#ResultsBox").hide();
                    $("#SubmitBox").show();
                } else {
                    $("#ResultsBox").show();
                    $("#SubmitBox").hide();
                }
            }
            return;
        }
        this.audioPool.clear();            
        
        this.createTestDOM(TestIdx);
 

        // set current test name
        $('#TestHeading').html(this.TestConfig.Testsets[TestIdx].Name + " (" + (TestIdx+1) + " of " + this.TestConfig.Testsets.length + ")");
        $('#TestHeading').show();

        // hide everything instead of load animation
        $('#TestIntroduction').hide();
        $('#TestControls').hide();
        $('#TableContainer').hide();
        $('#PlayerControls').hide();
        $('#LoadOverlay').show();
                
        // set some state variables
        this.TestState.CurrentTest = TestIdx;
        this.TestState.TestIsRunning = 1;
            
        var mushraConf = this.TestConfig;
        $('.rateSlider').each( function() {
            $(this).slider({
                    value: mushraConf.RateDefaultValue,
                    min: mushraConf.RateMinValue,
                    max: mushraConf.RateMaxValue,
                    animate: false,
                    orientation: "horizontal"
            });
                    
            $(this).slider('option', 'value', 0);
            $(this).css('background-image', 'url('+mushraConf.RateScaleBgPng+')');
        });

        var handlerObject = this;
        $('.stopButton').each( function() {
            $(this).button();
            $(this).on('click', $.proxy(handlerObject.pauseAllAudios, handlerObject));
        });
        
        $('.playButton').each( function() {
            $(this).button();
            var audioID = $(this).attr('rel');
            $(this).on('click', $.proxy(function(event) {handlerObject.playAudio(audioID)}, handlerObject));
        });
            
        // load and apply already existing ratings
        if (typeof this.TestState.Ratings[TestIdx] !== 'undefined') this.readRatings(TestIdx);
            
    }

    // ###################################################################
    // pause all audios
    ListeningTest.prototype.pauseAllAudios = function () {    
        this.audioPool.pause();
        $(".playButton").removeClass('playButton-active');
        $('.rateSlider').parent().css('background-color', 'transparent');    
    }

    // ###################################################################
    // read ratings from TestState object
    ListeningTest.prototype.readRatings = function (TestIdx) {
        // overwrite and implement in inherited class
        alert('Function readRatings() has not been implemented in your inherited class!');
    }

    // ###################################################################
    // save ratings to TestState object
    ListeningTest.prototype.saveRatings = function (TestIdx) {
        // overwrite and implement in inherited class
        alert('Function saveRatings() has not been implemented in your inherited class!');
    }

    // ###################################################################
    // evaluate test and format/print the results
    ListeningTest.prototype.formatResults = function () {
        // overwrite and implement in inherited class
        alert('Function formatResults() has not been implemented in your inherited class!');
    }

    // ###################################################################
    // create DOM for test display
    ListeningTest.prototype.createTestDOM = function (TestIdx) {
        // overwrite and implement in inherited class
        alert('Function createTestDOM() has not been implemented in your inherited class!');
    }

    // ###################################################################
    // is called whenever an <audio> tag fires the onDataLoaded event
    ListeningTest.prototype.audioLoadedCallback = function () {
        this.TestState.AudiosInLoadQueue--;
        
        // if all files are loaded show test
        if (this.TestState.AudiosInLoadQueue==0) {
            $('#TestControls').show();
            $('#TableContainer').show();
            $('#PlayerControls').show();       
            $('#LoadOverlay').hide();
        }
    }

    // ###################################################################
    // audio loading error callback
    ListeningTest.prototype.audioErrorCallback = function(e) {

        var s = parseInt(e.target.currentTime % 60);

        var errorTxt = "<p>ERROR loading audio file "+ e.target.src+"</p>";
        
        $('#LoadOverlay').append(errorTxt);
    }

    // ###################################################################
    // audio time update callback
    ListeningTest.prototype.audioTimeCallback = function(e) {

        var s = parseInt(e.target.currentTime % 60);
        var m = parseInt((e.target.currentTime / 60) % 60);
        
        if (m<10) m = "0"+m;
        if (s<10) s = "0"+s;            
        
        $('#duration > span').html( m + ':' + s );
        
        var progress = e.target.currentTime / e.target.duration * 100;
        
        $('#ProgressBar').progressbar( "option", "value", progress);
    }


    // ###################################################################
    // enable looping for all audios
    ListeningTest.prototype.toggleLooping = function () {    
        this.audioPool.toggleLooped();
    }

    // ###################################################################
    //play audio with specified html ID
    ListeningTest.prototype.playAudio = function (id) {
        
        this.audioPool.pause();

        // reset all buttons and sliders
        $('.rateSlider').parent().css('background-color', 'transparent');
        $('.playButton').removeClass('playButton-active');
        
        // highlight active slider and button
        $(".rateSlider[rel="+id+"]").parent().css('background-color', '#D5E5F6');
        $(".playButton[rel="+id+"]").addClass('playButton-active');
        
        this.audioPool.play(id);
    }

    // ###################################################################
    // add and load audio file with specified ID
    ListeningTest.prototype.addAudio = function (TestIdx, fileID, relID) {
        this.TestState.AudiosInLoadQueue += 1;
        this.audioPool.addAudio(this.TestConfig.Testsets[TestIdx].Files[fileID], relID)
    }

    // ###################################################################
    // submit test results to server
    ListeningTest.prototype.SubmitTestResults = function () {
            
        var UserName = $('#UserName').val();
        
        var testHandle = this;
        var EvalResultsJSON = JSON.stringify(testHandle.TestState.EvalResults);

        $.ajax({
                    type: "POST",
                    url: testHandle.TestConfig.BeaqleServiceURL,
                    data: {'testresults':EvalResultsJSON, 'username':UserName},
                    dataType: 'json'})
            .done( function (response){
                    if (response.error==false) {
                        $('#SubmitBox').html("Your submission was successful.<br/><br/>");

                        $("#ResultsBox").show();
                        $('#SubmitData').button('option',{ icons: { primary: 'ui-icon-check' }});
                        testHandle.TestState.TestIsRunning = 0;
                    } else {
                        $('#SubmitBox').html("span class='error'The following error occured during your submission:<br/>"
                                                +response.message+
                                                "<br/><br/> Please copy/paste the following table content and send it to our email adress "
                                                +testHandle.TestConfig.SupervisorContact+"<br/><br/> Sorry for any inconvenience!</span><br/><br/>"); 
                        $("#ResultsBox").show();   
                        $('#SubmitData').button('option',{ icons: { primary: 'ui-icon-alert' }});
                    }
                })
            .fail (function (xhr, ajaxOptions, thrownError){
                    $('#SubmitBox').html("<span class='error'>The following error occured during your submission:<br/>"
                                            +xhr.status+
                                            "<br/><br/> Please copy/paste the following table content and send it to our email adress "
                                            +testHandle.TestConfig.SupervisorContact+"<br/><br/> Sorry for any inconvenience!</span><br/><br/>");
                    $("#ResultsBox").show();   
                    $('#SubmitData').button('option',{ icons: { primary: 'ui-icon-alert' }});
                });
        $('#SubmitData').button('option',{ icons: { primary: 'load-indicator' }});

    }



// ###################################################################
// MUSHRA test main object

// inherit from ListeningTest
function MushraTest(TestData) {
    ListeningTest.apply(this, arguments);
}
MushraTest.prototype = new ListeningTest();
MushraTest.prototype.constructor = MushraTest;


// implement specific code


// ###################################################################
// create random mapping to test files
MushraTest.prototype.createFileMapping = function (TestIdx) {
    var NumFiles = $.map(this.TestConfig.Testsets[TestIdx].Files, function(n, i) { return i; }).length;
    var fileMapping = new Array(NumFiles);    

    $.each(this.TestConfig.Testsets[TestIdx].Files, function(index, value) { 

        do {
            var RandFileNumber = Math.floor(Math.random()*(NumFiles));
            if (RandFileNumber>NumFiles-1) RandFileNumber = NumFiles-1;
        } while (typeof fileMapping[RandFileNumber] !== 'undefined');

        if (RandFileNumber<0) alert(fileMapping);
        fileMapping[RandFileNumber] = index;
    });
    
    this.TestState.FileMappings[TestIdx] = fileMapping;
}

// ###################################################################
// read ratings from TestState object
MushraTest.prototype.readRatings = function (TestIdx) {
    
    if ((TestIdx in this.TestState.Ratings)==false) return false;
    
    var testObject = this;
    $(".rateSlider").each( function() {
        var pos = $(this).attr('id').lastIndexOf('slider');
        var fileNum = $(this).attr('id').substring(pos+6, $(this).attr('id').length);	

        $(this).slider('value', testObject.TestState.Ratings[TestIdx][fileNum]);
        $(this).slider('refresh');
    });

}

// ###################################################################
// save ratings to TestState object
MushraTest.prototype.saveRatings = function (TestIdx) {
    var ratings = new Object();
    $(".rateSlider").each( function() {
        var pos = $(this).attr('id').lastIndexOf('slider');
        var fileNum = $(this).attr('id').substring(pos+6, $(this).attr('id').length);
        
        ratings[fileNum] = $(this).slider( "option", "value" );
    });
    this.TestState.Ratings[TestIdx] = ratings;
}


MushraTest.prototype.createTestDOM = function (TestIdx) {

        // clear old test table
        if ($('#TableContainer > table')) {
            $('#TableContainer > table').remove();
        }

        // create random file mapping if not yet done
        if (!this.TestState.FileMappings[TestIdx]) {
                this.createFileMapping(TestIdx);
        }

        // create new test table
        var tab = document.createElement('table');
        tab.setAttribute('id','TestTable');
            
        var fileID = "";
        var row = new Array();
        var cell = new Array();
            
        // add reference
        fileID = "Reference";
        row  = tab.insertRow(-1);
        cell[0] = row.insertCell(-1);
        cell[0].innerHTML = "<span class='testItem'>Reference</span>";
        cell[1] = row.insertCell(-1);
        cell[1].innerHTML =  '<button id="play'+fileID+'Btn" class="playButton" rel="'+fileID+'">Play</button>';
        cell[2] = row.insertCell(-1);
        cell[2].innerHTML = "<button class='stopButton'>Stop</button>";  	
        cell[3] = row.insertCell(-1);
        cell[3].innerHTML = "<img id='ScaleImage' src='"+this.TestConfig.RateScalePng+"'/>";  	
        
        this.addAudio(TestIdx, fileID, fileID);
            
        // add spacing
        row = tab.insertRow(-1);
        row.setAttribute("height","5"); 

        var rateMin = this.TestConfig.RateMinValue;
        var rateMax = this.TestConfig.RateMaxValue;
            
        // add test items
        for (var i = 0; i < this.TestState.FileMappings[TestIdx].length; i++) { 
            
            var fileID = this.TestState.FileMappings[TestIdx][i];
            if (fileID === "Reference")
                relID = "HiddenRef";
            else
                relID = fileID;

            row[i]  = tab.insertRow(-1);
            cell[0] = row[i].insertCell(-1);
            cell[0].innerHTML = "<span class='testItem'>Test Item "+ (i+1)+"</span>";
            cell[1] = row[i].insertCell(-1);
            cell[1].innerHTML =  '<button id="play'+relID+'Btn" class="playButton" rel="'+relID+'">Play</button>';
            cell[2] = row[i].insertCell(-1);
            cell[2].innerHTML = "<button class='stopButton'>Stop</button>";  
            cell[3] = row[i].insertCell(-1);
            var fileIDstr = "";
            if (this.TestConfig.ShowFileIDs) {
                    fileIDstr = fileID;
            }
            cell[3].innerHTML = "<div class='rateSlider' id='slider"+fileID+"' rel='"+relID+"'>"+fileIDstr+"</div>";

            this.addAudio(TestIdx, fileID, relID);

        }        

        // append the created table to the DOM
        $('#TableContainer').append(tab);	

}

MushraTest.prototype.formatResults = function () {

    var resultstring = "";


    var numCorrect = 0;
    var numWrong   = 0;

    // evaluate single tests
    for (var i = 0; i < this.TestConfig.Testsets.length; i++) {  

        resultstring += "<p><b>"+this.TestConfig.Testsets[i].Name + "</b></p>\n";

        var tab = document.createElement('table');
        var row;
        var cell;

        row  = tab.insertRow(-1);
        cell = row.insertCell(-1);
        cell.innerHTML = "Filename";
        cell = row.insertCell(-1);
        cell.innerHTML = "Rating";

        this.TestState.EvalResults[i]           = new Object();
        this.TestState.EvalResults[i].rating    = new Object();
        this.TestState.EvalResults[i].filename  = new Object();
        var fileArr    = this.TestConfig.Testsets[i].Files;
        var testResult = this.TestState.EvalResults[i];

        $.each(this.TestState.Ratings[i], function(fileID, rating) { 
            row  = tab.insertRow(-1);
            cell = row.insertCell(-1);
            cell.innerHTML = fileArr[fileID];
            cell = row.insertCell(-1);
            cell.innerHTML = rating;

            testResult.rating[fileID]   = rating;
            testResult.filename[fileID] = fileArr[fileID];
        });

        resultstring += tab.outerHTML + "\n";
    }
   
    return resultstring;
}


// ###################################################################
// ABX test main object

// inherit from ListeningTest
function AbxTest(TestData) {
    ListeningTest.apply(this, arguments);
}
AbxTest.prototype = new ListeningTest();
AbxTest.prototype.constructor = AbxTest;


// implement specific code
AbxTest.prototype.createTestDOM = function (TestIdx) {

        // clear old test table
        if ($('#TableContainer > table')) {
            $('#TableContainer > table').remove();
        }

        // create new test table
        var tab = document.createElement('table');
        tab.setAttribute('id','TestTable');
            
        var fileID = "";
        var row = new Array();
        var cell = new Array();

  
        // create random file mapping if not yet done
        if (!this.TestState.FileMappings[TestIdx]) {
           this.TestState.FileMappings[TestIdx] = {"X": ""};
           var RandFileNumber = Math.random();
           if (RandFileNumber>0.5) {
               this.TestState.FileMappings[TestIdx].X = "A";
            } else {
               this.TestState.FileMappings[TestIdx].X = "B";
            }                
        }	
            
        // add reference
        fileID = "A";
        row  = tab.insertRow(-1);
        cell[0] = row.insertCell(-1);
        cell[0].innerHTML = '<button id="play'+fileID+'Btn" class="playButton" rel="'+fileID+'">A</button>';
        this.addAudio(TestIdx, fileID, fileID);

        fileID = this.TestState.FileMappings[TestIdx].X;
        relID  = "X";
        cell[1] = row.insertCell(-1);
        cell[1].innerHTML =  '<button id="play'+relID+'Btn" class="playButton" rel="'+relID+'">X</button>';
        this.addAudio(TestIdx, fileID, relID);

        fileID = "B";
        cell[2] = row.insertCell(-1);
        cell[2].innerHTML = '<button id="play'+fileID+'Btn" class="playButton" rel="'+fileID+'">B</button>';
        this.addAudio(TestIdx, fileID, fileID);

        cell[3] = row.insertCell(-1);
        cell[3].innerHTML = "<button class='stopButton'>Stop</button>";
        
        cell[4] = row.insertCell(-1);
        cell[4].innerHTML = "Press buttons to start/stop playback."; 
 
        row[1]  = tab.insertRow(-1);
        cell[0] = row[1].insertCell(-1);
        cell[0].innerHTML = "<input type='radio' name='ItemSelection' id='selectA'/>";
        cell[1] = row[1].insertCell(-1);
        cell[2] = row[1].insertCell(-1);
        cell[2].innerHTML = "<input type='radio' name='ItemSelection' id='selectB'/>";  
        cell[3] = row[1].insertCell(-1);
        cell[4] = row[1].insertCell(-1);
        cell[4].innerHTML = "Please select the item which is closest to X!";  
       
        // add spacing
        row = tab.insertRow(-1);
        row.setAttribute("height","5");  

        // append the created table to the DOM
        $('#TableContainer').append(tab);	

        // randomly preselect one radio button
        if (typeof this.TestState.Ratings[TestIdx] == 'undefined') {
            /*if (Math.random() > 0.5) {
               $("#selectB").prop("checked", true);
            } else {
               $("#selectA").prop("checked", true);
            }*/
        }
}


AbxTest.prototype.readRatings = function (TestIdx) {

    if (this.TestState.Ratings[TestIdx] === "A") {
        $("#selectA").prop("checked", true);
    } else if (this.TestState.Ratings[TestIdx] === "B") {
        $("#selectB").prop("checked", true);
    }

}

AbxTest.prototype.saveRatings = function (TestIdx) {

    if ($("#selectA").prop("checked")) {
        this.TestState.Ratings[TestIdx] = "A";
    } else if ($("#selectB").prop("checked")) {
        this.TestState.Ratings[TestIdx] = "B";
    }
}

AbxTest.prototype.formatResults = function () {

    var resultstring = "";
    var tab = document.createElement('table');
    var row;
    var cell;

    var numCorrect = 0;
    var numWrong   = 0;

    // evaluate single tests
    for (var i = 0; i < this.TestConfig.Testsets.length; i++) {  

        row  = tab.insertRow(-1);

        cell = row.insertCell(-1);
        cell.innerHTML = this.TestConfig.Testsets[i].Name;
        cell = row.insertCell(-1);

        if (this.TestState.Ratings[i] === this.TestState.FileMappings[i].X) {
            this.TestState.EvalResults[i] = true;
            cell.innerHTML = "correct"; 
            numCorrect += 1;
        } else {
            this.TestState.EvalResults[i] = false;
            cell.innerHTML = "wrong"; 
            numWrong += 1;
        }       
    }

    resultstring += tab.outerHTML;

    resultstring += "<br/><p>Percentage of correct assignments: " + (numCorrect/this.TestConfig.Testsets.length*100).toFixed(2) + " %</p>";
    return resultstring;
}
