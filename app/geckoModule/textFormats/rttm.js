export const parse = (data) => {
    var monologues = [];

    var lines = data.split(/\n/);
    for (var i = 0; i < lines.length; i++) {
        if (lines[i] === "") continue;

        var cells = lines[i].match(/\S+/g);
        var speaker = cells[7];
        var start = parseFloat(cells[3]);
        var duration = parseFloat(cells[4]);
        var end = start + duration;

        monologues.push({speaker: {id: speaker}, start: start, end: end, words: []});
    }

    return [ monologues ];
}

export const convert = (app, fileIndex) => {
    var self = app;
    var data = [];
    var speaker = null;

    app.iterateRegions((region) => {
        //different speaker behavior for rttm to get better DER of overlapping speakers
        if (region.data.speaker.length > 1) {
            for (let speakerId of region.data.speaker) {
                speakerId = speakerId.split(',')[0] //speakerId may contain a , because of CSV conversion
                data.push(`SPEAKER <NA> 1 ${region.start.toFixed(3)} ${(region.end.toFixed(3) - region.start.toFixed(3)).toFixed(3)} <NA> <NA> ${speakerId} <NA> <NA>`)
            }
        }   else {
            speaker = [region.data.speaker[0].split(',')[0]] //speakerId may contain comma because of CSV conversion
            data.push(`SPEAKER <NA> 1 ${region.start.toFixed(3)} ${(region.end.toFixed(3) - region.start.toFixed(3)).toFixed(3)} <NA> <NA> ${self.formatSpeaker(speaker)} <NA> <NA>`)
        }
    }, fileIndex, true);

    return data.join('\n');
}
