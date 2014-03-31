// utils.js

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
    'c\'est'
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


exports.sortObject = function sortObject(obj) {
    var arr = [];
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort(function(a, b) { return a.value - b.value; });
    //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
    return arr;
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
 * Equal to 'for in' statement in python
 */
Array.prototype.contains = function(item){
    return RegExp(item).test(this);
};
