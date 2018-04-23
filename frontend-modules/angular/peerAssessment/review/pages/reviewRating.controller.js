app.controller('ReviewRatingController', function ($scope, $http, toastr, $window, $location, ActionBarService, Upload) {
    vId = $location.search().vId;
    if (!vId) {
        return
    }

    ActionBarService.extraActionsMenu = [];

    ActionBarService.extraActionsMenu.push({
            clickAction: $scope.goBack,
            title: '<i class="ionicons ion-arrow-return-left"></i> &nbsp; BACK',
            aTitle: 'Back'
        }, {
            separator: true
        }, {
            clickAction: $scope.redirectPRHome,
            title: '<i class="ionicons ion-home"></i> &nbsp; PEER REVIEWS HOME',
            aTitle: 'Peer Review Home'
        }
        //{
        //    clickAction: $scope.viewReviewsList,
        //    title: '<i class="ionicons ion-arrow-return-left"></i> &nbsp; BACK',
        //    aTitle: 'Back'
        //}
    );

    $scope.isValidRating = function () {
        var isvalid = $scope.formRating.$valid;
        if (isvalid == true) {
            return true;
        } else {
            toastr.error('Input a valid number (0-5)');
            return false;
        }
    }

   

    $scope.submitReviewRating = function () {
        console.log($scope.peerReview)

        // var reviewsRating = $scope.peerReview;

        // var totalNum = Object.size(reviewsRating.reviewRatings);

        // var ratingArray = Object.entries(reviewsRating.reviewRatings);

        // var revObj = {};
        // for (var i = 0; i < totalReviews; i++) {
        //     revObj[data[i].assignedTo.displayName] = data[i].marksObtained;
        // }

        // for (var i = 0; i < totalReviews; i++) {

        //     for (var j = 0; j < totalNum; j++) {

        //     }}

        $scope.isLoading = true;
        var uploadParams = {
            method: 'PUT',
            url: '/api/peerassessment/' + $scope.course._id + '/reviewRatings/' + $scope.peerReview._id,
            fields: $scope.peerReview
        };
        uploadParams.file = [];
        if ($scope.reviewDocuments) {
            uploadParams.file.push({
                'reviewDocuments': $scope.reviewDocuments
            });
        }

        $scope.upload = Upload.upload(
                uploadParams
            )
            .progress(function (evt) {
                if (!evt.config.file)
                    return;

                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                // console.log("Progress", $scope.progress);
            })
            .success(function (data) {
                $scope.progress = 0;
                if (data.result) {
                    toastr.success('Successfully Saved');
                } else {
                    toastr.error(data.errors[0] || 'Failed');
                }
                $scope.isLoading = false;
                if (data.reviewId == vId) {
                    window.location.reload();
                } else {
                    //window.history.replaceState({},"", '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=reviewSubmission&vId=' + data.reviewId)
                    //window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=reviewSubmission&vId=' + data.reviewId;
                    window.location.reload();
                }
            })
            .error(function (data) {
                toastr.error('Internal Server Error');
                $scope.errors = data.errors;
                $scope.progress = 0;
                $scope.isLoading = false;
            });
    }

    Object.size = function (object) {
        var size = 0,
            key;
        for (key in object) {
            if (object.hasOwnProperty(key)) size++;
        }
        return size;
    };

})