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

    app.iterateRegions((region) => {
        //different speaker behavior for rttm to get better DER of overlapping speakers
        if (region.data.speaker.length > 1) {
            for (let speakerId of region.data.speaker) {
                data.push(`SPEAKER <NA> <NA> ${region.start.toFixed(2)} ${(region.end.toFixed(2) - region.start.toFixed(2)).toFixed(2)} <NA> <NA> ${speakerId} <NA> <NA>`)
            }
        }   else {
            data.push(`SPEAKER <NA> <NA> ${region.start.toFixed(2)} ${(region.end.toFixed(2) - region.start.toFixed(2)).toFixed(2)} <NA> <NA> ${self.formatSpeaker(region.data.speaker)} <NA> <NA>`)
        }
    }, fileIndex, true);

    return data.join('\n');
}
