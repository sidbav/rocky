
module.exports.ahead = (location0, location1, diff, formattedDate0, formattedTime0, formattedDate1, formattedTime1) => { 
    return `${location0} is *ahead* of ${location1} by ${diff} hours. In ${location0}, it is ${formattedDate0} and \
the time is ${formattedTime0}. In ${location1}, it is ${formattedDate1} and the time is ${formattedTime1}.`; 
}

module.exports.behind = (location0, location1, diff, formattedDate0, formattedTime0, formattedDate1, formattedTime1) => { 
    return `${location0} is *behind* of ${location1} by ${diff} hours. In ${location0}, it is ${formattedDate0} and \
the time is ${formattedTime0}. In ${location1}, it is ${formattedDate1} and the time is ${formattedTime1}.`; 
}

module.exports.noDiff = (location0, location1, formattedDate1, formattedTime0) => { 
    return `There is no difference in time betweeen ${location0} and ${location1}. Today's date in ${location0} and \
${location1} is ${formattedDate1} and the time is ${formattedTime0}.`;
}

module.exports.prob = (location0, location1) => { 
    return `Sorry, I had a problem finding out the time difference betweeen ${location0} and ${location1}.`;
}

module.exports.ahead2 = (location0, diff, formattedDateThere, formattedTimeThere, date, time) => { 
    return `${location0} is *ahead* of here by ${diff} hours. In ${location0}, it is ${formattedDateThere} and \
the time is ${formattedTimeThere}. Here the date is ${date} and the time is ${time}.`
}

module.exports.behind2 = (location0, diff, formattedDateThere, formattedTimeThere, date, time) => { 
    return `${location0} is *behind* here by ${diff} hours. In ${location0}, it is ${formattedDateThere} and the \
time is ${formattedTimeThere}. Here the date is ${date} and the time is ${time}.`
}

module.exports.noDiff2 = (location0, date, time) => { 
    return `There is no difference in time betweeen ${location0} and here. Today's date here and in ${location0} is ${date} \
    and the time is ${time}.`; 
}
