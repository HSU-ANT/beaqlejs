<?php	
    // BeaqleJS web service
    // 
    // Receives a JSON fromatted data structure containing listening test results and writes them to a text file.

    //error_reporting(-1);
    //ini_set('display_errors', true);

    // subfolder for results, folder has to exist and needs proper write permissions
    // --->
    $results_prefix = "./results/";
    // <---

    // check if data was received by a POST request
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // allow cross domain requests
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET");
        header('Content-type: application/json');
        // check if necessary data is available
        if (isset($_POST['testresults'])) {
        
	        $testresults = $_POST['testresults'];
	        
            // generate filename
            if (isset($_POST['username'])) {
                $username = $_POST['username'];
            } else {
                $username = "";
            }
       	    $filename = date("Ymd-Hi")."_".$username;
	        $filenumber = 0;
	
	        while (file_exists($results_prefix.$filename."$filenumber".".txt")) {
	            $filenumber++;
            }
        	$filename = $filename."$filenumber".".txt";
        	
	        // write the file
	        $err1 = file_put_contents($results_prefix.$filename, print_r($testresults, TRUE));
	
	        if ($err1===false) {
                $return['error'] = true;
                $return['message'] = "Error writing data to file! (".$results_prefix.$filename.")";    
	        } else {
                $return['error'] = false;
                $return['message'] = "Data is saved!";    
	        }
        } else {
            $return['error'] = true;
            $return['message'] = "Invalid data sent!";    
        }
        
        // return 
        echo json_encode($return);

    } else {
        // perform a little self test
        echo '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><title>BeaqleJS Web Service</title>';
        echo "<p>This is a <a href='https://github.com/HSU-ANT/beaqlejs'>BeaqleJS</a> web service to collect listening test results...</p>";
        echo "Self check: <ul>";
        if (version_compare(phpversion(), '5.0', '>')) {
            echo "<li>PHP version <b style='color:green'>OK</b>.</li>";
        } else {
            echo "<li>PHP <b style='color:red'>version too old</b>, at least PHP 5.0 is required.</li>";
        }
        if (file_exists($results_prefix) && is_writable(dirname($results_prefix."test.txt"))) {
            echo "<li>Results subfolder exists and has write permission, <b style='color:green'>OK</b>.</li>";
        } else {
            echo "<li>Results subfolder does not exists or no write permission, <b style='color:red'>ERROR</b>.</li>";
        }
        echo "</ul>";

    }
?>
