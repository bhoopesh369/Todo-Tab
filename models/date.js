module.exports = getDate;

function getDate(){
    var today = new Date();
    dayNum = today.getDay();
    var day;

    var options = {
        weekday : 'long' ,
        month : 'long',
        day : 'numeric'
    };

    day = today.toLocaleDateString('en-US', options);

    return day;
}