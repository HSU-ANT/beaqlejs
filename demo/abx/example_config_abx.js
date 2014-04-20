// configure the test here
var TestConfig = {
  "TestName": "ABX Demo Test",
  "LoopByDefault": true,
  "ShowFileIDs": false,
  "EnableABLoop": true,
  "EnableOnlineSubmission": false,
  "BeaqleServiceURL": "",
  "SupervisorContact": "", 
  "Testsets": [
    //    
    {
      "Name": "Schubert",
      "Files": {
        "A": "audio/schubert_ref.wav",
        "B": "audio/schubert_2.wav",
      }
    },
    //    
    {
      "Name": "Castanets",
      "Files": {
        "A": "audio/castanets_ref.wav",
        "B": "audio/castanets_2.wav",
      }
    },
  ]
}
