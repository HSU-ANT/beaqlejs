<?php	
    // BeaqleJS web service
    // 
    // Receives a JSON fromatted data structure containing listening test results and writes them to a text file.

    // allow cross domain requests
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET");
    header('Content-type: application/json');
    
    $results_prefix = "results/";
    
    // check if necessary data is available
    if (isset($_POST['testresults']) && isset($_POST['testresultscsv']) && isset($_POST['username'])) {
    
	    $testresults = trim($_POST['testresults']);
	    $testresultscsv = trim($_POST['testresultscsv']);
	    $username = trim($_POST['username']);
	    
   	    $filename = date("Ymd-Hi")."_".$username;
	    $filenumber = 0;
	
	    while (file_exists($results_prefix.$filename."$filenumber".".txt")) {
	        $filenumber++;
        }
    	$filename = $filename."$filenumber".".txt";
    	
	    // write data
	    $err1 = file_put_contents($results_prefix.$filename, $testresults."\n", FILE_APPEND);	
	    $err2 = file_put_contents($results_prefix."allresults.txt", date("Ymd-Hi")."_".$testresultscsv."\n", FILE_APPEND);
	
	    if (($err1===false) || ($err2===false)) {
            $return['error'] = true;
            $return['message'] = "Error writing data!";    
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

?>
