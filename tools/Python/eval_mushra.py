import json
import os
import csv
import numpy as np
import matplotlib.pyplot as plt


ResultsExt    = ".txt"
ResultsFolder = "results/"

# Check if folder with results exists and retrieve list of all result files
if os.path.exists(ResultsFolder):
    dirListing = os.listdir(ResultsFolder)
    dirListing = [name for name in dirListing if name.endswith(ResultsExt)]
    if len(dirListing)<1:
        print("ERROR: empty ResultsFolder!")
        raise SystemExit()
else:
    print("ERROR: invalid ResultsFolder!")
    raise SystemExit()

# Import and decode all result files
ResJSONList = list()
for ResFileName in dirListing:
    ResFile = open(os.path.join(ResultsFolder, ResFileName))
    try:
        ResJSONList.append(json.load(ResFile))
    except:
        print(os.path.join(ResultsFolder, ResFileName)+" is not a valid JSON file.")
    finally:
        ResFile.close()

# Group results by test sets
numResults = len(ResJSONList)
numTests   = sum(1 for dict in ResJSONList[0] if 'TestID' in dict)
RatingsDict = dict()
RuntimesDict = dict()
for ResJSONData in ResJSONList:
    for i in range(0, numTests):        
        if 'TestID' in ResJSONData[i]:
            testID = ResJSONData[i]['TestID']
    
            if not testID in RatingsDict:
                RatingsDict[testID] = dict()
    
            if not testID in RuntimesDict:
                RuntimesDict[testID] = list()
    
            # if runtime entry exists
            if 'Runtime' in ResJSONData[i]:
                RuntimesDict[testID].append(ResJSONData[i]['Runtime'])
    
            # if rating entry exists
            if 'rating' in ResJSONData[i]:
                for testItem in ResJSONData[i]['rating']:
                    if not testItem in RatingsDict[testID]:
                        RatingsDict[testID][testItem] = list()
                    RatingsDict[testID][testItem].append(ResJSONData[i]['rating'][testItem])
        
        elif 'UserComment' in ResJSONData[i]:
            print('Comment: '+ResJSONData[i]['UserName']+'<'+ResJSONData[i]['UserEmail']+'>')
            print(ResJSONData[i]['UserComment'])
            print('--------------------')

# plot and evaluate every single test set, output results to a csv file
plotsX = np.ceil(np.sqrt(numTests))
plotsY = np.ceil(numTests / plotsX)
plotInd = 0
for testID in sorted(RatingsDict):

    # write test set results to a csv file
    CsvFile = open(testID+'.csv', 'w')
    CsvWriter = csv.writer(CsvFile)

    testResArr = None
    labels = list()
    for testDataKey in sorted(RatingsDict[testID]):
        testData = RatingsDict[testID][testDataKey]
        CsvWriter.writerow(list(testDataKey) + testData)
        npTestData = np.array(testData)
        labels.append(testDataKey)
        if testResArr == None:
            testResArr = npTestData
        else:
            testResArr = np.column_stack((testResArr, npTestData.T))

    CsvFile.close()

    plotInd += 1
    if testResArr.shape[0] > 1:
        plt.figure(0)
        plt.subplot(plotsX, plotsY, plotInd)
        plt.boxplot(testResArr)
        plt.title(testID)
        plt.xticks(range(1, len(labels)+1), labels, rotation=45)
    else:
        print("WARNING: not enough ratings for test " + testID + " to create a boxplot!")

plt.tight_layout()

# plot runtime of tests
runtimesArr = list()
labels = list()
for testID in sorted(RuntimesDict):
    timesInSec = [x / 1000 for x in RuntimesDict[testID]]
    runtimesArr.append(timesInSec)
    labels.append(testID)

plt.figure(1)
plt.boxplot(runtimesArr)
plt.title("Runtime per test")
plt.xticks(range(1, len(labels)+1), labels, rotation=45)
plt.ylabel("Time in sec")

plt.show()
