// configure the test here
var TestConfig = {
  "TestName": "Mushra Demo Test",
  "RateScalePng": "img/scale_abs.png",
  "RateScaleBgPng": "img/scale_abs_background.png",
  "RateMinValue": 0,
  "RateMaxValue": 100,
  "RateDefaultValue":0,
  "ShowFileIDs": false,
  "ShowResults": false,
  "LoopByDefault": true,
  "EnableABLoop": true,
  "EnableOnlineSubmission": false,
  "BeaqleServiceURL": "",
  "SupervisorContact": "",
  "RandomizeTestOrder": false,
  "MaxTestsPerRun": 3,
  "RequireMaxRating": false,
  "AudioRoot": "",
  "Testsets": [
    //    
    {
      "Name": "Schubert 1",
      "TestID": "id1_1",
      "Files": {
            "Reference": "audio/schubert_ref.wav",
            "1": "audio/schubert_1.wav",
            "2": "audio/schubert_2.wav",
            "3": "audio/schubert_3.wav",
            "4": "audio/schubert_anch.wav",
        }
    },
    {
      "Name": "Schubert 2",
      "TestID": "id1_2",
      "Files": {
            "Reference": "audio/schubert_ref.wav",
            "1": "audio/schubert_1.wav",
            "2": "audio/schubert_2.wav",
            "3": "audio/schubert_3.wav",
            "4": "audio/schubert_anch.wav",
        }
    },
    {
      "Name": "Schubert 3",
      "TestID": "id1_3",
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
       "TestID": "id2_1",
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
