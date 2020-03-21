export function createSearchParams (searchText) {
  const searchRegex = { $regex: new RegExp(`${searchText}`, 'i') };

  return {
    $or: [
      {
        text: searchRegex,
      },
      {
        user: searchRegex,
      },
      {
        userName: searchRegex,
      },
    ],
  };
}
