// configure the test here
var TestData = {
  "TestName": "ABX Demo Test",
  "LoopByDefault": true,
  "ShowFileIDs": false,
  "EnableABLoop": true,
  "EnableOnlineSubmission": false,
  "SubmitResultsURL": "",
  "SupervisorContact": "", 
  "Testsets": [
    //    
    {
      "Name": "Schubert",
      "Files": {
        "A": "audio/schubert_ref.ogg",
        "B": "audio/schubert_2.ogg",
      }
    },
    //    
    {
      "Name": "Castanets",
      "Files": {
        "A": "audio/castanets_ref.ogg",
        "B": "audio/castanets_2.ogg",
      }
    },
  ]
}
