module.exports = {
  filters: {
    formatDate (inputDate) {
      if (!inputDate) return '';
      const date = moment(inputDate).utcOffset(0).format('YYYY-MM-DD HH:mm');
      return `${date} UTC`;
    },
  }
}
