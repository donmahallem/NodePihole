importScripts("moment.min.js");
function sortByDate(asc) {
    return function (a, b) {
        return (asc ? 1 : -1) * moment.utc(a.timestamp).diff(moment.utc(b.timestamp));
    }
}
onmessage = function (e) {
    console.log("innna", e.data);
    e.data.sort(sortByDate(true));
    console.log("outa", e.data);
    postMessage(e.data);
}