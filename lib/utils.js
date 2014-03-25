// utils.js

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