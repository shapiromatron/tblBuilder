/*

To implement:
http://stackoverflow.com/questions/5849402/

In production:
mongo localhost:27017/iarc underscore.js removeControlCharacters.js

To use in development:
mongo localhost:3001/meteor underscore.js removeControlCharacters.js
*/

var changes = [],
    removeControl = function(txt){
        // remove control characters (except \n)
        //   - http://stackoverflow.com/questions/21284228/
        //   - http://www.utf8-chartable.de/
        var new_txt = txt.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, "");
        if (txt !== new_txt) return [txt, new_txt];
    }, checkObject = function(Collection, obj){
        var originals = {},
            updates = {}, tmp;

        _.each(obj, function(val, key){
            tmp = undefined;
            if(typeof(val) === "string"){
                tmp = removeControl(val);
            } else if(val instanceof Array){
                if(val.length>0){
                    if(typeof(val[0]) === "string"){
                        tmp = checkArrayOfStrings(val);
                    } else if (val[0] instanceof Object){
                        tmp = checkArrayOfObjects(val);
                    }
                }
            }
            if(tmp !== undefined) {
                originals[key] = tmp[0];
                updates[key] = tmp[1];
            }
        });
        if(_.keys(updates).length>0){
            changes.push({
                "collection": Collection.name.toString(),
                "_id": obj._id,
                "original": originals,
                "modified": updates
            });

            Collection.update(
                {"_id": obj._id},
                {$set: updates},
                {multi: false});
        }
    }, checkCollection = function(Collection){
        Collection.find().forEach(function(obj){
            checkObject(Collection, obj);
        });
    }, checkArrayOfStrings = function(arr){
        var changed = false,
            newArr = [], tmp;
        arr.forEach(function(v){
            if(typeof(v) === "string"){
                tmp = removeControl(v);
                if(tmp){
                    changed = true;
                    newArr.push(tmp[1]);
                } else {
                    newArr.push(v);
                }
            } else {
                newArr.push(v);
            }
        });
        if (changed) return [arr, newArr];
    }, checkArrayOfObjects = function(arr){
        // note: only works with a shallow-object
        var changed = false,
            newArr = [],
            newObj, tmp;

        arr.forEach(function(obj){
            newObj = _.clone(obj);
            _.each(obj, function(val, key){
                tmp = undefined;
                if(typeof(val) === "string"){
                    tmp = removeControl(val);
                    if(tmp !== undefined){
                        changed = true;
                        newObj[key] = tmp[1];
                    }
                }
            });
            newArr.push(newObj);
        });
        if (changed) return [arr, newArr];
    };

db.getCollectionNames().forEach(function(v){
    checkCollection(db.getCollection(v));
});
print(JSON.stringify(changes, null, "\t"));
