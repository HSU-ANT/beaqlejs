// configure the test here
var TestConfig = {
  "TestName": "ABX Demo Test",
  "LoopByDefault": true,
  "ShowFileIDs": false,
  "ShowResults": false,
  "EnableABLoop": true,
  "EnableOnlineSubmission": false,
  "BeaqleServiceURL": "",
  "SupervisorContact": "", 
  "AudioRoot": "",
  "Testsets": [
    //    
    {
      "Name": "Schubert",
      "TestID": "id1",
      "Files": {
        "A": "audio/schubert_ref.wav",
        "B": "audio/schubert_2.wav",
      }
    },
    //    
    {
      "Name": "Castanets",
      "TestID": "id2",
      "Files": {
        "A": "audio/castanets_ref.wav",
        "B": "audio/castanets_2.wav",
      }
    },
  ]
}
