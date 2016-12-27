import xml2js from 'xml2js';
import fs from 'fs';
import eyes from 'eyes';
import _ from 'lodash';

const inspect = eyes.inspector({maxLength: false});

let parser = new xml2js.Parser({mergeAttrs: true, trim: true, explicitArray: false});

function convertFile(fileName) {

    let output = '';

    let file = fs.readFileSync(`files/${fileName}`, 'utf8');

    parser.parseString(file, (err, result) => {
        let xml = result.fcpxml.library.event.project.sequence.spine;
        delete xml.gap;

        let clips = xml.clip;

        let markers = _.flatten(clips.map(clip => {
            return clip.marker;
        }));

        let markerValues = _.uniq(markers.map(marker => {
            if (!marker) {
                return;
            }
            return marker.value;
        }));

        let finalValues = _.reject([rawFileName(fileName), ...markerValues], value => {
            return typeof value === 'undefined';
        });

        global.output = finalValues.join(', ');

        output = finalValues.join(', ');
    });

    return output;
}

function rawFileName(fileName) {
    return fileName.slice(0, fileName.indexOf('\.'));
}

fs.readdir('./files', null, (err, data) => {
    data.forEach(fileName => {
        fs.writeFile(`output/${rawFileName(fileName)}.csv`, convertFile(fileName));
    });
});


