export const convert = (app, fileIndex) => {
    var data = [];
    var file = app.filesData[0].filename;
    var title = file.substr(0, file.lastIndexOf('.'));


    app.iterateRegions((region) => {
        var speaker_ids = [];
        for (let speakerId of region.data.speaker) {
            speakerId = speakerId.split(",")
            var speaker_id = speakerId[0]
            var speaker_name = speakerId[1]
            var csvline = `${title},${speaker_id},${speaker_name}`

            if(speaker_id[0] == '[' && speaker_id[speaker_id.length - 1] == ']'){
                console.log("TRUE")
            }
            console.log(speaker_id)
            if (speaker_id != '' && speaker_name != '' && !isNaN(speaker_id) && speakerId.length == 2
                && !speaker_ids.includes(speaker_id) || speaker_id[0] == '[' && speaker_id[speaker_id.length - 1] == ']' ) {
                   if(!data.includes(csvline) ) {
                    speaker_ids.push(speaker_id)
                    data.push(csvline)
                   }
            }
            else {
                throw "Can't save the CSV file - check your labels. Each label should be on the form: speaker id,speaker name"
            }

        }
    }, fileIndex, true);

    return data.join('\n');
}