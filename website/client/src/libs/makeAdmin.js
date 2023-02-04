function notify (item){
    if (item != null) {
        if (item.success === true)
            console.log(item.text);
        else console.log('Fail to complete')
        return item;
    }
    else return 'noData';
};

module.exports = {
    notify,
}