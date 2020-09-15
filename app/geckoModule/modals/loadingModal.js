import Swal from 'sweetalert2'

import { ZOOM, TRANSCRIPT_EXTENSIONS, COMPARSION_EXTENSIONS } from '../constants'
import loadDraftModal from './loadDraftModal'
import { formatTime } from '../utils'

var demoJson = require('../../../samples/demo.json')

import demoCTMFirst from '../../../samples/demo1.ctm'
import demoCTMSecond from '../../../samples/demo2.ctm'

const audioModalTemplate = require('ngtemplate-loader?requireAngular!html-loader!../templates/selectAudioModal.html')

export default (parent) => {
    const modal = {
        templateUrl: audioModalTemplate,
        backdrop: 'static',
        controller: async ($scope, $uibModalInstance, $timeout, zoom) => {
            $scope.draftAvailable = false
            $scope.isLoading = false
            $scope.newSegmentFiles = [undefined]

            $scope.isComparsionMode = false
            $scope.isComparsionModeValid = false

            $scope.transcriptFiles = []
            
            if (parent.config.enableDrafts && parent.dataBase) {
                const draftCounts = await parent.dataBase.getCounts(0)
                if (draftCounts) {
                    parent.$timeout(() => {
                        $scope.draftAvailable = true
                    })
                }
            }
 
            $scope.runDemo = async () => {
                if ($scope.isLoading) {
                    return
                }

                $scope.isLoading = true

                parent.init()

                if ($scope.isComparsionMode) {
                    const demoFileCTMFirst = {
                        filename: 'demo1.ctm',
                        data: parent.handleTextFormats('demo1.ctm', demoCTMFirst)[0]
                    }
    
                    const demoFileCTMSecond = {
                        filename: 'demo2.ctm',
                        data: parent.handleTextFormats('demo2.ctm', demoCTMSecond)[0]
                    }
                    
                    parent.filesData = [
                        demoFileCTMFirst,
                        demoFileCTMSecond
                    ]
                } else {
                    const demoFileJSON = {
                        filename: 'demo.json',
                        data: parent.handleTextFormats('demo.json', JSON.stringify(demoJson))[0]
                    }

                    parent.filesData = [
                        demoFileJSON
                    ]
                }
                
                parent.audioFileName = 'demo.mp3';
                parent.loader = true
                parent.comparsionMode = true
                $uibModalInstance.close(false)

                const res = await parent.dataManager.loadFileFromServer({
                    audio: {
                        url: 'https://raw.githubusercontent.com/gong-io/gecko/master/samples/demo.mp3'
                    },
                    transcripts: []
                })
                if (parent.config.enableDrafts && parent.dataBase) {
                    const demoDraft = await parent.dataBase.createDraft({
                        mediaFile: {
                            name: 'demo.mp3',
                            data: res.audioFile
                        },
                        files: parent.filesData,
                        draftType: 0
                    })
                    parent.currentDraftId = demoDraft
                    parent.lastDraft = formatTime(new Date())
                }

                parent.wavesurfer.loadBlob(res.audioFile)
                $scope.isLoading = false
            };

            $scope.loadDraft = async () => {
                // $uibModalInstance.close(false)
                // parent.loadDraft()
                if (parent.dataBase) {
                    const drafts = await parent.dataBase.getDrafts(0)
                    const modalInstance = parent.$uibModal.open(loadDraftModal(parent, drafts))
                    modalInstance.result.then(async (res) => {
                        if (res) {
                            $uibModalInstance.close(false)
                            parent.loadDraft(res)
                        }
                    });
                }
                           
            };

            $scope.ok = () => {
                var call_from_url;
                if ($scope.chosen_call_id) {
                    if ($scope.chosen_call_id.length !== 1) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Please choose only one call'
                        })
                        return;
                    }
                    call_from_url = $scope.chosen_call_id[0];
                }

                $uibModalInstance.close({
                    audio: $scope.mediaFile,
                    call_from_url: call_from_url,
                    segmentsFiles: $scope.transcriptFiles,
                    zoom: $scope.zoom,
                    comparsion: $scope.isComparsionMode
                });
            };

            $scope.zoom = zoom;

            $scope.selectFiles = () => {
                inputAudio.value = "";
                inputAudio.click();
            };

            $scope.removeMedia = () => {
                $scope.mediaFile = null
            }

            $scope.removeTranscript = (index) => {
                $scope.transcriptFiles.splice(index, 1)
            }

            $scope.checkMediaFile = () => {
                const reader = new FileReader()
                reader.onload = (event) => {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    try {
                        audioContext.decodeAudioData(event.target.result).then((buffer) => {
                        }).catch(e => {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Audio decoding error',
                                text: e
                            })
                        });
                    } catch (e) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Audio decoding error',
                            text: e
                        })
                    }
                };
                reader.readAsArrayBuffer($scope.mediaFile)
            }

            $scope.handleFiles = (extrafiles) => {
                $timeout(() => {
                    const allFiles = [ $scope.newFile, ...extrafiles ] 
                    const mediaFiles = []
                    allFiles.forEach((f) => {
                        if (f.type.includes('video') || f.type.includes('audio')) {
                            mediaFiles.push(f)
                        } else {
                            const ext = f.name.split('.').pop()
                            if ($scope.isComparsionMode) {
                                if (COMPARSION_EXTENSIONS.includes(ext)) {
                                    const alreadyAdd = $scope.transcriptFiles.find((tf) => {
                                        return tf.name === f.name
                                    })
    
                                    if (!alreadyAdd) {
                                        if ($scope.transcriptFiles.length < 2) {
                                            $scope.transcriptFiles.push(f)
                                        } else {
                                            Swal.fire({
                                                icon: 'warning',
                                                title: 'Please select only two transcript files in comparsion mode'
                                            })
                                        }
                                    }
                                }
                            } else {
                                if (TRANSCRIPT_EXTENSIONS.includes(ext)) {
                                    const alreadyAdd = $scope.transcriptFiles.find((tf) => {
                                        return tf.name === f.name
                                    })
    
                                    if (!alreadyAdd) {
                                        $scope.transcriptFiles.push(f)
                                    }
                                }
                            }
                        }
                    })

                    if (mediaFiles.length > 1 || (mediaFiles.length === 1 && $scope.mediaFile)) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Please select only one media file'
                        })
                    } else if (mediaFiles.length === 1) {
                        $scope.mediaFile = mediaFiles.pop()
                        $scope.checkMediaFile()
                    }
                })
            }

            $scope.loadUrls = () => {
                var filename = $scope.newFile.name;
                var ext = filename.substr(filename.lastIndexOf('.') + 1);
                if (ext === 'json') {
                    var reader = new FileReader();

                    reader.onload = (e) => {
                        $scope.$evalAsync(() => {
                            $scope.call_urls = JSON.parse(e.target.result)
                                .map((x) => {
                                    var k = Object.keys(x)[0];
                                    return {'id': k, 'url': x[k]}
                                });
                        });
                    };

                    reader.readAsText($scope.newFile);
                } else {
                    $scope.$evalAsync(() => {
                        $scope.call_urls = undefined;
                        $scope.chosen_call_id = undefined;
                    });
                }
            };

            $scope.cancel = () => {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.checkComparsionFiles = () => {
                const unsupportedFiles = $scope.transcriptFiles.filter(f => {
                    const ext = f.name.split('.').pop()
                    if (!COMPARSION_EXTENSIONS.includes(ext)) {
                        return true
                    }
                    return false
                })
                if ($scope.transcriptFiles.length > 2) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Please select only two transcript files in comparsion mode'
                    })

                    return false
                } else if (unsupportedFiles.length) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'You can select only JSON or CTM files in comparsion mode'
                    })

                    return false
                }

                return true
            }

            $scope.$watch('isComparsionMode', (newValue) => {
                if (newValue) {
                    $scope.isComparsionModeValid = $scope.checkComparsionFiles()
                    if (!$scope.isComparsionModeValid) {
                        $scope.isComparsionMode = false
                    }
                }
            })

            $scope.$watchCollection('transcriptFiles', () => {
                if ($scope.isComparsionMode) {
                    $scope.isComparsionModeValid = $scope.checkComparsionFiles()
                }
            })
        },
        resolve: {
            zoom: () => {
                return ZOOM;
            }
        }
    }

    modal.controller.$inject = ['$scope', '$uibModalInstance', '$timeout', 'zoom']

    return modal
}