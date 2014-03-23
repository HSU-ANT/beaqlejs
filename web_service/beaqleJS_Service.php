<?php	
    // BeaqleJS web service
    // 
    // Receives a JSON fromatted data structure containing listening test results and writes them to a text file.

    // allow cross domain requests
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET");
    header('Content-type: application/json');
    
    // subfolder for results, folder has to exist and needs proper write permissions
    $results_prefix = "results/";
    
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
	    $err1 = file_put_contents($results_prefix.$filename, print_r($testresults, TRUE), FILE_APPEND);
	
	    if ($err1===false) {
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
