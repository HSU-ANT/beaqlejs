// configure the test here
var TestData = {
  "TestName": "Mushra Demo Test",
  "RateScalePng": "img/scale_abs.png",
  "RateScaleBgPng": "img/scale_abs_background.png",
  "RateMinValue": 0,
  "RateMaxValue": 100,
  "RateDefaultValue":0,
  "ShowFileIDs": true,
  "LoopByDefault": true,
  "EnableABLoop": true,
  "EnableOnlineSubmission": false,
  "BeaqleServiceURL": "",
  "SupervisorContact": "",
  "Testsets": [
    //    
    {
      "Name": "Schubert",
      "Files": {
            "Reference": "audio/schubert_ref.wav",
            "1": "audio/schubert_1.wav",
            "2": "audio/schubert_2.wav",
            "3": "audio/schubert_3.wav",
            "4": "audio/schubert_anch.wav",
        }
    },
    //    
    {
      "Name": "Castanets",
       "Files": {
            "Reference": "audio/castanets_ref.wav",
            "1": "audio/castanets_1.wav",
            "2": "audio/castanets_2.wav",
            "3": "audio/castanets_3.wav",
            "4": "audio/castanets_anch.wav",
        }
    },
  ]
}
