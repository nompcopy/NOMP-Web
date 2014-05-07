// utils.js

/*
 * Equal to 'for in' statement in python
 */
Array.prototype.contains = function(item){
    return RegExp(item).test(this);
};

/*
 * Worthless words to eliminate during 
 * the process of generation of keywords
 * TODO: improve this list
 */
exports.worthlesswords = [
    'le', 'la', 'au', 'du', 'un', 'une', 'de', 'les', 'aux', 'des',
    'et', 'ou', 'où', 'donc', 'mais', 'ni', 'car', 'parceque', 'comme',
    'or', 'ni', 'quand', 'si', 'lorsque', 'quoique', 'puisque',
    'que', 'quel', 'quelle', 'auquelle', 'auxquelles', 'duquelle', 'desquelles',
    'alors', 'afin', 'tandis', 'sans', 'avec', 'autant', 'aussi', 'tel', 'autre',
    'moins', 'plus', 'à', 'selon', 'suivant', 'ici', 'depuis', 'chaque',
    'ses', 'leur', 'son', 'sa', 'ma', 'mon', 'mes', 'leurs',
    'quelque', 'quelques', 'certain', 'certains',
    'suis', 'est', 'somme', 'etes',
    'je', 'me', 'tu', 'te', 'il', 'lui', 'elle', 'vous', 'nous',
    'c\'est',
    'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'I', 'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'from', 'or', 'which', 'one', 'would', 'all', 'will', 'there', 'say', 'who', 'make', 'when', 'can', 'more', 'if', 'no', 'man', 'out', 'other', 'so', 'what', 'up', 'go', 'about', 'than', 'into', 'could', 'state', 'only', 'new', 'year', 'some', 'take', 'come', 'these', 'use', 'get', 'like', 'then', 'first', 'any', 'work', 'now', 'may', 'such', 'give', 'over', 'think', 'most', 'even', 'find', 'day', 'also', 'after', 'way', 'many', 'must', 'look', 'before', 'great', 'through', 'long', 'where', 'much', 'should', 'well', 'people', 'down', 'own', 'just', 'because', 'good', 'each', 'those', 'feel', 'seem', 'how', 'high', 'too', 'little', 'world', 'very', 'still', 'old', 'tell', 'become', 'here', 'show', 'both', 'between', 'need', 'under', 'last', 'right', 'move', 'thing', 'general', 'never', 'same', 'another', 'begin', 'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'want', 'point', 'form', 'off', 'few', 'small', 'since', 'against', 'ask', 'late', 'large', 'end', 'open', 'follow', 'during', 'present', 'without', 'again', 'hold', 'around', 'however', 'keep', 'early', 'once', 'upon', 'every', 'let', 'side', 'try', 'until', 'far', 'always', 'away', 'toward', 'though', 'less', 'enough', 'almost', 'nothing', 'yet', 'better', 'near', 'per', 'often', 'within', 'along', 'best',
    'av', 'ave', 'st', 'str'
    ]


/*
 * Recursively merge properties of two objects 
 * This function will merge the CurrentObj to ParentObj
 * And overwrite the properties if exist in ParentObj
 * Then return the new tmpObjet to CurrentObj
 * Finish the job of inheritances
 */
exports.mergeObjects = function mergeObjects(CurrentObj, parentObj) {
    var tmpObj = this.clone(parentObj);
    for (var p in CurrentObj) {
        try {
          // Property in destination object set; update its value.
          if ( CurrentObj[p].constructor==Object ) {
              tmpObj[p] = mergeObjects(tmpObj[p], CurrentObj[p]);
          }
          else {
              tmpObj[p] = CurrentObj[p];
          }
        } catch(e) {
          // Property in destination object not set; create it and set its value.
          tmpObj[p] = CurrentObj[p];
        }
    }
    return tmpObj;
}


/*
 * Deep Clone function
 */
exports.clone = function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

/*
 * concatenation two array with unique elements
 * array3 = array2.concat(array1).distinct
 */
exports.union_arrays = function union_arrays(x, y) {
    var obj = {};
    for (var i = x.length-1; i >= 0; -- i) {
        obj[x[i]] = x[i];
    }
    for (var i = y.length-1; i >= 0; -- i) {
        obj[y[i]] = y[i];
    }
    var res = []
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            res.push(obj[k]);
        }
    }
    return res;
}

// Bubble sort
exports.sortArrayObjectByProperty = function sortArrayObjectByProperty(property, tickets) {
    var i = tickets.length;
    var j;
    var tmp = {};
    while (i>0) {
        for (j=0; j<i-1; j++) {
            if (tickets[j][property] < tickets[j+1][property]) {
                tmp = tickets[j];
                tickets[j] = tickets[j+1];
                tickets[j+1] = tmp;
            }
        }
        i--;
    }
    return tickets;
}


exports.findObjectById = function findObjectById(value, arr) {
    for (var index=0; index<arr.length; index++) {
        var obj = arr[index];
        if (obj._id.toString() === value.toString()) {
            return obj;
        }
    }
    return null;
}


/*
 * Formats mongoose errors into new array
 */
exports.errors = function(errors) {
    var keys = Object.keys(errors)
    var errs = [];
    if (!keys) {
        return ['Oops! There was an error'];
    }
    keys.forEach(function(key) {
        errs.push(errors[key].message);
    });
    return errs;
}


exports.betweenDates = function(start, end, origin) {
    return (origin.valueOf() >= start.valueOf() && origin.valueOf() <= end.valueOf);
}


exports.makeRef = function() {
    var ref = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        ref += possible.charAt(Math.floor(Math.random() * possible.length));

    return ref;
}


exports.getTicketType = function(ticket) {
    if (ticket.__t === 'NeedModel') {
        tmp_type = ticket.__t.substr(0,4).toLowerCase()
    } else {
        tmp_type = ticket.__t.substr(0,5).toLowerCase()
    }
    return tmp_type;
}



exports.sanizatePunctuations = function sanizatePunctuations(text) {
    return text.replace(/[\'\"\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, '');
}

exports.sanizateText = function sanizateText(text) {
    // numbers
    text = text.replace(/\d/g, '');
    // punctuations
    text = text.replace(/[\'\"\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    // single character
    text = text.replace(/\\b[a-z]\\b ?/g)

    return text;
}

/*
 * { word: word, score: score }
 */
exports.checkExisting = function checkExisting(word, list, field) {
    if (list.length === 0) {
        return -1;
    }
    for (var index=0; index<list.length; index++) {
        if (list[index][field].indexOf(word) > -1) {
            return index;
        }
    }
    return -1;
}

exports.computekeywords = function computekeywords(text, keywords, score) {
    // title block
    var text = text.toLowerCase();
    text = this.sanizateText(text);
    text_arr = text.split(' ');
    for (var index=0; index<text_arr.length; index++) {
        if (this.worthlesswords.indexOf(text_arr[index]) < 0) {
            var position = this.checkExisting(text_arr[index], keywords, 'word');
            // console.log(position);
            if (position === -1) {
                keywords.push({
                    word: text_arr[index],
                    score: score
                });
            }
            else {
                keywords[position].score += score;
            }
        }
    }
    return keywords;
}

exports.removeScores = function removeScores(field, list) {
    var arr = [];
    for (var index=0; index<list.length; index++) {
        arr.push(list[index][field]);
    }
    return arr;
}


exports.generateKeywords = function generateKeywords(title, description) {
    var keywords = []
    keywords = this.computekeywords(title, keywords, 1);
    keywords = this.computekeywords(description, keywords, 0.1);

    // In general the list is already sorted
    keywords = this.sortArrayObjectByProperty('score', keywords);

    return this.removeScores('word', keywords);
}


exports.smartFetchFields = function(ticket, text, list, field_id, field_name) {
    // strip text
    text = this.sanizatePunctuations(text);
    // crash to array
    text = text.split(' ');
    var score = 0;
    for (var index_text=0; index_text<text.length; index_text++) {
        if (text[index_text] == '') {
            continue;
        }
        // search in array
        for (var index_list=0; index_list<list.length; index_list++) {
            if (list[index_list].name.indexOf(text[index_text] > -1)) {
                score ++;
            }
            if ((text.length === 1 && score > 0)
                || (text.length > 1 && score > 1)) {
                ticket[field_id] = list[index_list]._id;
                ticket[field_name] = list[index_list].name;
                return ticket;
            }
        }

    }
    return ticket;
}

// Only used for an array of ticket
/*
    arr: [{
        ticket: ticket,
        score: score,
    }]

 */
exports.findItemIndexInArray = function(query_id, arr) {
    for (var index=0; index<arr.length; index++) {
        if (arr[index].ticket._id.toString() == query_id.toString()) {
            return index;
        }
    }
    return false;
}

// [ { _id: 53550ec7fa5e20f414aadaeb } ]
exports.getIdsArray = function(arr) {
    var results = [];
    for (var index=0; index<arr.length; index++) {
        results.push(arr[index]._id);
    }
    return results;
}


exports.getDistance = function(source, target) {
    var R = 6371;
    var dLat = deg2rad(target.lat - source.lat);
    var dLng = deg2rad(target.lng - source.lng);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(source.lat)) * Math.cos(deg2rad(target.lat)) *
        Math.sin(dLng/2) * Math.sin(dLng/2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

exports.geocode2xy = function(target, origin) {
    var xy = {x: 0, y: 0};
    var R = 6371;
    
    // lat => y
    var dLat = deg2rad(target.lat - origin.lat);
    xy.y = 2 * R * Math.sin(dLat / 2) * Math.cos(dLat / 2);
    xy.y = xy.y.toFixed(2);
    
    // lng => x
    var r = R * Math.cos(deg2rad(target.lat));
    var dLng = deg2rad(target.lng - origin.lng);
    xy.x = 2 * r * Math.sin(dLng / 2) * Math.cos(dLng / 2);
    xy.x = xy.x.toFixed(2);
    
    return xy;
}
