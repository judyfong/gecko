export const convert = (app, fileIndex) => {
    var data = [];
    var file = app.filesData[0].filename
    var title = file.substr(0, file.lastIndexOf('.'))

    app.iterateRegions((region) => {
        
        for (let speakerId of region.data.speaker) {
            speakerId = speakerId.replace(/\s/g, '').split(",")
            if(speakerId[1] != undefined && speakerId != '') {
                var speaker_id = speakerId[0]
                var speaker_name = speakerId[1]

                data.push(`${title},${speaker_id},${speaker_name}`)
            }

            else {
                console.log(speakerId)
                console.log("CSV ERROR!")
                break;
            }
          
            }
    }, fileIndex, true);

    return data.join('\n');
}