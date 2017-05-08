angular.module('HubDetailController', [])
    .controller("HubDetailController", function ($scope, serverUtilities, $window) {

        $scope.cleanlinessStatus = "";

        $scope.pipelineImage = $window.image;

        $scope.gaugeOptions = {

            chart: {
                type: 'solidgauge'
            },

            title: null,

            pane: {
                center: ['50%', '85%'],
                size: '140%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },

            tooltip: {
                enabled: false
            },

            // the value axis
            yAxis: {
                stops: [
                    [0.33, '#DF5353'], // red
                    [0.66, '#f7a35c'], // yellow
                    [0.9, '#55BF3B'] // green
                ],
                lineWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                title: {
                    y: -70
                },
                labels: {
                    y: 16
                }
            },

            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: 5,
                        borderWidth: 0,
                        useHTML: true
                    }
                }
            }
        };

        $scope.cleanlinessScore = function () {
            if ($scope.pipelineImage.cleanlinessScore) {
                Highcharts.chart('container-cleanliness', Highcharts.merge($scope.gaugeOptions, {
                    yAxis: {
                        min: 0,
                        max: 100,
                        title: {
                            text: 'Cleanliness'
                        }
                    },

                    credits: {
                        enabled: false
                    },

                    series: [{
                        name: 'Speed',
                        data: $scope.pipelineImage.cleanlinessScore,
                        dataLabels: {
                            format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                            ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                            '<span style="font-size:12px;color:silver">%</span></div>'
                        },
                        tooltip: {
                            valueSuffix: ' %'
                        }
                    }]

                }));

                if ($scope.pipelineImage.cleanlinessScore && $scope.pipelineImage.cleanlinessScore[0]) {
                    if ($scope.pipelineImage.cleanlinessScore[0] > 66){
                        $scope.cleanlinessStatus = "Clean";
                    } else if ($scope.pipelineImage.cleanlinessScore[0] > 33) {
                        $scope.cleanlinessStatus = "Dirty";
                    } else {
                        $scope.cleanlinessStatus = "Very Dirty";
                    }
                    $scope.$apply();
                }
            }
        };

        $scope.drawLitterDistribution = function () {

            var detectionOptimizedResults = $scope.pipelineImage.detectionOptimizedResults,
                litterCats = {},
                litterCatsArr = [],
                name,
                y;

            if (detectionOptimizedResults && detectionOptimizedResults.length) {
                console.log("DetectionOptimizedResults", detectionOptimizedResults);
                for (var i = 0; i < detectionOptimizedResults.length; i++) {
                    name = detectionOptimizedResults[i].trueClass;
                    y = detectionOptimizedResults[i].bbArea;
                    if (litterCats[name]) {
                        litterCats[name] += y;
                    } else {
                        litterCats[name] = y;
                    }
                }
                for (var cat in litterCats) {
                    litterCatsArr.push({name: cat, y: litterCats[cat]});
                }
            }

            /* Create the Litter Distribution*/
            Highcharts.chart('container-image-litter-cat', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Litter Categories Distribution'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                series: [{
                    name: 'Litter Distribution',
                    colorByPoint: true,
                    data: litterCatsArr
                }]
            });

        };

        $scope.startCanvas = function () {

            if ($scope.pipelineImage.detectionResults) {
                //var result = JSON.parse($scope.pipelineImage.detectionResults);
                var result = $scope.pipelineImage.detectionOptimizedResults;
                var c = document.getElementById("myCanvas");
                var ctx = c.getContext("2d");

                var image = new Image();
                image.crossOrigin = "Anonymous";
                image.onload = function ()
                {
                    var imgHeight = image.height;
                    var imgWidth = image.width;
                    ctx.canvas.width = imgWidth;
                    ctx.canvas.height = imgHeight;
                    ctx.drawImage(image, 0, 0, imgWidth, imgHeight);
                    for (var j in result)
                    {
                        ctx.rect(result[j].bb.x, result[j].bb.y, result[j].bb.w, result[j].bb.h);
                        ctx.strokeStyle = "red";
                        ctx.stroke();
                        ctx.font = 'bold 10pt Calibri';
                        ctx.fillText(result[j].trueClass + "(" + (result[j].trueClassProb).toFixed(3) + ")", result[j].bb.x + 5, result[j].bb.y - 4);
                    }
                    $scope.pipelineImage.Phase3Image = c.toDataURL();
                    $scope.$apply();
                };
                image.src = $scope.pipelineImage.server_image_url;
            }
        };

        $(document).ready(function () {

            $scope.startCanvas();

            /* Initailize the Image Effects */
            $('.materialboxed').materialbox();

            $scope.drawLitterDistribution();

            $scope.cleanlinessScore();
        });

    });
