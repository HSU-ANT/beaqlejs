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

    // bypass any (proxy) caching
    header("Cache-Control: no-cache, must-revalidate");    

    // check if data was received by a POST request
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        // allow requests from any domain
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST");
        header('Content-type: application/json');

        // check if necessary data is available
        if (isset($_POST['testresults']) && (strlen($_POST['testresults'])<1024*64)) { // maximum allowed upload size is 64kB
        
            $testresults = $_POST['testresults'];
            
            // generate filename
            if (isset($_POST['username']) && (strlen($_POST['username'])<128)) {
                $username = $_POST['username'];
                $username = str_replace(' ', '_',  $username);
                // Remove anything from the username which isnt a standard letter, number, _ or -.
                // This is necessary to avoid path injection
                // because the username is used within the file name.
                $username = preg_replace('/[^a-zA-Z0-9_-]/s', '',  $username);
            } else {
                $username = "";
            }
       	    $filename = date("Ymd-Hi")."_".$username;

            // add a random suffix 
  	        $filenumber = mt_rand();
            while (file_exists($results_prefix.$filename."_".dechex($filenumber).".txt")) {
                $filenumber++;
            }
        	$filename_data = $filename."_".dechex($filenumber).".txt";
        	
            // write the file
            $succ = file_put_contents($results_prefix.$filename_data, print_r($testresults, TRUE));

            if ($succ===false) {
                $return['error'] = true;
                $return['message'] = "Error writing data to file! (".$results_prefix.$filename_data.")";    
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
