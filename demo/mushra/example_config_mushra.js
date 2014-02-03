// configure the test here
var TestData = {
  "TestName": "Mushra Demo Test",
  "RateScalePng": "img/scale_abs.png",
  "RateScaleBgPng": "img/scale_abs_background.png",
  "RateMinValue": 0,
  "RateMaxValue": 100,
  "RateDefaultValue":0,
  "ShowFileIDs": false,
  "LoopByDefault": true,
  "EnableABLoop": true,
  "EnableOnlineSubmission": false,
  "SubmitResultsURL": "",
  "SupervisorContact": "",
  "Testsets": [
    //    
    {
      "Name": "Schubert",
      "Files": {
            "Reference": "audio/schubert_ref.ogg",
            "1": "audio/schubert_1.ogg",
            "2": "audio/schubert_2.ogg",
            "3": "audio/schubert_3.ogg",
            "Anchor": "audio/schubert_anch.ogg",
        }
    },
    //    
    {
      "Name": "Castanets",
      "Files": {
            "Reference": "audio/castanets_ref.ogg",
            "1": "audio/castanets_1.ogg",
            "2": "audio/castanets_2.ogg",
            "3": "audio/castanets_3.ogg",
            "Anchor": "audio/castanets_anch.ogg",
        }
    },
  ]
}
