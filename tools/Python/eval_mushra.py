import json
import os
import csv
import numpy as np
import matplotlib.pyplot as plt
import collections


ResultsExt = ".txt"
ResultsFolder = "results/"

# Check if folder with results exists and retrieve list of all result files
if os.path.exists(ResultsFolder):
    dirListing = os.listdir(ResultsFolder)
    dirListing = [name for name in dirListing if name.endswith(ResultsExt)]
    if len(dirListing) < 1:
        print("ERROR: empty ResultsFolder!")
        raise SystemExit()
else:
    print("ERROR: invalid ResultsFolder!")
    raise SystemExit()

# Import and decode all result files
ResJSONList = list()
ResMetaData = list()
for ResFileName in dirListing:
    ResFile = open(os.path.join(ResultsFolder, ResFileName))
    ResMetaStruct = collections.OrderedDict()
    ResMetaStruct['FileName'] = ResFileName
    ResMetaStruct['UserID'] = -1
    ResMetaStruct['UserName'] = ""
    ResMetaStruct['UserEmail'] = ""
    ResMetaStruct['UserComment'] = ""
    try:
        ResJSONList.append(json.load(ResFile))
        ResMetaData.append(ResMetaStruct)
    except:
        print(os.path.join(ResultsFolder, ResFileName) + " is not a valid JSON file.")
    finally:
        ResFile.close()

# Group results by test sets
numResults = len(ResJSONList)
RatingsDict = dict()
RuntimesDict = dict()
for n, ResJSONData in enumerate(ResJSONList):
    ResMetaData[n]['UserID'] = n
    for i in range(0, len(ResJSONData)):
        if 'TestID' in ResJSONData[i]:
            testID = ResJSONData[i]['TestID']

            if testID not in RatingsDict:
                RatingsDict[testID] = dict()

            if testID not in RuntimesDict:
                RuntimesDict[testID] = list()

            # if runtime entry exists
            if 'Runtime' in ResJSONData[i]:
                RuntimesDict[testID].append(ResJSONData[i]['Runtime'])

            # if rating entry exists
            if 'rating' in ResJSONData[i]:
                for testItem in ResJSONData[i]['rating']:
                    if testItem not in RatingsDict[testID]:
                        RatingsDict[testID][testItem] = list()
                    RatingsDict[testID][testItem].append(ResJSONData[i]['rating'][testItem])

        elif 'UserComment' in ResJSONData[i]:
            ResMetaData[n]['UserName'] = ResJSONData[i]['UserName']
            ResMetaData[n]['UserEmail'] = ResJSONData[i]['UserEmail']
            ResMetaData[n]['UserComment'] = ResJSONData[i]['UserComment']

# write csv file with metadata to map columns of the CSV file
CsvFile = open('metadata.csv', 'w')
fieldnames = ResMetaData[0].keys()
CsvWriter = csv.DictWriter(CsvFile, fieldnames=fieldnames, delimiter="\t")
for ResMetaStruct in ResMetaData:
    try:
        CsvWriter.writerow(ResMetaStruct)
    except:
        pass
CsvFile.close()

# plot and evaluate every single test set, output results to a csv file
numTests = sum(1 for dict in ResJSONList[0] if 'TestID' in dict)
plotsX = np.ceil(np.sqrt(numTests))
plotsY = np.ceil(numTests / plotsX)
plotInd = 0
for testID in sorted(RatingsDict, key=lambda s: s.lower()):

    # write test set results to a csv file
    CsvFile = open(testID + '.csv', 'w')
    CsvWriter = csv.writer(CsvFile)

    testResArr = None
    labels = list()
    for testDataKey in sorted(RatingsDict[testID], key=lambda s: s.lower()):
        testData = RatingsDict[testID][testDataKey]
        row = list()
        row.append(testDataKey)
        row.extend(testData)
        CsvWriter.writerow(row)
        npTestData = np.array(testData)
        labels.append(testDataKey)
        if testResArr is None:
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
        plt.xticks(range(1, len(labels) + 1), labels, rotation=45)
    else:
        print("WARNING: not enough ratings for test " + testID + " to create a boxplot!")

plt.tight_layout()

# plot runtime of tests
runtimesArr = list()
labels = list()
for testID in sorted(RuntimesDict, key=lambda s: s.lower()):
    timesInSec = [x / 1000 for x in RuntimesDict[testID]]
    runtimesArr.append(timesInSec)
    labels.append(testID)

plt.figure(1)
plt.boxplot(runtimesArr)
plt.title("Runtime per test")
plt.xticks(range(1, len(labels) + 1), labels, rotation=45)
plt.ylabel("Time in sec")

plt.show()
