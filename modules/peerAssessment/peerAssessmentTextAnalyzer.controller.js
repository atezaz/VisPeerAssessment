var Rake = require('node-rake');
var CosineDistance = require('string-similarity'); //Cosine Distance
var DiceCoefficientDistance = require('dice-coefficient');
var LevenshteinDistance = require("leven");
var JaccardDistance = require('jaccard');


function peerAssessmentTextAnalyzer() {

}

peerAssessmentTextAnalyzer.prototype.getExtractedTextByRake = function (error, document, success) {
    maxChar = 15000; //becasue rake can not Extract words more then 18,000~
    var result = "",
        resultCon = "";
    try {
        if (document.length > maxChar) {
            var textArray = document.match(new RegExp('.{1,' + maxChar + '}', 'g'));
            for (var i = 0; i < textArray.length; i++) {
                result = "";
                result = Rake.generate(textArray[i]);
                resultCon = resultCon + result;
            }
            // console.log("\n\n\n\n", resultCon.replace(/,/g, " "));
        } else {
            var str = Rake.generate(document);
            resultCon = str + "";
        }
        var obj = getFrequency(resultCon.replace(/,/g, " ").replace(/  +/g, ' '));

        success(obj);
    } catch (err) {
        console.log("Rake Error: ", err.message);
    }
}

var getFrequency = function (doc) {
    var words = doc.split(' '),
        frequencies = {},
        word, i;

    for (i = 0; i < words.length; i++) {
        word = words[i];
        frequencies[word] = frequencies[word] || 0;
        frequencies[word]++;
    }
    return frequencies;
}

peerAssessmentTextAnalyzer.prototype.getAnalyzedTextReport = function (error, text, success) {
    try {

        var textArray = text.split('|||'); //because I appended ||| sign to concat the text therefore I am now spliting it

        var str1 = textArray[0].replace(/\W/g, ' '); //Remove non-alphanumeric characters from string
        var str2 = textArray[1].replace(/\W/g, ' '); //Remove non-alphanumeric characters from string

        //Cosine similarity
        var cosineSimilarity = CosineDistance.compareTwoStrings(str1, str2) * 100;
        //var cosineSimilarity = cosine(str1.split(/\s/), str2.split(/\s/)) * 100;

        //Sørensen–Dice coefficient
        var diceCoefficientSimilarity = DiceCoefficientDistance(str1, str2) * 100;

        var Levenshtein_Dis = LevenshteinDistance(str1, str2);
        var textLenght = (str1.length + str2.length);

        //Levenshtein distance
        var levenshteinSimilarity = 100 - ((Levenshtein_Dis / textLenght) * 100); //conversion into % from distance

        //var set1 = new Set(CleanNullElementsInTheArray(str1.split(" ")));
        //var set2 = new Set(CleanNullElementsInTheArray(str2.split(" ")));

        var text_A = CleanNullElementsInTheArray(str1.split(" "));
        var text_B = CleanNullElementsInTheArray(str2.split(" "));

        //Jaccard similarity coefficient
        if (text_A.length > text_B.length) {
            var jaccardSimilarity = JaccardDistance.index(text_B, text_A) * 100;
        } else {
            var jaccardSimilarity = JaccardDistance.index(text_A, text_B) * 100;
        }

        if(jaccardSimilarity > 95){ //because of handling worst cases
            jaccardSimilarity = (cosineSimilarity + diceCoefficientSimilarity + levenshteinSimilarity)/3;
        }

        var meanValue = (cosineSimilarity + diceCoefficientSimilarity + levenshteinSimilarity + jaccardSimilarity) / 4;

        var object_AnalyzedData = {
            CosineSimilarity: cosineSimilarity.toFixed(2),
            DiceCoefficientSimilarity: diceCoefficientSimilarity.toFixed(2),
            LevenshteinSimilarity: levenshteinSimilarity.toFixed(2),
            JaccardSimilarity: jaccardSimilarity.toFixed(2),
            Mean: meanValue.toFixed(2)
        };
        success(object_AnalyzedData);
    } catch (err) {
        console.log("Analyzing Text Error: ", err.message);
    }
}


peerAssessmentTextAnalyzer.prototype.getAnalyzedRewiewReport = function (error, reviews, success) {
    try {
        if(reviews && reviews.length && reviews[0].peerReviewId.reviewSettings.rubrics && reviews[0].peerReviewId.reviewSettings.rubrics.length)
        {
           var totalReviews = reviews[0].peerReviewId.reviewSettings.rubrics.length;
            //var totalReviews =  Object.keys(reviews[0].rubricReview).length;
            var reviewsCount = reviews.length;

            for (var i = 0; i < reviewsCount; i++) {
                for (var j = 0; j < totalReviews; j++) {
                    var rubricReview = reviews[i].rubricReview;
                    if (rubricReview.hasOwnProperty(reviews[i].peerReviewId.reviewSettings.rubrics[j]._id)) {
                        if(!reviews[i].rubricNewReview){
                            reviews[i].rubricNewReview = {};
                        }
                            reviews[i].rubricNewReview[reviews[i].peerReviewId.reviewSettings.rubrics[j]._id + ":" + reviews[i].peerReviewId.reviewSettings.rubrics[j].title] = reviews[i].rubricReview[reviews[i].peerReviewId.reviewSettings.rubrics[j]._id];
                            //console.log("reviews[i].peerReviewId.reviewSettings.rubrics[j].title);
                        }
                    } //delete reviews[i].rubricReview[reviews[i].peerReviewId.reviewSettings.rubrics[k]._id];
            }


            var combination = combinations(reviewsCount); //possible combinations of the reviews
            var loop = 0;
            var rewiewObject = {};
            var check =loop;
            var count = 0;
            for (var i = 0; i < totalReviews; i++) {
                var var1 = 0;
                for (var j = 0; j < combination; j++) { //for managing combinations
                    var var2 = 0;
                    if (count == combination) { //increase 1 in loop after one combination cycle completes for next rubric to fetch
                        loop++;
                        count = 0;
                    }
                    for (var k = j; k < reviewsCount - 1; k++) {
                        var rubricReview1 = reviews[j].rubricNewReview;
                        var rubricReview2 = reviews[k + 1].rubricNewReview;

                        var sortedKeys = Object.keys(rubricReview1).sort(); //sorting the object keys
                        var str1 = rubricReview1[sortedKeys[loop]]; //fetch

                        var sortedKeys2 = Object.keys(rubricReview2).sort(); //sorting the object keys
                        var str2 = rubricReview2[sortedKeys2[loop]];
                        count++;


                        var Levenshtein_Dis = LevenshteinDistance(str1, str2);
                        var textLenght = (str1.length + str2.length);

                        //Levenshtein distance
                        var levenshteinSimilarity = 100 - ((Levenshtein_Dis / textLenght) * 100); //conversion into % from distance

                        //Cosine similarity
                        var cosineSimilarity = CosineDistance.compareTwoStrings(str1, str2) * 100;

                        //Sørensen–Dice coefficient
                        var diceCoefficientSimilarity = DiceCoefficientDistance(str1, str2) * 100;

                        var mean = (cosineSimilarity + diceCoefficientSimilarity + levenshteinSimilarity)/3;
                        
                        rewiewObject["R"+ (j+1) +"|R"+ (k+2) +"-"+ sortedKeys2[loop] + ":" + mean.toFixed(2) + "*R"+ (j+1) +"="+ reviews[j].assignedTo.displayName +":R"+ (k+2) +"="+ reviews[k + 1].assignedTo.displayName] = mean.toFixed(2);
                    }
                }
            }
            success(rewiewObject);
    }
    else{
        success(reviews); 
    }

    } catch (err) {
        console.log("Analyzing Rewiew Error: ", err.message);
    }
}


function CleanNullElementsInTheArray(text) { //Function for cleaning array from empty elements
    var cleanedArray = new Array();
    for (var i = 0; i < text.length; i++) {
        if (text[i]) {
            cleanedArray.push(text[i]);
        }
    }
    return cleanedArray;
}

// var jaccard = function ( sa, sb ) {
//     var intersectSize = 0;
//     var distance;
//     // Use smaller sized set for iteration.
//     if ( sa.size < sb.size ) {
//       sa.forEach( function ( element ) {
//         if ( sb.has( element ) ) intersectSize += 1;
//       } );
//     } else {
//       sb.forEach( function ( element ) {
//         if ( sa.has( element ) ) intersectSize += 1;
//       } );
//     }
//     // Compute Jaccard similarity while taking care of case when dividend is 0!
//     distance = (
//                 ( sa.size || sb.size ) ?
//                   1 - ( intersectSize / ( sa.size + sb.size - intersectSize ) ) :
//                   0
//                );
//     return distance;
//   }; // jaccard()

function toObject(arr) {
    var rv = {};
    for (var i = 0; i < arr.length; ++i)
        rv[i] = arr[i];
    return rv;
}

function combinations(num) {
    if (num == 2) { return 2; } else if (num == 3) { return 3;  } else if (num == 4) { return 6; } 
    else if (num == 5) {  return 10; } else if (num == 6) { return 15; } else if (num == 7) { return 21;
    } else if (num == 8) { return 28; } else if (num == 9) { return 36; } else if (num == 10) {  return 45; } 
    else {  return 0; }
}

module.exports = peerAssessmentTextAnalyzer;